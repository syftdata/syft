import { isEmptyString } from '@syftdata/common/lib/utils';

export function registerHandlerbarHelpers(handlebars): void {
  handlebars.registerHelper('ts_documentation', function (input?: string) {
    if (input == null || isEmptyString(input)) return '';
    const lines = input.split('\n');
    return lines.map((line) => `* ${line}`).join('\n');
  });

  handlebars.registerPartial(
    'ts_documentation',
    `{{ts_documentation documentation}}
`
  );
}

export {};
