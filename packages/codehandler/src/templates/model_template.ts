import { registerHandlerbarHelpers } from './helpers';
import * as handlebars from 'handlebars/dist/cjs/handlebars';

registerHandlerbarHelpers(handlebars);

handlebars.registerPartial(
  'event_model',
  `
/**
 {{> ts_documentation}}
 * @type {SyftEventType. {{~eventType~}} }
 */
{{#if exported}}export {{/if}}class {{name}} {
  {{#each fields}}
  /**
   {{> ts_documentation}}
   */
  {{name}}{{#if isOptional}}?{{/if}}: {{type.name}};

  {{/each}}
}
`
);
export const EVENT_MODELS_TEMPLATE = `// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { type, SyftEventType } from '@syftdata/client';
{{#each schemas}}
{{> event_model}}
{{/each}}
`;
