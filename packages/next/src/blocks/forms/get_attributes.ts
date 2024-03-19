import { type AttributeSet, type SyftFormField } from './types';

export function convertToAttributeSet(fields: SyftFormField[]): AttributeSet {
  return Object.fromEntries(
    fields.map((field) => {
      const name = field.name ?? field.label ?? field.id;
      return [name, field.value];
    })
  );
}

export function getAttributeSet<E>(
  fields: SyftFormField[],
  fieldNames: string[],
  mapping: Record<string, string> = {}
): E {
  const data = fields
    .map((field) => {
      const data = [field.id, field.name, field.label, field.type];
      const fieldName = data.find(
        (f) => f != null && fieldNames.some((x) => f.toLowerCase().includes(x))
      );
      if (fieldName == null || field.value == null) return undefined;
      return [mapping[fieldName] ?? fieldName, field.value];
    })
    .filter((x) => x != null) as Array<[string, string]>;

  return Object.fromEntries(data) as E;
}
