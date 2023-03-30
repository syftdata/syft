/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import type { ApiField } from './types';

/* eslint-disable no-prototype-builtins */
function isArray(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function mapFields(object: any): any {
  if (isArray(object)) {
    return object.map(mapFields);
  } else if (typeof object === 'object') {
    const objFields: any = [];
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const val = object[key];

        if (val === undefined) {
          continue;
        }

        const objField: ApiField = {
          name: key,
          type: getFieldType(val)
        };
        if (typeof val === 'object' && val != null) {
          objField.children = mapFields(val);
        }
        objFields.push(objField);
      }
    }
    return objFields;
  } else {
    return getFieldType(object);
  }
}

export function extractSchema(fields: Record<string, any>): ApiField[] {
  if (fields === null || fields === undefined) {
    return [];
  }
  return mapFields(fields);
}

function getFieldType(val: any): string {
  const type = typeof val;
  if (val == null) {
    return 'null';
  } else if (type === 'string') {
    // TODO: check if this looks like an email / uuid etc.,
    return 'string';
  } else if (type === 'number' || type === 'bigint') {
    if (val.toString().includes('.')) {
      return 'float';
    } else {
      return 'int';
    }
  } else if (type === 'boolean') {
    return 'boolean';
  } else if (type === 'object') {
    if (isArray(val)) {
      return 'array';
    }
    return 'object';
  }
  return 'unknown';
}
