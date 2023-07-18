import {
  type AST,
  type EventSchema,
  type Field
} from '@syftdata/common/lib/types';
import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';
import { SyftEventType } from '@syftdata/common/lib/client_types';
import { capitalize, logVerbose } from '@syftdata/common/lib/utils';

function getEventSchemasFromFolder(folder: string): EventSchema[] {
  const files = glob.sync(folder + '/**/*', {
    nodir: true
  });
  logVerbose('Searching for spec files under ' + folder);

  const models = new Map<string, EventSchema>();
  const modelFields = new Map<string, Set<string>>();

  const getOrAddModel = (name: string, exported: boolean): EventSchema => {
    if (models.has(name)) {
      return models.get(name) as EventSchema;
    }

    const model: EventSchema = {
      name,
      zodType: 'z.object({})',
      fields: [],
      eventType: SyftEventType.TRACK,
      documentation: `This model generates the "${name
        .replace(/([A-Z])/g, ' $1')
        .trim()}" event.`,
      exported
    };
    models.set(name, model);
    modelFields.set(name, new Set<string>());
    return model;
  };

  const addFieldIfPossible = (modelName: string, field: Field): void => {
    const model = getOrAddModel(modelName, false);
    const existingFields = modelFields.get(modelName);
    const fieldNameComps = field.name.split('?');
    if (existingFields?.has(fieldNameComps[0]) === true) {
      return;
    }
    existingFields?.add(fieldNameComps[0]);
    if (fieldNameComps.length > 1) {
      field.name = fieldNameComps[0];
      field.isOptional = true;
    }
    model.fields.push(field);
  };

  const schemas: EventSchema[] = files.map((file) => {
    const name = path.basename(file);
    logVerbose('Reading schema file: ' + file);
    const capitalName = capitalize(name);
    const model = getOrAddModel(capitalName, true);

    let eventType = SyftEventType.TRACK;
    const contents = fs.readFileSync(file, 'utf8');
    const fieldLines = contents
      .split('\n')
      .map((line) => line.trim().split('\t'));

    const specTypeLines = fieldLines.filter((line) =>
      line[0].startsWith('spec_')
    );
    // Schemas have a special syntax for arrays. We need to convert it to a
    // TypeScript array type. also create a submodel for the array type.
    // e.g. `foo.$.bar` -> `Foo[]` where `Foo` is a submodel and has bar as a field.
    const subModelLines = fieldLines.filter((line) => line[0].includes('.'));
    const validFieldLines = fieldLines.filter(
      (line) =>
        line[0] !== '' && !line[0].startsWith('spec_') && !line[0].includes('.')
    );
    validFieldLines.forEach((line) => {
      let [name, type, documentation] = line;
      if (type === 'String' || type === 'Number' || type === 'Boolean') {
        type = type.toLocaleLowerCase();
      }
      addFieldIfPossible(capitalName, {
        name,
        type: {
          name: type,
          zodType: 'z.string()',
          isArray: false
        },
        isOptional: false,
        documentation
      });
    });

    subModelLines.forEach((line) => {
      let [fullname, type, documentation] = line;
      const isArray = fullname.includes('.$.');
      let [_subModelName, name] = fullname.split('.');
      if (isArray) {
        [_subModelName, name] = fullname.split('.$.');
      }
      const subModelName = capitalize(_subModelName);
      if (type === 'String' || type === 'Number' || type === 'Boolean') {
        type = type.toLocaleLowerCase();
      }
      addFieldIfPossible(subModelName, {
        name,
        type: {
          name: type,
          zodType: 'z.string()',
          isArray: false
        },
        isOptional: false,
        documentation
      });

      if (isArray) {
        addFieldIfPossible(capitalName, {
          name: _subModelName,
          type: {
            name: `${subModelName}[]`,
            zodType: 'z.array()',
            isArray: true
          },
          isOptional: false,
          documentation
        });
      } else {
        addFieldIfPossible(capitalName, {
          name: _subModelName,
          type: {
            name: `${subModelName}`,
            zodType: 'z.object()',
            isArray: false
          },
          isOptional: false,
          documentation
        });
      }
    });

    if (specTypeLines.length > 0) {
      specTypeLines.forEach((specTypeData) => {
        if (specTypeData[0] === 'spec_type') {
          if (specTypeData.length > 1) {
            const eventTypeStr = specTypeData[1].toLocaleUpperCase();
            eventType = SyftEventType[eventTypeStr];
          }
        } else if (specTypeData[0] === 'spec_description') {
          if (specTypeData.length > 1) {
            model.documentation = specTypeData[1];
          }
        }
      });
    }
    model.eventType = eventType;

    return model;
  });

  return [...models.values(), ...schemas];
}

export function getEventShemas(platform: string, product: string): AST {
  let eventSchemas: EventSchema[] = getEventSchemasFromFolder(
    path.join(__dirname, '../../assets/models', platform)
  );
  eventSchemas = eventSchemas.concat(
    getEventSchemasFromFolder(
      path.join(__dirname, '../../assets/models/common')
    )
  );

  if (product != null) {
    eventSchemas = eventSchemas.concat(
      getEventSchemasFromFolder(
        path.join(__dirname, '../../assets/models', product)
      )
    );
  }

  // de-duplicate schemas
  const schemaNames = new Set<string>();
  eventSchemas = eventSchemas.filter((schema) => {
    if (schemaNames.has(schema.name)) {
      return false;
    }
    schemaNames.add(schema.name);
    return true;
  });

  return {
    config: {
      version: '0.0.1',
      projectName: 'test'
    },
    eventSchemas,
    sinks: []
  };
}
