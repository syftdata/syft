export function registerHandlerbarHelpers(handlebars): void {
  handlebars.registerHelper('ts_documentation', function (input?: string) {
    const documentation = input?.trim() ?? '';
    const lines = documentation.split('\n');
    return lines.map((line) => `* ${line}`).join('\n');
  });

  handlebars.registerPartial(
    'ts_documentation',
    `{{ts_documentation documentation}}
`
  );
}

export {};
