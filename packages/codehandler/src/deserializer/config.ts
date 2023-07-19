import type { StaticConfig } from '@syftdata/common/lib/client_types';
import { type Sink } from '@syftdata/common/lib/types';
import type { ArrayLiteralExpression, Project } from 'ts-morph';
import { SyntaxKind, ObjectLiteralExpression } from 'ts-morph';
import { getConfigObject } from './ts_morph_utils';

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
  const config = getConfigObject(expression);
  if (config === undefined) return val;
  return {
    ...val,
    ...config
  };
}

export function getSinks(project: Project): Sink[] {
  let sinks: ArrayLiteralExpression | undefined;
  for (const sourceFile of project.getSourceFiles()) {
    const arrays = sourceFile
      .getVariableDeclarations()
      .map((variable) => {
        if (variable.getName() === 'sinks') {
          return variable.getInitializerIfKind(
            SyntaxKind.ArrayLiteralExpression
          );
        }
        return undefined;
      })
      .filter((x) => x !== undefined) as ArrayLiteralExpression[];
    if (arrays.length > 0) {
      sinks = arrays[0];
    }
    if (sinks !== undefined) break;
  }

  if (sinks === undefined) return [];

  const sinkObjects = sinks
    .getElements()
    .map((element) => {
      if (element instanceof ObjectLiteralExpression) {
        return getConfigObject(element);
      }
      return undefined;
    })
    .filter((x) => x !== undefined) as unknown as Sink[];
  return sinkObjects;
}
