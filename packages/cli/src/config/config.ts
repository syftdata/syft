import type { StaticConfig } from '../client_types';
import type { ObjectLiteralExpression, Project } from 'ts-morph';
import { SyntaxKind, PropertyAssignment } from 'ts-morph';
import { createTSProject } from '../codegen/compiler';

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

export function setConfigVersionOnExpression(
  expression: ObjectLiteralExpression,
  version: string
): boolean {
  expression.getProperties().forEach((property) => {
    if (property instanceof PropertyAssignment) {
      const propertyName = property.getSymbolOrThrow().getEscapedName();
      if (propertyName === 'version') {
        property.setInitializer(`'${version}'`);
        return true;
      }
    }
  });
  return false;
}

export function getConfig(schemaFolder: string): StaticConfig | undefined {
  const project = createTSProject([schemaFolder]);
  const expression = getConfigExpressionForProject(project);
  if (expression === undefined) {
    return;
  }
  return getConfigFromExpression(expression);
}
