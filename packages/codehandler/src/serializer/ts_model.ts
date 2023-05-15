import { type AST } from '@syftdata/common/lib/types';
import * as handlebars from 'handlebars';
import { EVENT_MODELS_TEMPLATE } from '../templates/model_template';
import { SyftEventType } from '@syftdata/common/lib/client_types';

// TODO: Memoize
function getEventModelsTemplate(): HandlebarsTemplateDelegate<any> {
  return handlebars.compile(EVENT_MODELS_TEMPLATE, { noEscape: true });
}

export function serialize(ast: AST): string {
  const schemas = ast.eventSchemas.map((schema) => ({
    ...schema,
    eventType: SyftEventType[schema.eventType]
  }));
  return getEventModelsTemplate()({
    schemas
  });
}
