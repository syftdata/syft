import { type ClassDeclaration, type Project, type SourceFile } from 'ts-morph';
import { type EventSchema, type TypeField } from '@syftdata/common/lib/types';
import { SyftEventType } from '@syftdata/common/lib/client_types';
import { logError, logVerbose } from '@syftdata/common/lib/utils';
import { getTypeSchema } from './ts_morph_utils';
import { getZodTypeForSchema } from './zod_utils';
import { extractEventProperties } from './decorators';

export function getEventSchema(
  project: Project,
  classObj: ClassDeclaration
): EventSchema {
  const name = classObj.getNameOrThrow();
  logVerbose(`Parsing event: ${name}`);
  const typeSchema = getTypeSchema(classObj.getType(), name);
  const eventProps = extractEventProperties(
    classObj.getDecorators(),
    classObj.getJsDocs()
  );

  let fields = typeSchema.typeFields ?? [];

  const fieldMap = fields.reduce((map, field) => {
    map.set(field.name, field);
    return map;
  }, new Map<string, TypeField>());

  // TODO: remove type field, which is the last one usually.
  let documentation = classObj
    .getJsDocs()
    .map((doc) => doc.getInnerText())
    .join('\n');
  const baseClass = classObj.getBaseClass();
  let baseSchema: EventSchema | undefined;
  if (baseClass !== null && baseClass !== undefined) {
    baseSchema = getEventSchema(project, baseClass); // eslint-disable-line prefer-const

    // merge base-class and class fields, de-dupe them.
    baseSchema.fields.forEach((field) => {
      if (!fieldMap.has(field.name)) {
        fieldMap.set(field.name, field);
      } else {
        if (fieldMap.get(field.name)?.type.name !== field.type.name) {
          logError(
            `${name}.${field.name} is an incompatible override compared to its base type.`
          );
        }
      }
    });

    if (documentation === '' && baseSchema.documentation != null) {
      documentation = baseSchema.documentation;
    }
    fields = Array.from(fieldMap.values());
  }

  const zodType = getZodTypeForSchema(fields);
  documentation = documentation
    .replace(/\n@type {SyftEventType.*}/g, '')
    .trim();
  return {
    name,
    eventType:
      eventProps.eventType ?? baseSchema?.eventType ?? SyftEventType.TRACK,
    exported: classObj.isExported(),
    documentation,
    fields,
    dbSourceDetails: eventProps.dbSourceDetails ?? baseSchema?.dbSourceDetails,
    zodType
  };
}

export function getEventSchemas(
  project: Project,
  source: SourceFile
): EventSchema[] {
  // Walk the tree to search for classes
  return source
    .getClasses()
    .map((classObj) => getEventSchema(project, classObj));
}

export function getImports(project: Project, source: SourceFile): string[] {
  return source.getImportDeclarations().map((dec) => {
    return dec.getText();
  });
}
