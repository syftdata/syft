import { type FileInfo } from '../init/destination';
import * as fs from 'fs';
import * as path from 'path';

interface RemoteShas {
  eventSchemaSha?: string;
  testSpecShas: Record<string, string>;
}
export interface RemoteConfig {
  branch: string;
  shas: RemoteShas;
}

const REMOTE_JSON_FILE = '.remote.json';

export function writeRemoteConfig(
  branch: string,
  eventSchemaSha: string | undefined,
  testSpecs: FileInfo[],
  outDir: string
): void {
  const testSpecShas = testSpecs
    .filter((f) => f.sha != null)
    .reduce((obj, f) => {
      obj[f.path] = f.sha ?? '';
      return obj;
    }, {});
  const remoteConfig: RemoteConfig = {
    branch,
    shas: {
      eventSchemaSha,
      testSpecShas
    }
  };
  fs.writeFileSync(
    path.join(outDir, REMOTE_JSON_FILE),
    JSON.stringify(remoteConfig, null, 2)
  );
}

export function readRemoteConfig(input: string): RemoteConfig | undefined {
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(input, REMOTE_JSON_FILE), 'utf-8')
    ) as RemoteConfig;
    return config;
  } catch (e) {}
}
