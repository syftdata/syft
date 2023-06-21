import type * as yargs from 'yargs';
import * as path from 'path';
import * as fs from 'fs';
import { logInfo } from '@syftdata/common/lib/utils';
import { readTSProject, analyzeAST } from '@syftdata/codehandler';
import { stringify } from 'yaml';
import { SyftEventType } from '@syftdata/client';

export interface Params {
  output: string;
  srcDir: string;
}

export const command = 'analyze';
export const desc = 'Analyze source directory and extracts schema';
export const builder = (y: yargs.Argv): yargs.Argv => {
  return y
    .option('output', {
      describe: 'output folder to create / update events.ts file.',
      type: 'string'
    })
    .option('srcDir', {
      describe: 'Directory to find project source code',
      type: 'string',
      default: '.'
    });
};

export async function handler({ output, srcDir }: Params): Promise<void> {
  const tsProject = readTSProject(srcDir);
  if (tsProject == null) {
    return;
  }
  const project = tsProject.project;
  logInfo('Analyzing the code to find usages..');
  const ast = analyzeAST(project);
  // put the yaml into a file.
  const yaml = stringify(
    ast.eventSchemas,
    (k, v) => {
      if (k === 'eventType') {
        return SyftEventType[v];
      }
      if (k === 'zodType') return;
      if (k === 'type') {
        return v.name;
      }
      return v;
    },
    2
  );
  if (output == null) {
    logInfo(yaml);
  } else {
    const yamlFile = path.join(output, 'event_schema.yaml');
    fs.writeFileSync(yamlFile, yaml, 'utf-8');
  }
}
