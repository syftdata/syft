import type * as yargs from 'yargs';
import { getSchemaFolder } from '../utils';
import {
  logDetail,
  logError,
  logInfo,
  logUnknownError,
  logVerbose
} from '@syftdata/common/lib/utils';
import * as fs from 'fs';
import * as path from "path";
import { handler as generateFromDir } from './generate';
import { fetchRemoteData } from '../init/destination';
import type { AST } from '@syftdata/common/lib/types';
import { getEventShemas } from '../init/local';
import { writeTestSpecs } from '../publish/remote';
import { serialize } from '@syftdata/codehandler';
import { ModuleKind, Project, ScriptTarget } from 'ts-morph';
import {getClientPackage} from "../config/pkg";
import {PluginDependency} from "@syftdata/client/src";
import {generate} from "../codegen/generators/ts_generator";

export interface Params {
  platform: string;
  product: string;
  outDir: string;
  apikey?: string;
  branch?: string;
  remote: string;
  force: boolean;
}

export const command = 'init-client';
export const desc = 'Initialize Syft project. Generates Event models.';
export const builder = (y: yargs.Argv): yargs.Argv => {
  return y;
};

function getMetricsProvider(packageJson?: any): string | null {
  if (packageJson != null) {
    const dependencies = packageJson.dependencies;

    for (const value in PluginDependency) {
      if (dependencies.hasOwnProprety(value) === true) {
        return PluginDependency[value];
      }
    }
  }
  // nothing found
  return null;
}

async function createSyftTS(ast: AST, folder: string): Promise<void> {
  const metricsProvider = await getClientPackage().then((val) => {
    return getMetricsProvider(val.json);
  });
  if (metricsProvider == null) {
    logError(`:warning: No package.json file found. Exiting...`);
    return;
  }
  const src = getSchemaFolder();
  logVerbose(`Writing syft.ts to src directory...`);

  const srcPath = path.relative('../../assets', 'syft.ts');
  generate()

}

export async function handler(): Promise<void> {
  logVerbose(`Initializing Syft in ${outDir}..`);
  let ast: AST;
  if (apikey !== undefined) {
    logVerbose(`Pulling from ${remote}..`);
    try {
      const remoteData = await fetchRemoteData(remote, apikey, branch);
      if (remoteData === undefined) {
        logError(`:warning: Failed to fetch data from ${remote}`);
        return;
      }
      ast = remoteData.ast;
      if (ast.eventSchemas.length === 0) {
        logError(`:warning: No event models found. Exiting..`);
        return;
      }
      initalizeSchemaFolder(outDir, force);
      writeTestSpecs(remoteData.tests, outDir);
      // writeRemoteConfig(
      //   remoteData.activeBranch,
      //   remoteData.eventSchemaSha,
      //   remoteData.tests,
      //   outDir
      // );
    } catch (e) {
      logUnknownError(`:warning: Failed to fetch data from ${remote}`, e);
      return;
    }
  } else {
    logVerbose(`Generating models for ${platform}`);
    ast = getEventShemas(platform, product);
    initalizeSchemaFolder(outDir, force);
  }

  generateSchemasFrom(ast, outDir);
  logInfo(':heavy_check_mark: Syft folder is created.');
  if (process.env.NODE_ENV !== 'test') {
    await generateFromDir({ input: outDir, type: 'ts' });
  }
}
