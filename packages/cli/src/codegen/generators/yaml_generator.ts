import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { type AST } from '@syftdata/common/lib/types';

function changeType(value: any): any {
  if (typeof value.name !== 'string') {
    return value;
  }
  if (value.name === '__type' || value.name === '__class') {
    return {
      ...value,
      name: 'object'
    };
  } else if (value.isArray === true) {
    return {
      ...value,
      name: 'array'
    };
  } else {
    return value.name;
  }
}

function replacer(key: string, value: any): any {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    const replacement = {};
    Object.keys(value).forEach((k) => {
      if (
        k === 'syftConfig' ||
        k === 'zodType' ||
        k === 'eventType' ||
        k === 'exported' ||
        k === 'documentation' ||
        k === 'isArray'
      )
        return;

      if (k === 'isOptional' || k === 'isMany') {
        if (value[k] == null || value[k] === false) return;
      }

      let key = k;
      if (k === 'eventSchemas') key = 'events';
      else if (k === 'dbSourceDetails') key = 'source';
      else if (k === 'dbRelation') key = 'relation';
      else if (k === 'typeFields') key = 'fields';

      if (key === 'type') {
        replacement[key] = changeType(value[k]);
        return;
      }
      replacement[key] = value[k];
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
  const astYaml = yaml.dump(ast, {
    replacer
  });
  fs.writeFileSync(path.join(destDir, 'schema.yaml'), astYaml);
}
