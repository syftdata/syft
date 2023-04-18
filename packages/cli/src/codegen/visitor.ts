import { type EventSchema, type Field, type TypeField } from './types';
import { SyftEventType } from '../client_types';
import {
  JSDocTypeTag,
  type ClassDeclaration,
  type JSDocTag,
  type Project,
  type PropertyDeclaration,
  type SourceFile,
  type ts
} from 'ts-morph';
import { getTags, getTypeSchema } from './ts_morph_utils';
import { logError, logVerbose } from '../utils';
import { getZodTypeForSchema, ZOD_ALLOWED_TAGS } from './zod_utils';

interface EventAnnotations {
  eventType?: SyftEventType;
}

function getField(
  property: PropertyDeclaration,
  typeFields?: Map<string, TypeField>
): Field | undefined {
  const tags = getTags(property.getJsDocs());
  const isOptional = property.hasQuestionToken();

  const typeField = typeFields?.get(property.getName());
  if (typeField == null) {
    // TODO: add additional details
    logError(`Couldn't find type field ${property.getName()}`);
    return;
  }

  let zodType = typeField.type.zodType;
  const allowedZodTags = ZOD_ALLOWED_TAGS[typeField.name];
  if (allowedZodTags !== undefined) {
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
  }

  if (isOptional) {
    zodType = `${zodType}.optional()`;
  }
  typeField.type.zodType = zodType;

  return {
    ...typeField,
    documentation: property
      .getJsDocs()
      .map((doc) => doc.getInnerText())
      .join('\n'),
    defaultValue: property.getInitializer()?.getText(),
    isOptional
  };
}

function parseClassAnnotations(
  tags: Array<JSDocTag<ts.JSDocTag>>
): EventAnnotations {
  let eventType;
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
  return { eventType };
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
  let traits = classObj.getDecorators().map((decorator) => decorator.getText());
  const annotations = parseClassAnnotations(getTags(classObj.getJsDocs()));

  const fieldMap = fields.reduce((map, field) => {
    map.set(field.name, field);
    return map;
  }, new Map<string, Field>());

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
    traits = [...new Set([...baseSchema.traits, ...traits])];
  }

  const zodType = getZodTypeForSchema(fields);

  return {
    name,
    eventType:
      annotations.eventType ?? baseSchema?.eventType ?? SyftEventType.TRACK,
    exported: classObj.isExported(),
    documentation,
    fields,
    traits,
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
