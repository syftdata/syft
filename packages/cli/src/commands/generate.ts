import type * as yargs from 'yargs';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { generate as generateTS } from '../codegen/generators/ts_generator';
import { generate as generateDocs } from '../codegen/generators/doc_generator';
import { generate as generateGo } from '../codegen/generators/go_generator';
import { generate as generateDBT } from '../codegen/generators/dbt_generator';
import { type ProviderConfig } from '../config/sink_configs';
import { getSchemaFolder } from '../utils';
import { logDetail, logInfo } from '@syftdata/common/lib/utils';
import { getClientPackage, updatePackageJson } from '../config/pkg';
import { runLinter } from '../lint/linter';
import { type AST } from '@syftdata/common/lib/types';
import { startServer } from '../watch/json_server';
import { deserialize } from '@syftdata/codehandler';

export interface Params {
  input: string;
  type: string;
  outDir?: string;
  projectId?: string;
  dataset?: string;
  destination?: string;
  platform?: string;
  watch?: boolean;
}
export const command = 'generate [type]';
export const desc =
  'Generates client libraries, dbt and docs from Event models.';
export const builder = (y: yargs.Argv): yargs.Argv => {
  return (
    y
      .positional('type', {
        choices: ['ts', 'dbt', 'yaml'] as const,
        default: 'ts'
      })
      // .option('destination', {
      //   choices: ['syft', 'heap', 'segment'] as const,
      //   describe: 'Event Logging library. Currently we support syft, segment and heap',
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
      .option('watch', {
        describe: 'Watch input folder for changes and regenerate',
        type: 'boolean'
      })
  );
};

async function getProviderConfig(): Promise<ProviderConfig> {
  return {
    sdkType: 'syft'
  };
  //   let destinationVal = '';
  //   if (destination == null) {
  //     const { answer } = await ask([
  //       {
  //         type: 'input',
  //         name: 'destination',
  //         message: 'Data Destination (Segment / Heap):'
  //       }
  //     ]);
  //     destinationVal = answer;
  //   } else {
  //     destinationVal = destination;
  //   }

  //   return {
  //     destination: destinationVal,
  //     platform
  //   };
}

async function innerHandler({
  input,
  type,
  outDir
}: Params): Promise<AST | undefined> {
  const ast = deserialize([input]);
  if (ast != null) {
    if (ast.config.lintingDisabled !== true) {
      // lint source first.
      const successLint = await runLinter([input]);
      if (!successLint) {
        return ast;
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
      const providerConfig = await getProviderConfig();
      generateDBT(ast, outDir ?? './dbt', providerConfig);
    } else if (type === 'yaml') {
      console.log(
        yaml.dump(ast, {
          replacer: (key, value) => {
            if (key === 'syftConfig' || key === 'zodType') {
              return undefined;
            }
            return value;
          }
        })
      );
    }
  }
  return ast;
}

export async function handler(params: Params): Promise<void> {
  const { watch, input } = params;
  let ast = await innerHandler(params);
  if (watch === true) {
    logDetail('Watching input folder for changes...');
    fs.watch(input, (eventType, filename) => {
      if (filename?.endsWith('.ts')) {
        logInfo('Detected changes in the input folder. Regenerating...');
        innerHandler(params)
          .then((latestAST) => {
            ast = latestAST;
            logInfo('Regeneration complete.');
          })
          .catch(() => {});
      }
    });
    // in watch mode, run a http server and serve AST.
    startServer(() => ast);
  }
}
