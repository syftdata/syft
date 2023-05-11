import type * as yargs from 'yargs';
import { getSchemaFolder, logFatal, logInfo, logVerbose } from '../utils';
import * as fs from 'fs';
import { handler as generateFromDir } from './generate';
import { generate as schemaGenerate } from '../codegen/generators/model_generator';
import { fetchRemoteData } from '../init/destination';
import { writeRemoteConfig } from '../config/remote';
import { writeTestSpecs } from '../publish/remote';

export interface Params {
  branch: string;
  outDir: string;
  apikey: string;
  remote: string;
}

export const command = 'pull <branch>';
export const desc = 'Pull event models and test specs from remote server';
export const builder = (y: yargs.Argv): yargs.Argv => {
  return y
    .positional('branch', {
      describe:
        'Branch to pull event models from. If not provided, the default branch is used',
      type: 'string',
      default: 'main'
    })
    .option('apikey', {
      describe: 'Syft API key.',
      type: 'string'
    })
    .option('outDir', {
      describe: 'Syft home directory. usually <root>/syft',
      default: getSchemaFolder(),
      type: 'string'
    });
};

export async function handler({
  branch,
  outDir,
  apikey,
  remote
}: Params): Promise<void> {
  if (apikey === undefined) {
    logFatal(`:warning: API key is not provided. Get it from Syft Cloud.`);
    return;
  }
  // check if outDir exists. if not, raise an error.
  if (!fs.existsSync(outDir)) {
    logFatal(
      `:warning: Folder ${outDir} does not exist. Use syft init to initalize the syft folder.`
    );
    return;
  }
  logVerbose(`Pulling from ${remote} / ${branch} and writing to: ${outDir}`);
  const remoteData = await fetchRemoteData(remote, apikey, branch);
  if (remoteData == null) {
    logFatal(
      `:warning: Failed to pull. Check your API key and internet connection.`
    );
    return;
  }
  const ast = remoteData.ast;
  const testFiles = remoteData.tests;
  schemaGenerate(ast, outDir);
  writeTestSpecs(testFiles, outDir);
  writeRemoteConfig(
    branch,
    remoteData.eventSchemaSha,
    remoteData.tests,
    outDir
  );
  logInfo(':heavy_check_mark: Syft folder is updated.');
  if (process.env.NODE_ENV !== 'test') {
    await generateFromDir({ input: outDir, type: 'ts' });
  }
}
