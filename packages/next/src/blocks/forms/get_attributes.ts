import { type AttributeSet, type SyftFormField } from './types';

export function convertToAttributeSet(fields: SyftFormField[]): AttributeSet {
  return Object.fromEntries(
    fields.map((field) => {
      const name = field.name ?? field.label ?? field.id;
      return [name, field.value];
    })
  );
}
