import { NamingCase, type SyftEventType } from '@syftdata/client';
import { convertCase } from '@syftdata/client/lib/utils';
import {
  type TypeField,
  type AST,
  type EventSchema,
  type Field
} from '@syftdata/common/lib/types';
import { type Project } from 'ts-morph';
import { AmplitudeAnalyser } from './plugins/amplitude';
import { GAAnalyser } from './plugins/gtag';
import { handleSourceFile } from './plugins/base';

export interface Usage {
  eventType: SyftEventType;
  eventName: string;
  typeFields: TypeField[];
}

function mergeTypes(
  type1: TypeField,
  type2: TypeField,
  debugName: string
): TypeField {
  if (type1.name !== type2.name || type1.type.name !== type2.type.name) {
    console.error(`Found incompatible field types for ${debugName}`);
    return type1;
  }
  return {
    ...type1,
    isOptional: type1.isOptional || type2.isOptional
  };
}

function getEventSchema(name: string, usageArray: Usage[]): EventSchema {
  const fieldNameToTypeMap = new Map<string, TypeField>();
  const fieldNameToCount = new Map<string, number>();
  usageArray.forEach((usage) => {
    usage.typeFields.forEach((typeField) => {
      const existingType = fieldNameToTypeMap.get(typeField.name);
      fieldNameToCount.set(
        typeField.name,
        (fieldNameToCount.get(typeField.name) ?? 0) + 1
      );
      if (existingType != null) {
        fieldNameToTypeMap.set(
          typeField.name,
          mergeTypes(existingType, typeField, `${name}.${typeField.name}`)
        );
      } else {
        fieldNameToTypeMap.set(typeField.name, typeField);
      }
    });
  });

  const fields: Field[] = [...fieldNameToTypeMap.entries()].map((entry) => {
    const fieldName = entry[0];
    const type = entry[1];
    const field: Field = {
      name: fieldName,
      type: {
        ...type.type,
        name: type.type.name,
        zodType: type.type.zodType
      },
      isOptional:
        type.isOptional ||
        (fieldNameToCount.get(fieldName) ?? 0) < usageArray.length
    };
    return field;
  });

  return {
    name: convertCase(name, NamingCase.PASCAL),
    eventType: usageArray[0].eventType,
    fields,
    zodType: ''
  };
}

export function analyzeAST(project: Project): AST {
  let usageDetails: Usage[] = [];
  const sourceFiles = project.getSourceFiles();
  const plugins = [new AmplitudeAnalyser(), new GAAnalyser()];
  sourceFiles.forEach((sourceFile) => {
    usageDetails = usageDetails.concat(handleSourceFile(sourceFile, plugins));
  });

  // merge usageDetails into arrays based on eventName field.
  const usageMapByEventName = new Map<string, Usage[]>();
  usageDetails.forEach((usage) => {
    const eventName = usage.eventName;
    if (usageMapByEventName.has(eventName)) {
      usageMapByEventName.get(eventName)?.push(usage);
    } else {
      usageMapByEventName.set(eventName, [usage]);
    }
  });
  const eventSchemas = Array.from(usageMapByEventName.entries()).map(
    ([eventName, usageDetails]) => getEventSchema(eventName, usageDetails)
  );

  return {
    eventSchemas,
    config: {
      projectName: 'Test',
      version: '0.0.1'
    },
    sinks: [],
    inputs: []
  };
}
