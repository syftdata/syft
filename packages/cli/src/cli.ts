import type { Argv } from 'yargs';
import * as findUp from 'find-up';
import * as fs from 'fs';
import { logError, logUnknownError, toggleVerbosity } from './utils';

const configPath = findUp.sync(['.syftrc', '.syftrc.json']);
let config = {};
if (configPath !== undefined && configPath !== null) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    logError(
      `:warning: Invalid config file ${configPath}. Using default values`
    );
  }
}

export interface Params {
  verbose: boolean;
}
const handleVerbosity = ({ verbose }: Params): void => {
  toggleVerbosity(verbose);
};

export function setupCLICommonParams(cli: Argv): Argv {
  return cli
    .option('remote', {
      describe: 'Remote Server Base Url',
      type: 'string',
      default: 'https://syft-studio-app.vercel.app',
      hidden: true
    })
    .option('force', {
      describe: 'Force an operation without exiting early.',
      type: 'boolean',
      default: false,
      hidden: true
    })
    .option('verbose', {
      describe: 'Enable verbose mode',
      default: false,
      type: 'boolean'
    })
    .middleware(handleVerbosity)
    .config(config)
    .pkgConf('syft')
    .fail((msg, e) => {
      logUnknownError(msg, e);
      process.exit(1);
    });
}
