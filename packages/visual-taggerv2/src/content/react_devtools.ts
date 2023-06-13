import { MessageType, ReactSource } from "../types";

const getReactHierarchy = (node: any): ReactSource | undefined => {
  if (node == null) return;
  const source: ReactSource = {
    name: node.type.name ?? node.type.displayName,
    source: node._debugSource?.fileName,
  };
  if (node._debugOwner != null) {
    source.parent = getReactHierarchy(node._debugOwner);
  }
  if (source.name == null && source.source == null) {
    return source.parent;
  }
  return source;
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
      const element = fiber.stateNode;
      const source = getReactHierarchy(fiber);

      element.setAttribute("data-syft-source", JSON.stringify(source));

      const val = Object.values(props).findIndex(
        (val: any) => typeof val === "function"
      );
      if (val !== -1) {
        element.setAttribute("data-syft-has-handler", true);
      }
    }
  });
  return eleToReact;
}

window.addEventListener("message", (event) => {
  if (event.data.type !== MessageType.GetSourceFile) return;
  computeAllHtmlToReactComponentMapping();
  window.postMessage({
    type: MessageType.GetSourceFileResponse,
  });
  return true;
});
