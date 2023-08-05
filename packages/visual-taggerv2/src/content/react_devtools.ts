import { MessageType, ReactSource } from "../types";

/**
 * This module is injected into the page as content script.
 * This has access to the pages DOM and JS context.
 * This is used to access the React Devtools and get the React Hierarchy.
 */

const getReactHierarchy = (node: any): ReactSource | undefined => {
  if (node == null) return;

  const source: ReactSource = {
    name: node.type.name ?? node.type.displayName,
    source: node._debugSource?.fileName,
    line: node._debugSource?.lineNumber,
    props: {},
  };

  if (node._debugOwner != null) {
    source.parent = getReactHierarchy(node._debugOwner);
  }

  if (source.name == null) {
    // this could happen because of server side rendering.
    // if so, return the parent as the source.
    return source.parent;
  }

  // find src folder and remove everything before it. This is to make the source path relative.
  source.source = source.source?.substring(source.source.indexOf("/src/") + 5);

  return source;
};

const getReactSource = (node: any): ReactSource | undefined => {
  if (node == null) return;
  return getReactHierarchy(node._debugOwner);
};

export function computeAllHtmlToReactComponentMapping() {
  const eleToReact = new Map<Element, ReactSource>();
  document.querySelectorAll("*").forEach((element, i) => {
    if (element.nodeType !== Node.ELEMENT_NODE) return;

    const fiberKey = Object.keys(element).find((key) =>
      key.startsWith("__reactFiber")
    );
    const propsKey = Object.keys(element).find((key) =>
      key.startsWith("__reactProps")
    );
    // @ts-expect-error
    const fiber = fiberKey ? (element[fiberKey] as any) : null;
    // @ts-expect-error
    const props = propsKey ? (element[propsKey] as any) : null;
    if (fiber != null && props != null) {
      const source = getReactSource(fiber);
      const memoizedProps = { ...fiber.memoizedProps };
      const hasListener =
        element.tagName === "A" ||
        Object.values(props).findIndex((val: any) => typeof val === "function");

      Object.keys(memoizedProps).forEach((key) => {
        if (typeof memoizedProps[key] === "function") {
          delete memoizedProps[key];
        }
      });
      delete memoizedProps.children;

      if (source != null) {
        source.props = memoizedProps;
        eleToReact.set(element, source);
        element.setAttribute("data-syft-source", JSON.stringify(source));
      }
      if (hasListener !== -1) {
        element.setAttribute("data-syft-has-handler", "true");
      }
    }
  });
  return eleToReact;
}

window.addEventListener("message", (event) => {
  if (event.data.type === MessageType.GetSourceFile) {
    computeAllHtmlToReactComponentMapping();
    window.postMessage({
      type: MessageType.GetSourceFileResponse,
    });
  }
  return true;
});
