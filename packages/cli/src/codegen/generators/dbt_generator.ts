import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { type AST, type EventSchema } from '@syftdata/common/lib/types';
import { createDir, getSQLFriendlyEventName, logInfo } from '../../utils';
import DbtTemplate from '../templates/dbt_project';
import DbtSampleProfile from '../templates/dbt_sample_profile';
import * as extraSchemas from '../templates/dbt_extra_schema';
import {
  type BigQueryConfig,
  type ProviderConfig
} from '../../config/sink_configs';
import { SyftEventType } from '@syftdata/common/lib/client_types';

// HACK: ignore user identity and index too. they don't exist in BQ yet.
const EXCLUDED = ['UserIdentity', 'Index', 'TrackedEvent', 'PageEvent'];
function ignoreSchema(schema: EventSchema): boolean {
  if (!(schema.exported ?? false)) return true;
  if (EXCLUDED.includes(schema.name)) return true;
  return false;
}

function getModelName(dataset: string, event: string): string {
  return `stg_${event}`;
}

function getEventModel(ast: AST, schema: EventSchema): object {
  const eventName = getSQLFriendlyEventName(schema.name);
  const modelName = getModelName(ast.config.projectName, eventName);
  return {
    name: modelName,
    description: schema.documentation,
    columns: schema.fields.map((field) => {
      const column = {
        name: field.name,
        description: field.documentation,
        tests: [] as string[]
      };
      if (!field.isOptional) {
        column.tests.push('not_null');
      }
      return column;
    })
  };
}

function generateConfigYaml(ast: AST, destinationDir: string): void {
  const models = ast.eventSchemas
    .filter((val) => !ignoreSchema(val))
    .map((val) => getEventModel(ast, val));

  fs.writeFileSync(
    path.join(destinationDir, 'models', 'schema.yml'),
    yaml.dump({
      models,
      version: 2
    })
  );
}

function generateColumns(schema: EventSchema): string {
  return schema.fields.map((field) => field.name).join(',\n');
}

function generateModel(
  name: string,
  schema: EventSchema,
  bqConfig: BigQueryConfig
): string {
  return `
SELECT

${generateColumns(schema)}

FROM \`${bqConfig.projectId}\`.${bqConfig.dataset}.${name}
  `;
}

function generateModels(
  ast: AST,
  destinationDir: string,
  bqConfig: BigQueryConfig
): void {
  ast.eventSchemas.forEach((schema) => {
    if (ignoreSchema(schema)) return;

    const eventName = getSQLFriendlyEventName(schema.name);
    fs.writeFileSync(
      path.join(
        destinationDir,
        'models',
        `${getModelName(ast.config.projectName, eventName)}.sql`
      ),
      generateModel(eventName, schema, bqConfig)
    );
  });
}

// TODO: Memoize
function getDbtProjectTemplate(): HandlebarsTemplateDelegate<any> {
  return handlebars.compile(DbtTemplate, { noEscape: true });
}

// TODO: Memoize
function getSampleProfleTemplate(): HandlebarsTemplateDelegate<any> {
  return handlebars.compile(DbtSampleProfile, { noEscape: true });
}

function generateDbtProject(ast: AST): string {
  const template = getDbtProjectTemplate();
  return template({
    project_name: ast.config.projectName,
    schema_version: ast.config?.version ?? '0.0.1',
    profile: ast.config.projectName
  });
}

function generateSampleProfile(ast: AST, bqConfig: BigQueryConfig): string {
  const template = getSampleProfleTemplate();
  return template({
    profile: ast.config.projectName,
    project: bqConfig.projectId,
    dataset: bqConfig.dataset
  });
}

function addSegmentSchemas(ast: AST): void {
  ast.eventSchemas.forEach((schema) => {
    extraSchemas.BQ_SEGMENT_SCHEMA.forEach((obj) =>
      schema.fields.push({
        name: obj.name,
        type: { name: obj.type, zodType: 'z.string()' },
        documentation: obj.description,
        isOptional: false
      })
    );
  });
}

function addHeapSchemas(ast: AST, platform: string): void {
  // add extra schema per event
  ast.eventSchemas.forEach((schema) => {
    extraSchemas.BQ_HEAP_EVENT_SCHEMA_ALL.forEach((obj) =>
      schema.fields.push({
        name: obj.name,
        type: { name: obj.type, zodType: 'z.string()' },
        documentation: obj.description,
        isOptional: false
      })
    );

    let extraSchema;
    if (platform === 'Web') {
      extraSchema = extraSchemas.BQ_HEAP_EVENT_SCHEMA_WEB;
    } else if (platform === 'iOS') {
      extraSchema = extraSchemas.BQ_HEAP_EVENT_SCHEMA_IOS;
    } else if (platform === 'Android') {
      extraSchema = extraSchemas.BQ_HEAP_EVENT_SCHEMA_ANDROID;
    } else {
      throw new Error(
        'Platform needs to be specified for HeapIO: [Web, iOS, Android]'
      );
    }
    extraSchema.forEach((obj) =>
      schema.fields.push({
        name: obj.name,
        type: { name: obj.type, zodType: 'z.string()' },
        documentation: obj.description,
        isOptional: false
      })
    );
  });

  // creating new event schema to cover the default user, sessions, and pageview tables.
  // https://help.heap.io/heap-connect/heap-connect-guide/data-schema/#schema
  const users: EventSchema = {
    name: 'users',
    zodType: 'z.object({})',
    fields: [],
    traits: [],
    eventType: SyftEventType.IDENTIFY // HACK
  };
  extraSchemas.BQ_HEAP_USERS_SCHEMA.forEach((obj) =>
    users.fields.push({
      name: obj.name,
      type: { name: obj.type, zodType: 'z.string()' },
      documentation: obj.description,
      isOptional: false
    })
  );

  const sessions: EventSchema = {
    name: 'sessions',
    zodType: 'z.object({})',
    fields: [],
    traits: [],
    eventType: SyftEventType.TRACK // HACK
  };
  extraSchemas.BQ_HEAP_SESSIONS_SCHEMA_ALL.forEach((obj) =>
    sessions.fields.push({
      name: obj.name,
      type: {
        name: obj.type,
        zodType: 'z.string()'
      },
      documentation: obj.description,
      isOptional: false
    })
  );

  let extraSchema;
  if (platform === 'Web') {
    extraSchema = extraSchemas.BQ_HEAP_SESSIONS_SCHEMA_WEB;
  } else if (platform === 'iOS') {
    extraSchema = extraSchemas.BQ_HEAP_SESSIONS_SCHEMA_IOS;
  } else if (platform === 'Android') {
    extraSchema = extraSchemas.BQ_HEAP_SESSIONS_SCHEMA_ANDROID;
  } else {
    throw new Error(
      'Platform needs to be specified for HeapIO: [Web, iOS, Android]'
    );
  }
  extraSchema.forEach((obj) =>
    sessions.fields.push({
      name: obj.name,
      type: {
        name: obj.type,
        zodType: 'z.string()'
      },
      documentation: obj.description,
      isOptional: false
    })
  );

  const pageviews: EventSchema = {
    name: 'pageviews',
    zodType: 'z.object({})',
    fields: [],
    traits: [],
    eventType: SyftEventType.PAGE // HACK
  };

  extraSchemas.BQ_HEAP_PAGEVIEWS_SCHEMA_ALL.forEach((obj) =>
    pageviews.fields.push({
      name: obj.name,
      type: {
        name: obj.type,
        zodType: 'z.string()'
      },
      documentation: obj.description,
      isOptional: false
    })
  );

  if (platform === 'Web') {
    extraSchema = extraSchemas.BQ_HEAP_PAGEVIEWS_SCHEMA_WEB;
  } else if (platform === 'iOS') {
    extraSchema = extraSchemas.BQ_HEAP_PAGEVIEWS_SCHEMA_IOS;
  } else if (platform === 'Android') {
    extraSchema = extraSchemas.BQ_HEAP_PAGEVIEWS_SCHEMA_ANDROID;
  } else {
    throw new Error(
      'Platform needs to be specified for HeapIO: [Web, iOS, Android]'
    );
  }
  extraSchema.forEach((obj) =>
    pageviews.fields.push({
      name: obj.name,
      type: {
        name: obj.type,
        zodType: 'z.string()'
      },
      documentation: obj.description,
      isOptional: false
    })
  );

  ast.eventSchemas.push(users, sessions, pageviews);
}

function addExtraSchemasForProvider(
  ast: AST,
  providerConfig: ProviderConfig
): void {
  if (providerConfig.destination === 'Segment') {
    addSegmentSchemas(ast);
  } else if (providerConfig.destination === 'Heap') {
    addHeapSchemas(ast, providerConfig.platform as string);
  } else {
    throw new Error('Destination needs to be specified: [Segment, Heap]');
  }
}

export function generate(
  ast: AST,
  destinationDir: string,
  bqConfig: BigQueryConfig,
  providerConfig: ProviderConfig
): void {
  createDir(destinationDir);
  createDir(path.join(destinationDir, 'models'));
  createDir(path.join(destinationDir, 'target'));
  createDir(path.join(destinationDir, 'macros'));
  createDir(path.join(destinationDir, 'seeds'));
  createDir(path.join(destinationDir, 'snapshots'));
  createDir(path.join(destinationDir, 'tests'));
  createDir(path.join(destinationDir, 'analyses'));

  // add extra schemas per provider
  addExtraSchemasForProvider(ast, providerConfig);

  logInfo(`Generating DBT project file..`);
  fs.writeFileSync(
    path.join(destinationDir, 'dbt_project.yml'),
    generateDbtProject(ast)
  );

  logInfo(`Generating sample DBT profiles file..`);
  fs.writeFileSync(
    path.join(destinationDir, 'profiles.yml'),
    generateSampleProfile(ast, bqConfig)
  );

  logInfo(`Generating DBT models..`);
  generateModels(ast, destinationDir, bqConfig);

  logInfo(`Generating documentation..`);
  generateConfigYaml(ast, destinationDir);
  logInfo(`:sparkles: DBT models are generated successfully!`);
}
