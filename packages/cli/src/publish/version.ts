import type { AST } from '@syftdata/common/lib/types';

export function requiresVersionBump(ast: AST): boolean {
  return true;
}
