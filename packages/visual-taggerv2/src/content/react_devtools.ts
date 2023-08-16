import { mergeEventTags } from "../taggingapp/merge";
import { ActionType, MessageType, ReactElement, ReactSource } from "../types";
import { buildBaseAction1 } from "../visualtagger/utils";
import {
  cleanupObj,
  getCleanerState,
  getContextValues,
  getDOMProps,
  getStateNode,
} from "./utils";

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
const COMP_WITH_CLICK_HANDLERS = new Set(["Button"]);

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
  const reactSource = getReactSourceFromFiber(fiber);
  if (reactSource != null) {
    const stateNode = getStateNode(reactSource, fiber);
    // to hide error boundaries and invisible elements.
    if (stateNode == null) {
      // console.log(
      //   ">>>> state node not found ",
      //   reactSource.name,
      //   reactSource.props
      // );
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
