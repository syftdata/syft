import {
  type CodeBlockWriter,
  ModuleKind,
  Project,
  ScriptTarget
} from 'ts-morph';
import { type AST } from '../types';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { EVENT_MODELS_TEMPLATE } from '../templates/model_template';
import { SyftEventType } from '../../client_types';

// TODO: Memoize
function getEventModelsTemplate(): HandlebarsTemplateDelegate<any> {
  return handlebars.compile(EVENT_MODELS_TEMPLATE, { noEscape: true });
}

export function generateSource(ast: AST, writer: CodeBlockWriter): void {
  const schemas = ast.eventSchemas.map((schema) => ({
    ...schema,
    eventType: SyftEventType[schema.eventType]
  }));
  writer.write(
    getEventModelsTemplate()({
      schemas
    })
  );
}

export function generate(ast: AST, destinationDir: string): void {
  if (ast.eventSchemas.length === 0) {
    return;
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
  project.createDirectory(destinationDir);
  const sourceFile = project.createSourceFile(
    path.join(destinationDir, 'events.ts'),
    (writer) => {
      generateSource(ast, writer);
    },
    { overwrite: true }
  );
  sourceFile.saveSync();
}
