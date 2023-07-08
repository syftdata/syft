import { capitalize } from '@syftdata/common/lib/utils';
import * as findUp from 'find-up';
import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_FOLDER = 'syft';
export function getSchemaFolder(): string {
  // TODO: get the root of the project. and create schema folder.
  let projectRootFolder = '.';
  const projectFilePath = findUp.sync(['package.json']);
  if (projectFilePath !== undefined && projectFilePath !== null) {
    projectRootFolder = path.relative(
      path.dirname(projectFilePath),
      projectRootFolder
    );
  }
  return path.join(projectRootFolder, SCHEMA_FOLDER);
}

export function getTestSpecFolder(schemaFolder?: string): string {
  const dir = schemaFolder ?? getSchemaFolder();
  return path.join(dir, 'tests');
}

export function createDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Used to match words composed of alphanumeric characters. */
// eslint-disable-next-line no-control-regex
const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
export function asciiWords(val: string): string[] {
  return val.replace(/['\u2019]/g, '').match(reAsciiWord) ?? [];
}

export function getHumanizedEventName(name: string): string {
  return asciiWords(name).map(capitalize).join(' ');
}
