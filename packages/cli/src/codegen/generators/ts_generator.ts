import { CodeBlockWriter, ModuleKind, Project, ScriptTarget } from 'ts-morph';
import { type AST, type TypeSchema } from '@syftdata/common/lib/types';
import {
  capitalize,
  logDetail,
  logFatal,
  logInfo,
  logVerbose,
  lowerize
} from '../../utils';
import { SyftEventType } from '@syftdata/common/lib/client_types';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import {
  GENERATED_TS_TEMPLATE,
  LOG_VALIDATE_METHODS_TEMPLATE
} from '../templates/ts_generated_template';
import { type PackageJson } from '../../config/pkg';
import { SYFT_DOCUMENTATION } from '../../utils/constants';

// TODO: Memoize
function getGeneratedTS(): HandlebarsTemplateDelegate<any> {
  return handlebars.compile(GENERATED_TS_TEMPLATE, { noEscape: true });
}

// TODO: Memoize
function getLogMethod(): HandlebarsTemplateDelegate<any> {
  return handlebars.compile(LOG_VALIDATE_METHODS_TEMPLATE, { noEscape: true });
}

export function generateSource(ast: AST, writer: CodeBlockWriter): void {
  const logMethodWriter = new CodeBlockWriter();
  ast.eventSchemas.forEach((schema) => {
    if (schema.exported === false) return;
    const requiredFields = schema.fields.filter(
      (field) => !field.isOptional && field.defaultValue === undefined
    );
    logMethodWriter.write(
      getLogMethod()({
        ...schema,
        isOptionalInput: requiredFields.length === 0,
        eventType: SyftEventType[schema.eventType],
        lowerName: lowerize(schema.name),
        capitalName: capitalize(schema.name)
      })
    );
  });

  const externalInterfaceDefs = ast.eventSchemas.flatMap((schema) => {
    return schema.fields.map((field) => {
      if ((field.type.typeFields?.length ?? 0) > 0) {
        return field.type;
      }
      return undefined;
    });
  });
  const externalInterfaceDefMap = externalInterfaceDefs.reduce((map, def) => {
    if (def != null) {
      map.set(def.name, def);
    }
    return map;
  }, new Map<string, TypeSchema>());

  const syftClassStr = getGeneratedTS()({
    syftConfig: ast.syftConfig?.getFullText() ?? '{}',
    interface_defs: externalInterfaceDefMap.values(), // get all interfaces used by schemas.
    schemas: ast.eventSchemas,
    logMethods: logMethodWriter.toString()
  });
  writer.write(syftClassStr);
}

export function generate(
  ast: AST,
  destinationDir: string,
  pkg: PackageJson
): void {
  const project = new Project({
    compilerOptions: {
      target: ScriptTarget.ES2015,
      declaration: true,
      declarationMap: true,
      sourceMap: false,
      strictNullChecks: true,
      module: ModuleKind.CommonJS,
      noImplicitAny: false,
      removeComments: false
    }
  });
  const dir = project.createDirectory(destinationDir);
  const sourceFile = project.createSourceFile(
    path.join(destinationDir, 'lib', 'generated.ts'),
    (writer) => {
      generateSource(ast, writer);
    },
    { overwrite: true }
  );

  logVerbose('Generated Client TS file: ');
  logVerbose(sourceFile.getText());
  const relativePath = path.relative('.', destinationDir);
  logDetail(
    `Generating Syft client (${pkg.json.version as string}) to ${relativePath}`
  );
  if (process.env.NODE_ENV !== 'test') {
    const emitResult = project.emitSync();
    logVerbose(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Emit results are: ${emitResult.getDiagnostics()} ${emitResult.getEmitSkipped()}`
    );
    if (!fs.existsSync(dir.getPath())) {
      logFatal(`Failed to create the output directory at ${destinationDir}`);
      return;
    }
    logInfo(
      `:sparkles: You can now start using Syft Client in your code.\nRefer: ${SYFT_DOCUMENTATION}`
    );
    logDetail(`
\`\`\`
import Syft, { AmplitudePlugin } from '@syftdata/client'
...
const syft = new Syft({
  appVersion: "1.0.0",
  plugins: [new AmplitudePlugin(amplitude)]
})
syft.pageViewed({name: 'index'});
\`\`\``);
  } else {
    logVerbose('Skipping js generation to keep unit-tests faster');
  }
}
