import { getAttributes } from 'dom-utils';

export const isBrowser = (): boolean => typeof window !== 'undefined';

export const uuid = (): string => {
  if (isBrowser() && window.crypto != null) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function searchParams(search: string): URLSearchParams | undefined {
  if (search === '' || search == null) {
    return undefined;
  }
  return new URLSearchParams(search);
}

export function mapValues<
  Obj extends Record<string, Values>,
  Values extends Record<string, unknown>,
  ValueKey extends keyof Values
>(obj: Obj, key: ValueKey): Record<keyof Obj, Obj[keyof Obj][ValueKey]> {
  type ResultType = Record<keyof Obj, Obj[keyof Obj][ValueKey]>;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const result = {} as ResultType;
  return Object.entries(obj).reduce<ResultType>((agg, [name, value]) => {
    const nameKey = name as keyof Obj;
    agg[nameKey] = value[key] as Obj[keyof Obj][ValueKey];
    return agg;
  }, result);
}

/**
 * Retrieves the attributes from an DOM element and returns a fields object
 * for all attributes matching the passed prefix string.
 * @param {Element} element The DOM element to get attributes from.
 * @param {string} prefix An attribute prefix. Only the attributes matching
 *     the prefix will be returned on the fields object.
 */
export function getAttributeFields(
  element: Element,
  prefix: string = ''
): Record<string, unknown> {
  const attributes = getAttributes(element);
  const attributeFields = {};

  Object.keys(attributes).forEach(function (attribute) {
    // The `on` prefix is used for event handling but isn't a field.
    if (attribute.indexOf(prefix) === 0) {
      let value = attributes[attribute];

      // Detects Boolean value strings.
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      const field = attribute.slice(prefix.length);
      attributeFields[field] = value;
    }
  });

  return attributeFields;
}
