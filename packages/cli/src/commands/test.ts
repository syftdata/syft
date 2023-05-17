import type * as yargs from 'yargs';
import { logInfo, logVerbose } from '../utils';
import * as glob from 'glob';
import { verifyPuppeteerTest } from '../replay/puppeteer';

export interface Params {
  testSpecs: string;
  headless: boolean;
}
export const builder = (y: yargs.Argv): yargs.Argv => {
  return y
    .option('test-specs', {
      describe: 'folder with test specs.',
      // default: getTestSpecFolder(),
      default: '../examples/todo-app/syft/tests',
      type: 'string'
    })
    .option('headless', {
      describe: 'Enable headless mode',
      default: true,
      type: 'boolean'
    });
};

export const command = 'test';
export const desc = 'Run your event tests';

export async function handler({ testSpecs, headless }: Params): Promise<void> {
  const files = glob.sync(`${testSpecs}/**/*`, {
    nodir: true
  });
  const successPromises = files.map(async (filePath) => {
    logVerbose(`Running test in: ${filePath}`);
    return await verifyPuppeteerTest(filePath, headless);
  });
  const successes = await Promise.all(successPromises);
  if (successes.every((success) => success)) {
    logInfo(':sparkles: All tests are passed');
  } else {
    process.exit(1);
  }
}
