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
import { MetricProvider } from '@syftdata/client';

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

const syftFileContent =
  "import Syft, {{ IMPORT }} from '@syftdata/client'\n" +
  'export const syft = new Syft({\n' +
  "  appVersion: '1.0.0',\n" +
  '  plugins: [{ INSTANTIATION }]\n' +
  '});\n' +
  'export default syft;\n';

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

async function getMetricPluginList(dir: string): Promise<string[]> {
  const filepath = path.join(dir, 'package.json');
  const deps = JSON.parse(fs.readFileSync(filepath, 'utf8')).dependencies;

  const providers: string[] = [];
  if (deps != null) {
    for (const providerPackage of Object.values(MetricProvider)) {
      if (providerPackage in deps) {
        providers.push(`${MetricProvider[providerPackage]}` + 'Plugin');
      }
    }
  }
  return providers;
}

async function generateSchemasFrom(ast: AST, folder: string): Promise<void> {
  logVerbose(`Output dir: ${folder}`);
  // generate basic assets.
  const lintRules = path.join(folder, 'lint/rules');
  if (fs.existsSync(lintRules) != null) {
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

  if (ast.eventSchemas.length !== 0) {
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

  const metricsPluginList = await getMetricPluginList(folder);
  const imports =
    metricsPluginList.length === 1
      ? metricsPluginList[0]
      : '\n  ' + metricsPluginList.join(',\n  ') + '\n';

  const instantiations =
    metricsPluginList.length === 1
      ? `new ${metricsPluginList[0]}()`
      : '\n' +
        metricsPluginList
          .map((input: string) => `    new ${input}()`)
          .join(',\n') +
        '\n  ';

  const content = syftFileContent
    .replace(/\{ IMPORT }/, imports)
    .replace(/\{ INSTANTIATION }/, instantiations);
  const syftSrcFile = project.createSourceFile(
    path.join(folder, '/src/syft.ts'),
    (writer) => {
      writer.write(content);
    },
    { overwrite: true }
  );
  syftSrcFile.saveSync();
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

  await generateSchemasFrom(ast, outDir);
  logInfo(':heavy_check_mark: Syft folder is created.');
  if (process.env.NODE_ENV !== 'test') {
    await generateFromDir({ input: outDir, type: 'ts' });
  }
}
