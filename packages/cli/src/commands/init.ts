import type * as yargs from 'yargs';
import {
  getSchemaFolder,
  logDetail,
  logError,
  logInfo,
  logVerbose
} from '../utils';
import * as fs from 'fs';
import * as path from 'path';
import { handler as generateFromDir } from './generate';
import { fetchRemoteData } from '../init/destination';
import type { AST } from '@syftdata/common/lib/types';
import { getEventShemas } from '../init/local';
import { writeTestSpecs } from '../publish/remote';
import { serialize } from '@syftdata/codehandler';
import { ModuleKind, Project, ScriptTarget } from 'ts-morph';

export interface Params {
  platform: string;
  product: string;
  outDir: string;
  apikey?: string;
  branch?: string;
  remote: string;
  force: boolean;
}

export const command = 'init [platform] [product]';
export const desc = 'Initialize Syft project. Generates Event models.';
export const builder = (y: yargs.Argv): yargs.Argv => {
  return y
    .option('apikey', {
      describe:
        'Syft API key. If provided, event models are fetched from the remote server',
      type: 'string'
    })
    .option('branch', {
      describe:
        'Branch to pull event models from. If not provided, the default branch is used',
      type: 'string'
    })
    .positional('platform', {
      choices: ['web', 'mobile'] as const,
      default: 'web',
      describe: 'events are auto generated for this platform',
      type: 'string'
    })
    .positional('product', {
      choices: ['ecommerce', 'b2b'] as const,
      describe: 'events are auto generated for the product',
      type: 'string'
    })
    .option('outDir', {
      describe: 'Directory to place model files',
      default: getSchemaFolder(),
      type: 'string'
    });
};

function initalizeSchemaFolder(folder: string, force: boolean): boolean {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  } else {
    if (!force) {
      logError(`:warning: Folder ${folder} exists already.`);
      logInfo('Use --force to overwrite the folder');
      return false;
    } else {
      logDetail(`--force is used. Overwriting existing ${folder}`);
    }
  }
  return true;
}

function generateSchemasFrom(ast: AST, folder: string): void {
  logVerbose(`Output dir: ${folder}`);
  // generate basic assets.
  const lintRules = path.join(folder, 'lint/rules');
  if (!fs.existsSync(lintRules)) {
    fs.mkdirSync(lintRules, { recursive: true });
  }
  // recursively copy files from one folder to another.
  fs.copyFileSync(
    path.join(__dirname, '../../assets/config.ts'),
    path.join(folder, 'config.ts')
  );
  fs.copyFileSync(
    path.join(__dirname, '../../assets/lint/config.cjs'),
    path.join(folder, 'lint/config.cjs')
  );
  fs.copyFileSync(
    path.join(__dirname, '../../assets/lint/rules/required_syft_fields.js'),
    path.join(folder, 'lint/rules/required_syft_fields.js')
  );
  fs.copyFileSync(
    path.join(__dirname, '../../assets/lint/rules/required_tsdoc.js'),
    path.join(folder, 'lint/rules/required_tsdoc.js')
  );

  if (ast.eventSchemas.length !== 0) {
    const project = new Project({
      compilerOptions: {
        target: ScriptTarget.ES2016,
        declaration: true,
        sourceMap: true,
        module: ModuleKind.CommonJS,
        strict: false,
        removeComments: false
      }
    });
    project.createDirectory(folder);
    const sourceFile = project.createSourceFile(
      path.join(folder, 'events.ts'),
      (writer) => {
        writer.write(serialize(ast));
      },
      { overwrite: true }
    );
    sourceFile.saveSync();
  }
  logInfo(`:sparkles: Models are generated successfully!`);
}

export async function handler({
  platform,
  product,
  outDir,
  apikey,
  branch,
  remote,
  force
}: Params): Promise<void> {
  logVerbose(`Initializing Syft in ${outDir}..`);
  let ast: AST;
  if (apikey !== undefined) {
    logVerbose(`Pulling from ${remote}..`);
    const remoteData = await fetchRemoteData(remote, apikey, branch);
    if (remoteData === undefined) {
      logError(`:warning: Failed to fetch data from ${remote}`);
      return;
    }
    ast = remoteData.ast;
    initalizeSchemaFolder(outDir, force);
    writeTestSpecs(remoteData.tests, outDir);
    // writeRemoteConfig(
    //   remoteData.activeBranch,
    //   remoteData.eventSchemaSha,
    //   remoteData.tests,
    //   outDir
    // );
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
