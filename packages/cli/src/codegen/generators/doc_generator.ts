import * as fs from 'fs';
import { logInfo } from '../../utils';
import { type AST } from '@syftdata/common/lib/types';

export function generate(ast: AST, destDir: string): void {
  fs.mkdirSync(destDir, { recursive: true });
  logInfo('This functionality is not yet available :sad:');
  // now write one .md file per event. under a source directory.
}
