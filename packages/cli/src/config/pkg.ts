import { logError, logFatal, logUnknownError } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const CLIVersion = require('../../package.json').version;

export interface PackageJson {
  dir: string;
  path: string;
  json: any;
}

function getPackagePath(pkg: string): string | null {
  try {
    const pkgPath = require.resolve(`${pkg}/package.json`);
    if (pkgPath != null) {
      return path.dirname(pkgPath);
    }
  } catch (e) {} // eslint-disable-line no-empty
  return null;
}

export async function getClientPackage(): Promise<PackageJson> {
  const json = await new Promise<PackageJson>((resolve, reject) => {
    const dir = getPackagePath('@syftdata/client');
    if (dir === null) {
      logFatal(':warning: @syftdata/client package is not found.');
      reject(new Error('no @syftdata/client package'));
      return;
    }
    try {
      const filepath = path.join(dir, 'package.json');
      const json = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      resolve({
        dir,
        path: filepath,
        json
      });
    } catch (e) {
      logUnknownError(
        ':star: Failed to read @syftdata/client package.json.',
        e
      );
      reject(e);
    }
  });
  return json;
}

export function updatePackageJson(json: PackageJson): void {
  try {
    fs.writeFileSync(json.path, JSON.stringify(json.json, null, 2), 'utf8');
  } catch (e) {
    logError(':star: Failed to update package.json.');
  }
}
