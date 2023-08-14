import { mergeEventTags } from "../taggingapp/merge";
import { ActionType, MessageType, ReactElement, ReactSource } from "../types";
import { buildBaseAction1 } from "../visualtagger/utils";

const cleanupObj = (
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

const getDOMProps = (source: ReactSource, fiber: any): Record<string, any> => {
  const data: Record<string, any> = {};
  data.name = source.name;

  const element = getStateNode(fiber);
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

const getCleanerState = (node: any): Record<string, any> => {
  const state = node.memoizedState?.memoizedState ?? {};
  const { deps, next, inst, lanes, tag, current, ...cleanerState } = state;
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
const HTML_HANDLERS = [
  ["onclick", "onClick"],
  ["onhover", "onHover"],
  ["href", "onClick"],
];
const COMP_WITH_RENDER_HANDLERS = new Set(["InfiniteProducts", "ProductInfo"]);
const COMP_WITH_CLICK_HANDLERS = new Set(["ProductPreview", "Button"]);
function getStateNode(fiber: any): HTMLElement | undefined {
  if (fiber == null) return;
  if (fiber.stateNode instanceof HTMLElement) {
    return fiber.stateNode;
  }
  if (fiber.child?.stateNode instanceof HTMLElement) {
    return fiber.child.stateNode;
  }
}

function figureOutTriggers(source: ReactSource, fiber: any): string[] {
  const triggers: string[] = [];
  const element =
    fiber.stateNode instanceof HTMLElement ? fiber.stateNode : null;
  HTML_HANDLERS.forEach((handler) => {
    if (
      element?.hasAttribute(handler[0]) ||
      source.props.hasOwnProperty(handler[0])
    ) {
      if (!triggers.includes(handler[1])) triggers.push(handler[1]);
    }
  });

  Object.entries(source.props).forEach(([key, value]) => {
    if (typeof value === "function") {
      if (!triggers.includes(key)) triggers.push(key);
    }
  });
  if (COMP_WITH_RENDER_HANDLERS.has(source.name)) {
    if (!triggers.includes("onRender")) triggers.push("onRender");
  }
  if (COMP_WITH_CLICK_HANDLERS.has(source.name)) {
    if (!triggers.includes("onClick")) triggers.push("onClick");
  }
  return triggers;
}

function getReactSourceFromFiber(fiber: any): ReactSource | undefined {
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
      handlers: ["onLoad"],
    };
  }

  if (fiber.type == null || typeof fiber.type === "string") {
    return;
  }
  const source: ReactSource = {
    name: fiber.type.name ?? fiber.type.displayName ?? fiber.type.render?.name,
    source: fiber._debugSource?.fileName,
    line: fiber._debugSource?.lineNumber,
    handlers: [],
    props: {},
  };

  // find src folder and remove everything before it. This is to make the source path relative.
  source.source = source.source?.substring(source.source.indexOf("/src/"));
  const memoizedState = getCleanerState(fiber);
  const memoizedContext = getContextValues(fiber);
  const domProps = getDOMProps(source, fiber);

  source.props = {
    ...source.props,
    ...fiber.memoizedProps,
    ...memoizedState,
    ...memoizedContext,
    dom: domProps,
    // global: {
    //   location: window.location,
    //   userAgent: window.navigator.userAgent,
    // },
  };
  source.handlers = figureOutTriggers(source, fiber);
  source.props = cleanupObj(source.props) ?? {};
  return source;
}

function extractReactElement(fiber: any): ReactElement | undefined {
  if (fiber == null) return;

  const reactSource = getReactSourceFromFiber(fiber);
  if (reactSource != null) {
    const stateNode = getStateNode(fiber);
    // two hide error boundaries, invisible elements.
    if (stateNode == null) {
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
  // flatten the hierarchy and assign parents to react source.
  const reactElements: ReactElement[] = [];
  const traverseReactElements = (
    element: ReactElement,
    parent?: ReactElement
  ) => {
    reactElements.push(element);
    if (parent != null) {
      element.parent = parent;
    }
    if (element.children != null) {
      element.children.forEach((ch) => traverseReactElements(ch, element));
    }
  };
  traverseReactElements(htmlElement, undefined);

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
  // stateNode
  if (event.data.type === MessageType.GetReactEles) {
    const reactElements = computeReactComponents();
    try {
      window.postMessage({
        type: MessageType.ReactElesResp,
        data: mergeEventTags(reactElements),
      });
    } catch (e) {
      try {
        JSON.stringify(reactElements[0]);
      } catch (e) {
        console.error("Could not stringify react elements", e);
      }
      console.error(e);
    }
  }
  return true;
});
