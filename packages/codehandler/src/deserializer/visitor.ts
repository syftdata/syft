import {
  JSDocTypeTag,
  type ClassDeclaration,
  type Project,
  type PropertyDeclaration,
  type SourceFile,
  type Decorator,
  type JSDoc,
  SyntaxKind
} from 'ts-morph';
import {
  type EventSchema,
  type Field,
  type TypeField
} from '@syftdata/common/lib/types';
import { SyftEventType } from '@syftdata/common/lib/client_types';
import { logError, logVerbose } from '@syftdata/common/lib/utils';
import {
  extractKVPairsFromObjectLiteral,
  getTags,
  getTypeSchema
} from './ts_morph_utils';
import { getZodTypeForSchema, ZOD_ALLOWED_TAGS } from './zod_utils';
import {
  type DBEventSource,
  type DBFieldRelation
} from '@syftdata/common/lib/db_types';

interface EventProperties {
  eventType?: SyftEventType;
  dbSourceDetails?: DBEventSource;
}

interface FieldProperties {
  zodType?: string;
  dbRelation?: DBFieldRelation;
}

function getField(
  property: PropertyDeclaration,
  typeFields?: Map<string, TypeField>
): Field | undefined {
  const typeField = typeFields?.get(property.getName());
  if (typeField == null) {
    // TODO: add additional details
    logError(`Couldn't find type field ${property.getName()}`);
    return;
  }

  const fieldProps = extractFieldProperties(
    typeField,
    property.getDecorators(),
    property.getJsDocs()
  );
  typeField.type.zodType = fieldProps.zodType ?? typeField.type.zodType;

  return {
    ...typeField,
    dbRelation: fieldProps.dbRelation,
    documentation: property
      .getJsDocs()
      .map((doc) => doc.getInnerText())
      .join('\n'),
    defaultValue: property.getInitializer()?.getText()
  };
}

function extractFieldProperties(
  typeField: TypeField,
  decorators: Decorator[],
  docs: JSDoc[]
): FieldProperties {
  const tags = getTags(docs);
  let fieldRelationProperties: DBFieldRelation | undefined;
  decorators.forEach((decorator) => {
    const name = decorator.getName();
    if (name === 'relation') {
      const args = decorator.getArguments();
      if (args.length === 0) {
        logError(`@relation decorator requires an argument`);
        return;
      }
      const dbArg = args[0];
      if (dbArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
        const kvPairs = extractKVPairsFromObjectLiteral(dbArg);
        if (
          kvPairs.has('table') &&
          kvPairs.has('references') &&
          kvPairs.has('fields')
        ) {
          fieldRelationProperties = {
            table: kvPairs.get('table') as string,
            references: kvPairs.get('references') as string[],
            fields: kvPairs.get('fields') as string[],
            isMany: typeField.type.isArray ?? false
          };
        }
      }
      if (fieldRelationProperties === undefined) {
        logError(
          `relation decorator requires table, references, fields properties`
        );
      }
    }
  });

  let zodType = typeField.type.zodType;
  const allowedZodTags = ZOD_ALLOWED_TAGS[typeField.name] ?? [];
  tags.forEach((tag) => {
    const name = tag.getTagName();
    if (allowedZodTags.includes(name)) {
      const paramString = tag.getCommentText()?.trim();
      if (paramString !== undefined && paramString.length > 0) {
        if (name === 'startsWith' || name === 'endsWith') {
          zodType = `${zodType}.${name}("${paramString}")`;
        } else {
          const paramInt = parseInt(paramString);
          zodType = `${zodType}.${name}(${!isNaN(paramInt) ? paramInt : ''})`;
        }
      }
    }
  });
  return {
    zodType,
    dbRelation: fieldRelationProperties
  };
}

function extractEventProperties(
  decorators: Decorator[],
  docs: JSDoc[]
): EventProperties {
  const tags = getTags(docs);
  let eventType: SyftEventType | undefined;
  let dbProperties: DBEventSource | undefined;

  decorators.forEach((decorator) => {
    const name = decorator.getName();
    if (name === 'eventtype') {
      const args = decorator.getArguments();
      if (args.length === 0) {
        logError(`@eventtype decorator requires arguments`);
        return;
      }
      const arg = args[0];
      const eventTypeString = arg.getText();
      if (!eventTypeString.startsWith('SyftEventType.')) {
        logError(`@eventtype decorator requires SyftEventType enum`);
        return;
      }
      eventType = SyftEventType[eventTypeString.replace('SyftEventType.', '')];
      if (eventType === SyftEventType.DB) {
        const dbArg = args[1];
        if (dbArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
          const kvPairs = extractKVPairsFromObjectLiteral(dbArg);
          if (kvPairs.has('table') && kvPairs.has('on')) {
            dbProperties = {
              table: kvPairs.get('table') as string,
              on: kvPairs.get('on') as string,
              fields: kvPairs.get('fields') as string[]
            };
          }
        }
        if (dbProperties === undefined) {
          logError(
            `eventtype decorator with SyftEventType.DB requires table and on properties`
          );
        }
      }
    }
  });

  tags.forEach((tag) => {
    if (tag instanceof JSDocTypeTag || tag.getTagName() === 'type') {
      const fullTypeString = (tag as JSDocTypeTag)
        .getTypeExpression()
        ?.getTypeNode()
        ?.getText();
      if (fullTypeString === undefined) return;
      const typeString = fullTypeString.replace('SyftEventType.', '');
      if (typeString in SyftEventType) {
        eventType = SyftEventType[typeString as keyof typeof SyftEventType];
      }
    }
  });
  return { eventType, dbSourceDetails: dbProperties };
}

export function getEventSchema(
  project: Project,
  classObj: ClassDeclaration
): EventSchema {
  const name = classObj.getNameOrThrow();
  logVerbose(`Parsing event: ${name}`);
  const typeSchema = getTypeSchema(classObj.getType(), name);
  // for every field, get the TypeField object map.
  const typeFieldMap = typeSchema.typeFields?.reduce((prev, curr) => {
    prev.set(curr.name, curr);
    return prev;
  }, new Map<string, TypeField>());

  let fields = classObj
    .getProperties()
    .map((property) => {
      return getField(property, typeFieldMap);
    })
    .filter((field) => field != null) as Field[];
  const eventProps = extractEventProperties(
    classObj.getDecorators(),
    classObj.getJsDocs()
  );

  const fieldMap = fields.reduce((map, field) => {
    map.set(field.name, field);
    return map;
  }, new Map<string, Field>());

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
