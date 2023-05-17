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
import { ANY_TYPE, getZodType, getZodTypeForSchema } from './zod_utils';

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
  return {
    name: property.getName(),
    type,
    isOptional: hasQuestion
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
  let enumValues: string[] = [];
  const isOptional = typeObj.isNullable();
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
  } else if (typeObj.isUnion() && !typeObj.isBoolean()) {
    const subtypes = typeObj.getUnionTypes();
    let incompatibleSubType = false;
    enumValues = subtypes.map((subtype) => {
      if (subtype.isEnumLiteral()) {
        const enumVal = subtype.getLiteralValue()?.toString();
        if (enumVal != null) {
          return subtype.isStringLiteral() ? `"${enumVal}"` : enumVal;
        }
      } else if (
        subtype.isStringLiteral() ||
        subtype.isNumberLiteral() ||
        subtype.isBooleanLiteral()
      ) {
        return subtype.getText();
      }
      incompatibleSubType = true;
      return '';
    });
    if (!incompatibleSubType) {
      name = enumValues.join(' | ');
    } else {
      logInfo(
        `:warning: Unknown type is seen: "${debugName}: ${name}". using "any" for now`
      );
      name = 'any';
    }
  } else if (typeObj.isAny()) {
    // throw error.
    logInfo(`:warning: Any type is seen: "${debugName}".`);
    name = 'any';
    foundUnsuppotedCloudType = true;
  }

  if (foundUnsuppotedCloudType) {
    logInfo(
      `:prohibited: ${debugName} field is defined as ${name} type, which is not supported on the cloud.`
    );
  }

  let zodType = `z.${getZodType(name, enumValues, syfttype)}`;
  if (zodType === ANY_TYPE) {
    logInfo(
      `Used an unknown field type ${name}. No validations will be performed`
    );
  }

  if (isOptional) {
    zodType = `${zodType}.optional()`;
  }

  return {
    name,
    syfttype,
    zodType
  };
}
