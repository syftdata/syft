import type { StaticConfig } from '@syftdata/common/lib/client_types';
import type { ObjectLiteralExpression, Project } from 'ts-morph/dist/ts-morph';
import { SyntaxKind, PropertyAssignment } from 'ts-morph/dist/ts-morph';

const STATIC_CONFIG_TYPE = 'StaticConfig';

export function getConfigExpressionForProject(
  project: Project
): ObjectLiteralExpression | undefined {
  let syftConfig: ObjectLiteralExpression | undefined;
  for (const sourceFile of project.getSourceFiles()) {
    sourceFile.getVariableDeclarations().forEach((variable) => {
      let varialbeType = variable.getType().getText();
      const symbol = variable.getType().getSymbol();
      if (symbol !== undefined) {
        varialbeType = symbol.getEscapedName();
      }
      if (varialbeType !== STATIC_CONFIG_TYPE) return;
      syftConfig = variable.getInitializerIfKind(
        SyntaxKind.ObjectLiteralExpression
      );
    });
    if (syftConfig !== undefined) break;
  }
  return syftConfig;
}

export function getConfigFromExpression(
  expression: ObjectLiteralExpression
): StaticConfig {
  const val: StaticConfig = {
    projectName: 'test',
    version: '0.0.0'
  };
  expression.getProperties().forEach((property) => {
    if (property instanceof PropertyAssignment) {
      const propertyName = property.getSymbolOrThrow().getEscapedName();
      const value = property
        .getInitializerOrThrow()
        .getText()
        .replace(/['"]/g, '');
      if (propertyName === 'version') {
        val[propertyName] = value;
      }
    }
  });
  return val;
}
