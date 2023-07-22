import { Project, ScriptTarget } from 'ts-morph';
import { logDetail, logError, logFatal } from '@syftdata/common/lib/utils';
import {
  type InputSource,
  type AST,
  type Sink
} from '@syftdata/common/lib/types';
import { getEventSchemas } from './visitor';
import * as fs from 'fs';
import * as path from 'path';
import {
  getConfigExpressionForProject,
  getConfigFromExpression,
  getInputs,
  getSinks
} from './config';

// TODO: memoize this method.
export function createTSProject(filePaths: string[]): Project {
  const project = new Project({
    compilerOptions: { target: ScriptTarget.ES5, strictNullChecks: true }
  });

  // if directory, add glob style
  const files = filePaths.map((filePath) => {
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
      return path.join(filePath, '**', '!(*.d).ts');
    }
    return filePath;
  });
  if (files.length > 0) {
    project.addSourceFilesAtPaths(files);
  }
  return project;
}

export function readTSProject(
  sourceDir: string
): { project: Project; packageJson: any } | undefined {
  const tsConfigFilePath = `${sourceDir}/tsconfig.json`;
  if (!fs.existsSync(tsConfigFilePath)) {
    logError(
      `tsconfig.json not found in ${sourceDir}. Make sure you are in the root of a typescript project.`
    );
    return;
  }
  // read package.json file.
  const packageJsonPath = `${sourceDir}/package.json`;
  if (!fs.existsSync(packageJsonPath)) {
    logError(
      `package.json not found in ${sourceDir}. Make sure you are in the root of a typescript project.`
    );
    return;
  }
  // read all files in the project from source dir. and initialize ts-morph project
  const project = new Project({
    tsConfigFilePath
  });
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return {
    project,
    packageJson
  };
}

export function generateASTForProject(project: Project): AST | undefined {
  const sourceFile = project.getSourceFile('events.ts');
  if (sourceFile == null) {
    logFatal(
      ':warning: events.ts file is not found. Please initialize your project using `syft init`'
    );
    return;
  }
  const relPath = path.relative('.', sourceFile.getFilePath());
  logDetail(`:heavy_check_mark: Parsing ${relPath}..`);
  const eventSchemas = getEventSchemas(project, sourceFile);

  const syftConfig = getConfigExpressionForProject(project);
  if (syftConfig === undefined) {
    logFatal(':warning: Config file is not found. Please provide one.');
    return;
  }
  const config = getConfigFromExpression(syftConfig);
  const sinks: Sink[] = getSinks(project);
  const inputs: InputSource[] = getInputs(project);
  return {
    eventSchemas,
    syftConfig,
    config,
    sinks,
    inputs
  };
}

export function deserialize(fileNames: string[]): AST | undefined {
  return generateASTForProject(createTSProject(fileNames));
}

export function deserializeFromCode(
  code: string,
  config: string
): AST | undefined {
  const project = new Project({
    compilerOptions: { target: ScriptTarget.ES5 }
  });
  project.createSourceFile(path.join('events.ts'), (writer) => {
    writer.write(code);
  });
  project.createSourceFile(path.join('config.ts'), (writer) => {
    writer.write(config);
  });
  return generateASTForProject(project);
}
