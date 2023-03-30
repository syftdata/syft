import { logDetail, logError, logFatal, logInfo } from '../utils';
import { Project, ScriptTarget } from 'ts-morph';
import { type AST } from './types';
import { getEventSchemas } from './visitor';
import * as fs from 'fs';
import * as path from 'path';
import {
  getConfigExpressionForProject,
  getConfigFromExpression
} from '../config/config';

// TODO: memoize this method.
export function createTSProject(filePaths: string[]): Project {
  const project = new Project({
    compilerOptions: { target: ScriptTarget.ES5 }
  });

  // if directory, add glob style
  const files = filePaths.map((filePath) => {
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
      return path.join(filePath, '**', '!(*.d).ts');
    }
    return filePath;
  });

  project.addSourceFilesAtPaths(files);
  return project;
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

  return {
    eventSchemas,
    syftConfig,
    config
  };
}

export function generateAST(fileNames: string[]): AST | undefined {
  return generateASTForProject(createTSProject(fileNames));
}
