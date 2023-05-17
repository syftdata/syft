import type { AST } from '@syftdata/common/lib/types';

// NOTE: THIS IS FOR GIT CODE POINTERS (NOT YET IMPLEMENTED).
// DO NOT GET CONFUSED WITH SYFT REMOTE GIT.

export interface GitLocation {
  filePath: string;
  gitPath: string;
  lineNum: number;
}

export interface GitLocations {
  tag?: string; // tag if available.
  head: string; // git head
  definitions: Map<string, GitLocation>; // git location of each event definition. (aka schema file)
  callers: Map<string, GitLocation[]>; // git location of callers for each event.
}

export function getCallers(ast: AST): Map<string, GitLocation[]> {
  console.log('nothing happened here');
  return new Map();
}
