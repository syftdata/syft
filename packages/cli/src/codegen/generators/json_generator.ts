import * as fs from 'fs';
import * as path from 'path';
import { type AST } from '@syftdata/common/lib/types';

function replacer(key: string, value: any): any {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    const replacement = {};
    Object.keys(value).forEach((k) => {
      if (k === 'syftConfig') return;
      replacement[k] = value[k];
    });
    return replacement;
  }
  return value;
}

export function generate(ast: AST, destDir: string): void {
  fs.mkdirSync(destDir, { recursive: true });
  ast.eventSchemas = ast.eventSchemas.filter((schema) => {
    return schema.exported === true;
  });
  const astJson = JSON.stringify(ast, replacer, 2);
  fs.writeFileSync(path.join(destDir, 'schema.json'), astJson);
}
