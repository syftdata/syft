import type * as yargs from 'yargs';
import { inc, parse, type ReleaseType } from 'semver';
import {
  getConfigExpressionForProject,
  getConfigFromExpression,
  setConfigVersionOnExpression
} from '../config/config';
import { getSchemaFolder, logFatal, logInfo, logUnknownError } from '../utils';
import { createTSProject, generateASTForProject } from '../codegen/compiler';
import { publishEventShemas } from '../init/destination';

export interface Params {
  input: string;
  release: string;
  apikey: string;
  remote: string;
}

export const command = 'publish';
export const desc = 'Publish event definitions';
export const builder = (y: yargs.Argv): yargs.Argv => {
  return y
    .option('apikey', {
      describe: 'Syft API key.',
      type: 'string'
    })
    .option('input', {
      describe: 'input folder with events.ts file.',
      default: getSchemaFolder(),
      type: 'string'
    })
    .positional('release', {
      choices: ['major', 'minor', 'patch'] as const,
      default: 'patch'
    });
};

export async function handler({
  input,
  release,
  apikey,
  remote
}: Params): Promise<void> {
  if (apikey === undefined) {
    logFatal('Please provide an API key');
    return;
  }

  const project = createTSProject([input]);
  const ast = generateASTForProject(project);
  const expression = getConfigExpressionForProject(project);
  if (ast === undefined || expression === undefined) {
    logFatal('Config file is not found in the input folder');
    return;
  }
  const config = getConfigFromExpression(expression);
  const currVer = parse(config.version);
  if (currVer === null) {
    logFatal(`An invalid version is provided in config: ${config.version}`);
    return;
  }
  const newVer = inc(currVer, release as ReleaseType, true);
  if (newVer === null) {
    logFatal(`Failed to increment version: ${config.version}`);
    return;
  }

  setConfigVersionOnExpression(expression, newVer);
  project.saveSync();

  logInfo(`Version bumped from ${config.version} -> ${newVer ?? ''}`);

  // now publish the schema to the cloud.
  try {
    await publishEventShemas(ast, remote, apikey, newVer);
    logInfo(':sparkles: Published successfully!');
  } catch (e) {
    logUnknownError(':warning: Failed to publish.', e);
  }
}
