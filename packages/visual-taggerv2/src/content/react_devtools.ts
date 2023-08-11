import { mergeEventTags } from "../taggingapp/merge";
import { ActionType, MessageType, ReactElement, ReactSource } from "../types";
import { buildBaseAction1 } from "../visualtagger/utils";

const cleanupObj = (
  obj: Record<string, any>,
  maxDepth: number = 3,
  depth: number = 0
): Record<string, any> => {
  if (obj == null) return obj;
  const data = { ...obj };
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "object" && depth < maxDepth) {
      data[key] = cleanupObj(value, maxDepth, depth + 1);
    } else if (
      !["bigint", "string", "boolean", "number", "undefined"].includes(
        typeof value
      )
    ) {
      delete data[key];
    }
  });
  delete data.children;
  return data;
};

const getCleanerState = (node: any): Record<string, any> => {
  const state = node.memoizedState?.memoizedState ?? {};
  const { deps, next, inst, lanes, tag, ...cleanerState } = state;
  return cleanerState;
};

const getContextValues = (node: any): Record<string, any> => {
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

/**
 * This module is injected into the page as content script.
 * This has access to the pages DOM and JS context.
 * This is used to access the React Devtools and get the React Hierarchy.
 */
const HTML_HANDLERS = ["onclick", "onhover", "href"];
const COMP_WITH_RENDER_HANDLERS = new Set(["InfiniteProducts", "ProductInfo"]);
const COMP_WITH_CLICK_HANDLERS = new Set(["ProductPreview", "Button"]);
function figureOutTriggers(fiber: any, source: ReactSource): string[] {
  // extract handlers.
  const triggers: string[] = [];
  HTML_HANDLERS.forEach((handler) => {
    if (
      (fiber.stateNode instanceof HTMLElement &&
        fiber.stateNode.getAttribute(handler) != null) ||
      source.props[handler] != null
    ) {
      triggers.push(handler);
    }
  });
  Object.entries(source.props).forEach(([key, value]) => {
    if (typeof value === "function") {
      triggers.push(key);
    }
  });
  if (COMP_WITH_RENDER_HANDLERS.has(source.name)) {
    triggers.push("onRender");
  }
  if (COMP_WITH_CLICK_HANDLERS.has(source.name)) {
    triggers.push("onClick");
  }
  return triggers;
}

function getReactHierarchy(fiber: any): ReactSource | undefined {
  if (fiber.type === "body") {
    return {
      name: "Page",
      source: "",
      line: 0,
      props: {
        path: window.location.pathname,
        url: window.location.href,
        search: window.location.search,
        title: document.title,
        name: document.title,
        referrer: document.referrer,
      },
      urlPath: window.location.pathname,
      handlers: ["onload"],
    };
  }

  let source: ReactSource | undefined;
  if (fiber.type != null && typeof fiber.type !== "string") {
    source = {
      name:
        fiber.type.name ?? fiber.type.displayName ?? fiber.type.render?.name,
      source: fiber._debugSource?.fileName,
      line: fiber._debugSource?.lineNumber,
      handlers: [],
      props: {},
      urlPath: window.location.pathname,
    };
  } else {
    return;
  }
  if (source == null) return;
  if (fiber._debugOwner != null) {
    source.parent = getReactHierarchy(fiber._debugOwner);
  }

  // find src folder and remove everything before it. This is to make the source path relative.
  source.source = source.source?.substring(source.source.indexOf("/src/"));
  const memoizedState = getCleanerState(fiber);
  const memoizedContext = getContextValues(fiber);
  source.props = {
    ...source.props,
    ...fiber.memoizedProps,
    ...memoizedState,
    ...memoizedContext,
    // global: {
    //   location: window.location,
    //   userAgent: window.navigator.userAgent,
    // },
  };

  source.handlers = figureOutTriggers(fiber, source);
  source.props = cleanupObj(source.props);
  return source;
}

function extractReactElement(fiber: any): ReactElement | undefined {
  if (fiber == null) return;

  const reactSource = getReactHierarchy(fiber);
  if (reactSource != null) {
    let stateNode = fiber.stateNode;
    if (stateNode == null && fiber.child?.stateNode instanceof HTMLElement) {
      stateNode = fiber.child.stateNode;
    }

    // two hide error boundaries, invisible elements.
    if (stateNode == null || !(stateNode instanceof HTMLElement)) {
      return;
    }

    const element: ReactElement = {
      ...buildBaseAction1(stateNode),
      reactSource,
      type: ActionType.ReactElement,
      handlerToEvents: {},
    };
    element.reactSource.handlers.forEach((handler) => {
      element.handlerToEvents[handler] = [];
    });
    return element;
  }
}

function traverseReactFiber(node: any): ReactElement[] {
  const reactElement = extractReactElement(node);
  const childElements =
    node.child != null ? traverseReactFiber(node.child) : [];
  const siblingElements =
    node.sibling != null ? traverseReactFiber(node.sibling) : [];

  if (reactElement != null) {
    reactElement.children = childElements;
    return [reactElement, ...siblingElements];
  } else {
    return [...childElements, ...siblingElements];
  }
}

function findRootFiber(): any {
  const bodyEl = document.querySelector("body");
  if (bodyEl instanceof HTMLElement) {
    const fiberKey = Object.keys(bodyEl).find((key) =>
      key.startsWith("__reactFiber")
    );
    // @ts-expect-error
    const rootFiber = fiberKey ? (bodyEl[fiberKey] as any) : null;
    return rootFiber;
  }
}

export function computeReactComponents() {
  const rootFiber = findRootFiber();
  if (rootFiber == null) {
    return [];
  }

  const rootReactElements = traverseReactFiber(rootFiber);
  if (rootReactElements == null || rootReactElements.length === 0) {
    return [];
  }

  const htmlElement: ReactElement = rootReactElements[0];
  // build hierarchy

  // flatten the hierarchy
  const reactElements: ReactElement[] = [];
  const traverseReactElements = (element: ReactElement) => {
    reactElements.push(element);
    if (element.children != null) {
      element.children.forEach(traverseReactElements);
    }
  };
  traverseReactElements(htmlElement);

  // filter out non-interesting elements.
  return reactElements;
  // return reactElements.filter((el) => {
  //   if (el.reactSource.handlers.length !== 0) return true;
  //   if (el.children?.find((child) => child.reactSource.handlers.length !== 0))
  //     return true;
  //   return false;
  // });
}

window.addEventListener("message", (event) => {
  if (event.data.type === MessageType.GetReactEles) {
    const reactElements = computeReactComponents();
    window.postMessage({
      type: MessageType.ReactElesResp,
      data: mergeEventTags(reactElements),
    });
  }
  return true;
});
