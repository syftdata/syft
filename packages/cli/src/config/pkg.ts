import { exec } from 'child_process';
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

export async function getClientPackage(): Promise<PackageJson> {
  const json = await new Promise<PackageJson>((resolve, reject) => {
    exec('npm ls @syftdata/client -p', (err, out) => {
      if (err != null) {
        logUnknownError(':warning: Failed to run npm command.', err);
        reject(err);
        return;
      }
      const dir = out.split('\n')[0].trim();
      if (dir === '') {
        logFatal(
          ':warning: @syftdata/client package is not found. Please install it'
        );
        reject(new Error('no client package'));
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
