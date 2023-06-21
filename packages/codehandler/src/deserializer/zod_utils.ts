import { type TypeField } from '@syftdata/common/lib/types';

const TypeToZodMapping = {
  number: 'number()',
  string: 'string()',
  boolean: 'boolean()',
  Date: 'date()',
  Object: 'object()'
};

const SyftTypeToZodMapping = {
  Email: 'string().email()',
  Url: 'string().url()',
  CountryCode: 'string().length(2)',
  UUID: 'string().uuid()',
  CUID: 'string().cuid()',
  CUID2: 'string().cuid2()'
};

export const ANY_TYPE = 'any()';

export function getZodType(
  type: string,
  enumValues: string[],
  syfttype?: string
): string {
  if (enumValues.length > 1) {
    // For Enum, return in the format of enum(["Salmon", "Tuna", "Trout"])
    return `enum([${enumValues.join(', ')}])`;
  }

  if (syfttype !== undefined) {
    return SyftTypeToZodMapping[syfttype] ?? ANY_TYPE;
  }
  return TypeToZodMapping[type] ?? ANY_TYPE;
}

export const ZOD_ALLOWED_TAGS: Record<string, string[]> = {
  number: [
    'min',
    'max',
    'positive',
    'negative',
    'nonnegative',
    'nonpositive',
    'multipleOf',
    'finite'
  ],
  string: ['min', 'max', 'length', 'startsWith', 'endsWith']
};

export function getZodTypeForSchema(fields: TypeField[]): string {
  return `z.object({
    ${fields
      .map((field) => `\t${field.name}: ${field.type.zodType}`)
      .join(',\n')}
  })`;
}
