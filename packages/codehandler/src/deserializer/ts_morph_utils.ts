import {
  type JSDoc,
  type JSDocTag,
  type ts,
  type Type,
  type Symbol as TSSymbol,
  SyntaxKind
} from 'ts-morph';
import { logInfo } from '@syftdata/common/lib/utils';
import {
  type TypeField,
  type Field,
  type TypeSchema
} from '@syftdata/common/lib/types';
import { getZodType, getZodTypeForSchema } from './zod_utils';

// const SyftypeModuleIndex = 'client/src/index".type.'
const SyftypeIndex = 'type.';

export function getTags(docs: JSDoc[]): Array<JSDocTag<ts.JSDocTag>> {
  return docs.reduce<Array<JSDocTag<ts.JSDocTag>>>((prev, curr) => {
    return [...prev, ...curr.getTags()];
  }, []);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printType(type: Type): void {
  console.log('>>>>> printType ', type.getText());
  const proto = Object.getPrototypeOf(type);
  for (const member of Object.getOwnPropertyNames(proto)) {
    if (member.startsWith('is')) {
      if (typeof type[member] === 'function') {
        const result = type[member]();
        if (result === true) {
          console.log('>>> member ', member);
        }
      }
    }
  }
}

/**
 * This method returns TypeSchema of a field.
 * @param property
 * @returns
 */
function getTypeField(property: TSSymbol, debugName: string): TypeField {
  const declaration = property.getValueDeclarationOrThrow();
  const type = getTypeSchema(declaration.getType(), debugName);
  const hasQuestion =
    declaration.getFirstChildByKind(SyntaxKind.QuestionToken) != null;
  const isOptional =
    hasQuestion ||
    declaration.getType().isNullable() ||
    declaration.getType().isUndefined();

  if (isOptional) {
    type.zodType = `${type.zodType}.optional()`;
  }

  return {
    name: property.getName(),
    isOptional,
    type
  };
}

/**
 * This method returns TypeSchema for complex objects like
 * class / interface / type.
 * @param typeObj
 * @returns
 */
function getTypeSchemaForComplexObject(
  typeObj: Type<ts.Type>,
  debugName: string
): TypeSchema {
  let name = typeObj.getSymbol()?.getEscapedName() ?? 'Unknown';
  if (typeObj.isAnonymous()) {
    name = typeObj.getAliasSymbol()?.getEscapedName() ?? name;
  }

  const typeFields = typeObj
    .getApparentProperties()
    .map((property) =>
      getTypeField(property, `${debugName}.${property.getEscapedName()}`)
    )
    .filter((field) => field != null) as Field[];

  const zodType = getZodTypeForSchema(typeFields);
  return {
    name,
    typeFields,
    zodType
  };
}

const KNOWN_TYPES = new Set(['Date', 'string', 'number', 'Object']);

/**
 * This method returns type-schema for all types of fields.
 * including primitives, enums, class/interface and types.
 * @param typeObj
 * @returns
 */
export function getTypeSchema(
  typeObj: Type<ts.Type>,
  debugName: string
): TypeSchema {
  let name = typeObj.getText();
  let debugType = typeObj.getText(); // used to give detailed messages.
  let unionTypes: string[] = [];
  let syfttype: string | undefined;
  let foundUnsuppotedCloudType = false;

  if (typeObj.isClassOrInterface() || name.includes(SyftypeIndex)) {
    if (name.includes(SyftypeIndex)) {
      // TODO: all types that start with "type." are treated as syft-types.
      // Downside: if syft-types are imported as something else, this doesn't work.
      // if something else is imported as type. it gets aggected.
      const typeStrLoc = name.indexOf(SyftypeIndex);
      syfttype = name.slice(typeStrLoc + SyftypeIndex.length);
      name = 'string';
    } else if (!KNOWN_TYPES.has(name)) {
      foundUnsuppotedCloudType = true;
      return getTypeSchemaForComplexObject(typeObj, debugName);
    }
  } else if (typeObj.isObject()) {
    foundUnsuppotedCloudType = true;
    return getTypeSchemaForComplexObject(typeObj, debugName);
  } else if (typeObj.isEnum()) {
    unionTypes = typeObj.getUnionTypes().map((subtype) => {
      if (subtype.isStringLiteral()) {
        name = 'string';
      } else {
        name = 'number';
      }
      const enumVal = subtype.getLiteralValue()?.toString() ?? '';
      return subtype.isStringLiteral() ? `"${enumVal}"` : enumVal;
    });
  } else if (typeObj.isUnion()) {
    const subtypes = typeObj.getUnionTypes().filter((subtype) => {
      console.log('>>> subtype is ', subtype.isUndefined(), subtype.getText());
      return !(subtype.isUndefined() || subtype.isNull());
    });
    if (subtypes.length > 1) {
      // booleans are special case. they are shown as union of true and false.
      // check if remaining subtypes are true and false.
      const isBoolean = subtypes.every((subtype) => subtype.isBooleanLiteral());
      if (isBoolean) {
        name = 'boolean';
      } else {
        debugType = 'Union type';
        name = 'any';
        foundUnsuppotedCloudType = true;
      }
    } else {
      const subtype = subtypes[0];
      if (subtype.isLiteral()) {
        unionTypes = [subtype.getText()];
      } else {
        return getTypeSchema(subtypes[0], debugName);
      }
    }
  } else if (typeObj.isAny()) {
    // throw error.
    debugType = 'any';
    name = 'any';
    foundUnsuppotedCloudType = true;
  }

  if (foundUnsuppotedCloudType) {
    logInfo(
      `:prohibited: Unsupported ${debugType} type is seen on "${debugName}: ${typeObj.getText()}". using "any" for now`
    );
  }

  const zodType = `z.${getZodType(name, unionTypes, syfttype)}`;
  return {
    name,
    syfttype,
    zodType
  };
}
