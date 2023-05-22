import { type RemoteConfig } from '../config/remote';
import { type FileInfo } from '../init/destination';
import { logError } from '@syftdata/common/lib/utils';
import * as fs from 'fs';
import * as path from 'path';

export function writeTestSpecs(testFiles: FileInfo[], outDir: string): void {
  // generate basic assets.
  testFiles.forEach((file) => {
    if (file.content === undefined) {
      logError(`:warning: Test file ${file.name} is empty. Skipping..`);
      return;
    }
    const filePath = path.join(outDir, file.path);
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    fs.writeFileSync(filePath, file.content);
  });
}

export function readTestSpecs(
  input: string,
  remoteConfig: RemoteConfig
): FileInfo[] {
  const testFiles = fs
    .readdirSync(path.join(input, 'tests'), {
      withFileTypes: true
    })
    .filter((file) => file.isFile())
    .map((file) => {
      const filePath = path.join('tests', file.name);
      return {
        name: file.name,
        path: filePath,
        size: 0,
        sha: remoteConfig.shas.testSpecShas[filePath],
        content: ''
      };
    });

  // read all file contents for testFiles.
  return testFiles.map((file) => {
    const filePath = path.join(input, file.path);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    file.size = fileContent.length;
    file.content = fileContent;
    return file;
  });
}
