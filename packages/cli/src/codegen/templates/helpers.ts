import { isEmptyString } from '../../utils';

export function registerHandlerbarHelpers(handlebars): void {
  const DEFAULT_DOCUMENTATION =
    'Documentation is not available.\nPlease add it in the model file.';

  handlebars.registerHelper('ts_documentation', function (input?: string) {
    const doc = (
      !isEmptyString(input) ? input : DEFAULT_DOCUMENTATION
    ) as string;
    const lines = doc.split('\n');
    return lines.map((line) => `* ${line}`).join('\n');
  });

  handlebars.registerPartial(
    'ts_documentation',
    `{{ts_documentation documentation}}
`
  );
}

export {};
