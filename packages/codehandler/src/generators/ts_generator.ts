import { CodeBlockWriter } from 'ts-morph';
import {
  type EventSchema,
  type AST,
  type TypeSchema
} from '@syftdata/common/lib/types';
import { capitalize, lowerize } from '@syftdata/common/lib/utils';
import { SyftEventType } from '@syftdata/common/lib/client_types';
import * as handlebars from 'handlebars';
import {
  EXAMPLE_CALL_TEMPLATE,
  GENERATED_TS_TEMPLATE,
  LOG_VALIDATE_METHODS_TEMPLATE
} from '../templates/ts_generated_template';

// TODO: Memoize
function getGeneratedTS(): HandlebarsTemplateDelegate<any> {
  return handlebars.compile(GENERATED_TS_TEMPLATE, { noEscape: true });
}

// TODO: Memoize
function getLogMethod(): HandlebarsTemplateDelegate<any> {
  return handlebars.compile(LOG_VALIDATE_METHODS_TEMPLATE, { noEscape: true });
}

// TODO: Memoize
function getExampleUsage(): HandlebarsTemplateDelegate<any> {
  return handlebars.compile(EXAMPLE_CALL_TEMPLATE, { noEscape: true });
}

export function generateSource(ast: AST): string {
  const logMethodWriter = new CodeBlockWriter();
  ast.eventSchemas.forEach((schema) => {
    if (schema.exported === false) return;
    const requiredFields = schema.fields.filter(
      (field) => !field.isOptional && field.defaultValue === undefined
    );
    logMethodWriter.write(
      getLogMethod()({
        ...schema,
        isOptionalInput: requiredFields.length === 0,
        eventType: SyftEventType[schema.eventType],
        lowerName: lowerize(schema.name),
        capitalName: capitalize(schema.name)
      })
    );
  });

  const externalInterfaceDefs = ast.eventSchemas.flatMap((schema) => {
    return schema.fields.map((field) => {
      if ((field.type.typeFields?.length ?? 0) > 0) {
        return field.type;
      }
      return undefined;
    });
  });
  const externalInterfaceDefMap = externalInterfaceDefs.reduce((map, def) => {
    if (def != null) {
      map.set(def.name, def);
    }
    return map;
  }, new Map<string, TypeSchema>());

  const syftClassStr = getGeneratedTS()({
    syftConfig: ast.syftConfig?.getFullText() ?? '{}',
    interface_defs: externalInterfaceDefMap.values(), // get all interfaces used by schemas.
    schemas: ast.eventSchemas,
    logMethods: logMethodWriter.toString()
  });
  return syftClassStr;
}

export function generateExampleCalls(schemas: EventSchema[]): string[] {
  const templ = getExampleUsage();
  return schemas.map((schema) => {
    return templ({
      ...schema,
      lowerName: lowerize(schema.name),
      capitalName: capitalize(schema.name)
    });
  });
}
