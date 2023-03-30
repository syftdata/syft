import type { AST } from '../codegen/types';

export function requiresVersionBump(ast: AST): boolean {
  return true;
}
