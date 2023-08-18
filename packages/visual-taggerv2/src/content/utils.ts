import { ReactSource } from "../types";

// https://github.com/facebook/react/blob/6e4f7c788603dac7fccd227a4852c110b072fe16/packages/react-reconciler/src/ReactFiber.js#L78
// https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react
// https://www.velotio.com/engineering-blog/react-fiber-algorithm
// https://indepth.dev/posts/1007/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-to-walk-the-components-tree

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

// https://the-guild.dev/blog/react-hooks-system use this to understand the naming and give it a proper name.
const getStateProps = (
  source: ReactSource,
  state: any,
  index: number
): Record<string, any> | undefined => {
  if (!state) return;
  let result: Record<string, any> = {};
  if (state.memoizedState) {
    const { create, deps, next, inst, lanes, tag, current, ...rest } =
      state.memoizedState;
    result[index.toString()] = rest;
  }
  const nextObj = getStateProps(source, state.next, index + 1);
  if (nextObj) {
    result = {
      ...result,
      ...nextObj,
    };
  }
  return result;
};

const getContextProps = (
  source: ReactSource,
  context: any,
  index: number
): Record<string, any> | undefined => {
  if (!context) return;
  let result: Record<string, any> = {};
  if (context.memoizedValue) {
    const { create, deps, next, inst, lanes, tag, current, ...rest } =
      context.memoizedValue;
    result[index.toString()] = rest;
  }
  const nextObj = getContextProps(source, context.next, index + 1);
  if (nextObj) {
    result = {
      ...nextObj,
      ...result,
    };
  }
  return result;
};

export const getFiberState = (
  source: ReactSource,
  node: any
): Record<string, any> => {
  return getStateProps(source, node.memoizedState, 0) ?? {};
};

export const getFiberContext = (
  source: ReactSource,
  node: any
): Record<string, any> => {
  return getContextProps(source, node.dependencies?.firstContext, 0) ?? {};
};
