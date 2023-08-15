import { ReactSource } from "../types";

export function getStateNode(
  source: ReactSource,
  fiber: any
): HTMLElement | undefined {
  if (fiber == null) return;
  if (fiber.stateNode instanceof HTMLElement) {
    return fiber.stateNode;
  }
  if (fiber.child?.stateNode instanceof HTMLElement) {
    return fiber.child.stateNode;
  }
  if (source.name === "ProductPreview") {
    if (fiber.child?.child?.stateNode instanceof HTMLElement) {
      return fiber.child.child.stateNode;
    }
  }
}

export const cleanupObj = (
  obj: Record<string, any>,
  maxDepth: number = 3,
  depth: number = 0
): Record<string, any> | undefined => {
  if (obj == null) return;
  const transformed = Object.entries(obj)
    .map(([key, value]) => {
      if (
        key.startsWith("_") ||
        key == "children" ||
        (value != null &&
          (value instanceof HTMLElement ||
            value.constructor?.name === "FiberNode"))
      ) {
        return;
      }
      if (typeof value === "object" && depth < maxDepth) {
        const cleanedObj = cleanupObj(value, maxDepth, depth + 1);
        if (cleanedObj != null) {
          return [key, cleanedObj];
        }
      } else if (
        ["bigint", "string", "boolean", "number", "undefined"].includes(
          typeof value
        )
      ) {
        return [key, value];
      }
    })
    .filter((v) => v != null) as [string, any][];
  if (transformed.length === 0) {
    return;
  }
  return Object.fromEntries(transformed);
};

export const getDOMProps = (
  source: ReactSource,
  fiber: any
): Record<string, any> => {
  const data: Record<string, any> = {};
  data.name = source.name;

  const element = getStateNode(source, fiber);
  if (element == null) return data;
  Object.entries(element.dataset).forEach(([key, value]) => {
    data[key] = value;
  });
  data.tagName = element.tagName;
  data.id = element.id;
  data.className = element.className;
  data.innerText = element.innerText.substring(0, 10);
  return data;
};

export const getCleanerState = (node: any): Record<string, any> => {
  const state = node.memoizedState?.memoizedState ?? {};
  const { deps, next, inst, lanes, tag, current, ...cleanerState } = state;
  return cleanerState;
};

export const getContextValues = (node: any): Record<string, any> => {
  let data: Record<string, any> = {};
  Object.entries(node.dependencies ?? {}).map(([key, dependent]) => {
    const val = (dependent as any).memoizedValue;
    if (val != null) {
      data = {
        ...data,
        [key]: val,
      };
    }
  });
  return data;
};
