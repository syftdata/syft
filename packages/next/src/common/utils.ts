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
