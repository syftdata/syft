import type * as yargs from 'yargs';
import { generateAST } from '../codegen/compiler';
import { generate as generateTS } from '../codegen/generators/ts_generator';
import { generate as generateDocs } from '../codegen/generators/doc_generator';
import { generate as generateGo } from '../codegen/generators/go_generator';
import { generate as generateDBT } from '../codegen/generators/dbt_generator';
import {
  type BigQueryConfig,
  type ProviderConfig
} from '../config/sink_configs';
import { getSchemaFolder } from '../utils';
import { type Questions, prompt as ask } from 'inquirer';
import { getClientPackage, updatePackageJson } from '../config/pkg';
import { runLinter } from '../lint/linter';

export interface Params {
  input: string;
  type: string;
  outDir?: string;
  projectId?: string;
  dataset?: string;
  destination?: string;
  platform?: string;
}
export const command = 'generate [type]';
export const desc =
  'Generates client libraries, dbt and docs from Event models.';
export const builder = (y: yargs.Argv): yargs.Argv => {
  return (
    y
      .positional('type', {
        // choices: ['ts', 'go', 'doc', 'dbt'] as const,
        choices: ['ts'] as const,
        default: 'ts'
      })
      // .option('projectId', {
      //   describe: 'GCP project ID to use for DBT',
      //   type: 'string'
      // })
      // .option('dataset', {
      //   describe: 'BigQuery dataset name to use for DBT',
      //   type: 'string'
      // })
      // .option('destination', {
      //   describe: 'Data provider. Currently support Segment and Heap',
      //   type: 'string'
      // })
      // .option('platform', {
      //   describe: 'Heap library type -- Web, iOS, Android',
      //   type: 'string'
      // })
      .option('input', {
        describe: 'input folder with events.ts file.',
        default: getSchemaFolder(),
        type: 'string'
      })
      .option('outDir', {
        describe: 'Directory to place output files',
        type: 'string'
      })
  );
};

async function getBigQueryConfig(
  projectId?: string,
  dataset?: string
): Promise<BigQueryConfig> {
  const prompts: Questions = [];
  if (projectId == null) {
    prompts.push({
      type: 'input',
      name: 'projectId',
      message: 'GCP Project ID:'
    });
  }
  if (dataset == null) {
    prompts.push({
      type: 'input',
      name: 'dataset',
      message: 'BigQuery Dataset (stores events):'
    });
  }
  const { config } = await ask(prompts);
  return {
    projectId: config.projectId,
    dataset: config.dataset
  };
}

async function getProviderConfig(
  destination?: string,
  platform?: string
): Promise<ProviderConfig> {
  let destinationVal = '';
  if (destination == null) {
    const { answer } = await ask([
      {
        type: 'input',
        name: 'destination',
        message: 'Data Destination (Segment / Heap):'
      }
    ]);
    destinationVal = answer;
  } else {
    destinationVal = destination;
  }

  return {
    destination: destinationVal,
    platform
  };
}

export async function handler({
  input,
  type,
  outDir,
  projectId,
  dataset,
  destination,
  platform
}: Params): Promise<void> {
  const ast = generateAST([input]);
  if (ast != null) {
    if (ast.config.lintingDisabled !== true) {
      // lint source first.
      const successLint = await runLinter([input]);
      if (!successLint) {
        return;
      }
    }
    if (type === 'ts') {
      // get the npm output to get syft-client location.
      const pkg = await getClientPackage();
      generateTS(ast, outDir ?? pkg.dir, pkg);

      // update package.json version
      const [currentVersion] = (pkg.json.version as string).split('+');
      pkg.json.version = `${currentVersion}+${Date.now()}`;
      updatePackageJson(pkg);
    } else if (type === 'doc') {
      generateDocs(ast, outDir ?? './docs');
    } else if (type === 'go') {
      generateGo(ast, outDir ?? './golang');
    } else if (type === 'dbt') {
      const bqConfig = await getBigQueryConfig(projectId, dataset);
      const providerConfig = await getProviderConfig(destination, platform);

      generateDBT(ast, outDir ?? './dbt', bqConfig, providerConfig);
    }
  }
}
