import { mergeEventTags } from "../taggingapp/merge";
import { ActionType, MessageType, ReactElement, ReactSource } from "../types";
import { buildBaseAction } from "../visualtagger/utils";

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
const figureOutTriggers = (node: any, source: ReactSource): string[] => {
  // extract handlers.
  const triggers = [];
  if (node.stateNode != null) {
    HTML_HANDLERS.forEach((handler) => {
      if (node.stateNode.getAttribute(handler) != null) {
        triggers.push(handler);
      }
    });
  }
  Object.entries(source.props).forEach(([key, value]) => {
    if (typeof value === "function") {
      triggers.push(key);
    }
  });
  if (COMP_WITH_RENDER_HANDLERS.has(source.name)) {
    triggers.push("onRender");
  }
  return triggers;
};

const getReactHierarchy = (node: any): ReactSource | undefined => {
  if (node == null || node._debugSource == null) return;

  const source: ReactSource = {
    name: node.type.name ?? node.type.displayName ?? node.type.render?.name,
    source: node._debugSource?.fileName,
    line: node._debugSource?.lineNumber,
    handlers: [],
    props: {},
    urlPath: window.location.pathname,
  };

  if (node._debugOwner != null) {
    source.parent = getReactHierarchy(node._debugOwner);
  }

  if (source.name == null) {
    // this could happen because of server side rendering.
    // if so, return the parent as the source.
    return source.parent;
  }

  const memoizedState = getCleanerState(node);
  const memoizedContext = getContextValues(node);
  source.props = {
    ...node.memoizedProps,
    ...memoizedState,
    ...memoizedContext,
    // global: {
    //   location: window.location,
    //   userAgent: window.navigator.userAgent,
    // },
  };

  source.handlers = figureOutTriggers(node, source);
  source.props = cleanupObj(source.props);

  // find src folder and remove everything before it. This is to make the source path relative.
  source.source = source.source?.substring(source.source.indexOf("/src/"));
  return source;
};

const COMP_WITH_RENDER_HANDLERS = new Set(["InfiniteProducts", "ProductInfo"]);
const getReactSource = (fiber: any): ReactSource | undefined => {
  return getReactHierarchy(fiber._debugOwner);
};

export function computeAllHtmlToReactComponentMapping1() {
  const reactHtmlelement = [...document.querySelectorAll("*")].find(
    (element) => {
      if (element instanceof HTMLElement) {
        const fiberKey = Object.keys(element).find((key) =>
          key.startsWith("__reactFiber")
        );
        // @ts-expect-error
        const fiber = fiberKey ? (element[fiberKey] as any) : null;
        if (fiber != null) return true;
      }
      return false;
    }
  );
  if (!reactHtmlelement) return [];
  // get to the parent fiber node.
  const fiberKey = Object.keys(reactHtmlelement).find((key) =>
    key.startsWith("__reactFiber")
  );
  // @ts-expect-error
  let rootFiber = fiberKey ? (element[fiberKey] as any) : null;
  while (rootFiber._debugOwner != null) {
    rootFiber = rootFiber._debugOwner;
  }

  // now extract all the react elements.
  const extractReactElement = (node: any) => {
    if (node == null) return;
    if (node.stateNode != null) {
      const reactSource = getReactSource(node);
      if (reactSource != null) {
        return {
          ...buildBaseAction({
            target: node.stateNode,
            timeStamp: 0,
          }),
          reactSource,
          type: ActionType.ReactElement,
          handlerToEvents: {
            onclick: [],
            onhover: [],
            onRender: [],
          },
        } as ReactElement;
      }
    }
  };

  const traverse = (node: any): ReactElement[] | undefined => {
    const reactElement = extractReactElement(node);
    if (reactElement == null) return;

    if (node.child != null) {
      const childElements = traverse(node.child);
      reactElement.children = childElements;
    }
    if (node.sibling != null) {
      const siblings = traverse(node.sibling);
      if (siblings != null) {
        return [reactElement, ...siblings];
      }
    }
    return [reactElement];
  };
  const rootReactElements = traverse(rootFiber);

  const pageElement = {
    ...buildBaseAction({
      target: document.body,
      timeStamp: 0,
    }),
    reactSource: {
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
    },
    type: ActionType.ReactElement,
    handlerToEvents: {
      onload: [],
    },
    children: rootReactElements,
  } as ReactElement;

  // build hierarchy

  // flatten the hierarchy
  const reactElements: ReactElement[] = [];
  const traverseReactElements = (element: ReactElement) => {
    reactElements.push(element);
    if (element.children != null) {
      element.children.forEach(traverseReactElements);
    }
  };

  // filter out non-interesting elements.
  return reactElements.filter((el) => {
    if (el.reactSource.handlers.length !== 0) return true;
    if (el.children?.find((child) => child.reactSource.handlers.length !== 0))
      return true;
    return false;
  });
}

export function computeAllHtmlToReactComponentMapping() {
  const reactElements: ReactElement[] = [];
  document.querySelectorAll("*").forEach((element) => {
    //if (element.nodeType !== Node.ELEMENT_NODE) return;
    if (!(element instanceof HTMLElement)) return;

    const fiberKey = Object.keys(element).find((key) =>
      key.startsWith("__reactFiber")
    );
    // @ts-expect-error
    const fiber = fiberKey ? (element[fiberKey] as any) : null;
    if (fiber != null) {
      const source = getReactSource(fiber);
      if (source == null) return;

      const action = buildBaseAction({
        target: element,
        timeStamp: 0,
      });
      const handlerToEvents: Record<string, string[]> = {};
      source.handlers.forEach((handler) => {
        handlerToEvents[handler] = [];
      });
      reactElements.push({
        ...action,
        reactSource: source,
        type: ActionType.ReactElement,
        handlerToEvents,
      });
    }
  });
  const pageElement = {
    ...buildBaseAction({
      target: document.body,
      timeStamp: 0,
    }),
    reactSource: {
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
    },
    type: ActionType.ReactElement,
    handlerToEvents: {
      onload: [],
    },
  } as ReactElement;
  reactElements.push(pageElement);

  // build hierarchy

  // filter out non-interesting elements.
  return reactElements.filter((el) => el.reactSource.handlers.length !== 0);
}

window.addEventListener("message", (event) => {
  if (event.data.type === MessageType.GetReactEles) {
    const reactElements = computeAllHtmlToReactComponentMapping();
    window.postMessage({
      type: MessageType.ReactElesResp,
      data: mergeEventTags(reactElements),
    });
  }
  return true;
});
