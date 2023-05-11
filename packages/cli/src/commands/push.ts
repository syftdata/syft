import type * as yargs from 'yargs';
import { getSchemaFolder, logFatal, logVerbose } from '../utils';
import * as fs from 'fs';
import { pushRemoteData } from '../init/destination';
import { createTSProject, generateASTForProject } from '../codegen/compiler';
import { readRemoteConfig, writeRemoteConfig } from '../config/remote';
import { readTestSpecs } from '../publish/remote';

export interface Params {
  branch: string;
  input: string;
  apikey: string;
  remote: string;
}

export const command = 'push [branch] [apikey]';
export const desc = 'Pull event models and test specs from remote server';
export const builder = (y: yargs.Argv): yargs.Argv => {
  return y
    .positional('branch', {
      describe:
        'Branch to push event models and test specs to. If not provided, the default branch is used',
      type: 'string',
      default: 'main'
    })
    .option('apikey', {
      describe:
        'Syft API key. If provided, event models are fetched from the remote server',
      type: 'string'
    })
    .option('input', {
      describe: 'input folder with events.ts file.',
      default: getSchemaFolder(),
      type: 'string'
    });
};

export async function handler({
  input,
  apikey,
  remote,
  branch
}: Params): Promise<void> {
  logVerbose(`Pushing to ${remote} / ${branch} from ${input}`);
  // check if outDir exists. if not, raise an error.
  if (!fs.existsSync(input)) {
    logFatal(
      `:warning: Folder ${input} does not exist. Use syft init to initalize the syft folder.`
    );
    return;
  }

  const remoteConfig = readRemoteConfig(input);
  if (remoteConfig == null) {
    logFatal(
      `:warning: .syft file does not exist. Use syft pull to resync with the remote.`
    );
    return;
  }

  const project = createTSProject([input]);
  const ast = generateASTForProject(project);
  if (ast == null) {
    logFatal('Config file is not found in the input folder');
    return;
  }

  const tests = readTestSpecs(input, remoteConfig);
  const pushData = await pushRemoteData(
    {
      ast,
      tests,
      eventSchemaSha: remoteConfig.shas.eventSchemaSha
    },
    apikey,
    remote,
    branch
  );
  if (pushData == null) {
    logFatal(
      `:warning: Failed to push. Check your API key and internet connection.`
    );
    return;
  }
  writeRemoteConfig(branch, pushData.eventSchemaSha, pushData.tests, input);
}
