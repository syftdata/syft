import { ModuleKind, Project, ScriptTarget } from 'ts-morph';
import { type AST } from '@syftdata/common/lib/types';
import { generateSource } from '@syftdata/codehandler';
import {
  logDetail,
  logInfo,
  logFatal,
  logVerbose,
  SYFT_DOCUMENTATION
} from '@syftdata/common/lib/utils';
import * as fs from 'fs';
import * as path from 'path';
import { type PackageJson } from '../../config/pkg';

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
      writer.write(generateSource(ast));
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
