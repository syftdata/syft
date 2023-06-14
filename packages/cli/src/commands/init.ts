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
import * as path from 'path';
import { handler as generateFromDir } from './generate';
import { fetchRemoteData } from '../init/destination';
import type { AST } from '@syftdata/common/lib/types';
import { getEventShemas } from '../init/local';
import { writeTestSpecs } from '../publish/remote';
import { serialize } from '@syftdata/codehandler';
import { ModuleKind, Project, ScriptTarget } from 'ts-morph';
import { PluginPackage } from '@syftdata/client';

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

async function generateSchemasFrom(ast: AST, folder: string): Promise<void> {
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

async function getMetricPluginList(): Promise<string[]> {
  const pkg = fs.readFileSync('package.json', 'utf8');
  const deps = JSON.parse(pkg).dependencies;

  const providers: string[] = [];
  if (deps != null) {
    for (const providerPackage of Object.values(PluginPackage)) {
      if (providerPackage in deps) {
        providers.push(`${PluginPackage[providerPackage]}` + 'Plugin');
      }
    }
  }
  logVerbose(
    `Parsed package.json file and found ${providers.length} compatible plugins.`
  );
  return providers;
}

async function generateSyftTS(
  metricPlugins: string[],
  force: boolean
): Promise<void> {
  if (metricPlugins.length > 0) {
    logVerbose(`Generating syft.ts with ${metricPlugins.join(', ')} plugin(s)`);
  } else {
    logVerbose('No compatible plugins found. Not generating syft.ts');
    return;
  }

  const destinationPath = path.join('src', 'syft.ts');
  if (fs.existsSync(destinationPath) && !force) {
    logVerbose(`${destinationPath} already exists. Use --force to overwrite.`);
    return;
  }

  const imports =
    metricPlugins.length === 1
      ? ` ${metricPlugins[0]} `
      : '\n  ' + metricPlugins.join(',\n  ') + '\n';
  const instantiations =
    metricPlugins.length === 1
      ? `new ${metricPlugins[0]}()`
      : '\n' +
        metricPlugins.map((input: string) => `    new ${input}()`).join(',\n') +
        '\n  ';

  const assetPath = path.join(__dirname, '../../assets/syft.ts');
  let content = '';
  try {
    content = fs
      .readFileSync(assetPath, 'utf8')
      .replace(/\{ IMPORT }/, imports)
      .replace(/\{ INSTANTIATION }/, instantiations);
  } catch (e) {
    logError(`error creating syft.ts from ${assetPath}... ${e}`);
  }

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

  const syftSrcFile = project.createSourceFile(
    destinationPath,
    (writer) => {
      writer.write(content);
    },
    { overwrite: force }
  );

  syftSrcFile.saveSync();
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

  // we may want this for other functionality
  const metricPlugins = await getMetricPluginList();

  await generateSchemasFrom(ast, outDir);
  await generateSyftTS(metricPlugins, force);
  logInfo(':heavy_check_mark: Syft folder is created.');
  if (process.env.NODE_ENV !== 'test') {
    await generateFromDir({ input: outDir, type: 'ts' });
  }
}
