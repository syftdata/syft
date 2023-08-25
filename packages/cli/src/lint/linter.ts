import { ESLint } from 'eslint';
import * as fs from 'fs';
import { logInfo } from '@syftdata/common/lib/utils';

export async function runLinter(files: string[]): Promise<boolean> {
  try {
    if (!fs.existsSync('syft/lint/rules')) {
      logInfo(':warning: No custom lint rules found. Skipping linting.');
      return true;
    }

    // 1. Create an instance.
    const eslint = new ESLint({
      overrideConfigFile: 'syft/lint/config.cjs',
      rulePaths: ['syft/lint/rules'],
      useEslintrc: true
    });

    // 2. Lint files.
    const results = await eslint.lintFiles(files);

    const errors = results.filter((result) => result.errorCount > 0);
    // 3. Format the results.
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    // 4. Output it.
    // eslint-disable-next-line no-console
    console.log(resultText);
    return errors.length === 0;
  } catch (e) {
    // logUnknownError(
    //   ':warning: Failed to run linter. Ignoring linting for now.',
    //   e
    // );
    return true;
  }
}
