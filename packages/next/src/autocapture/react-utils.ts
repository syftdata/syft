import { type EventTag } from './types';

function getFiberForElement(element: HTMLElement): any {
  const fiberKey = Object.keys(element).find((key) =>
    key.startsWith('__reactFiber')
  );
  // @ts-expect-error __reactFiber is a private property
  return fiberKey != null ? element[fiberKey] : null;
}

function getReactComponentName(fiber: any): string | undefined {
  if (fiber.type == null || typeof fiber.type === 'string') {
    return;
  }
  const name =
    fiber.type.name ?? fiber.type.displayName ?? fiber.type.render?.name;
  if ((name as string)?.includes('__')) {
    // exclude styled components.
    return;
  }
  return name;
}

function findParentFiberWithHTML(fiber: any): any | undefined {
  // find the parent fiber with component name and state node.
  let current = fiber;
  let foundHTML = false; // initialize with true as the current element is from an HTML element.
  while (current != null) {
    if (current.stateNode instanceof Element) {
      foundHTML = true;
    }
    if (foundHTML) {
      const compName = getReactComponentName(current);
      if (compName != null) {
        return current;
      }
    }
    current = current.return;
  }
}

function getFiberChildren(fiber: any): any[] {
  const children: any[] = [];
  let child = fiber.child;
  while (child != null) {
    children.push(child);
    child = child.sibling;
  }
  return children;
}

function findChildFiberWithHTMLAndName(
  fiber: any,
  name: string
): any[] | undefined {
  // find the fibers with different component names first.
  const children = getFiberChildren(fiber).flatMap((child) => {
    const compName = getReactComponentName(child);
    if (compName != null) {
      if (compName === name) {
        return [child];
      }
      // if i have statenode children, i am not a provider or wrapper.
      const childChildren = getFiberChildren(child);
      const hasStateNode = childChildren.some(
        (child) => child.stateNode instanceof Element
      );
      if (hasStateNode) {
        return [];
      }
    }
    return findChildFiberWithHTMLAndName(child, name);
  });
  return children.filter((child) => child != null);
}

const REACT_PATH_SEPARATOR = ' > ';
export function pathOfReactElement(element: HTMLElement): string {
  const fiber = getFiberForElement(element);
  if (fiber == null) {
    return '';
  }

  const path: string[] = [];
  let current = findParentFiberWithHTML(fiber);
  let previous: any | undefined;
  while (current != null) {
    const compName = getReactComponentName(current);
    if (compName != null) {
      // find the index of the previous element in this component.
      if (previous != null) {
        const previousCompName = path[path.length - 1];
        const sibilings = findChildFiberWithHTMLAndName(
          current,
          previousCompName
        );
        if (sibilings != null && sibilings.length > 1) {
          const myIndex = sibilings.indexOf(previous);
          path[path.length - 1] = `${previousCompName}[${myIndex}]`;
        }
      }
      path.push(compName);
      previous = current;
    }
    current = findParentFiberWithHTML(current.return);
  }
  return path.reverse().join(REACT_PATH_SEPARATOR);
}

export function matchedEventTag(
  el: Element,
  event: Event,
  tag: EventTag,
  reactPath?: string
): boolean {
  try {
    if (tag.useReactPath === true) {
      // check if the reactPath matches with the suffix of the current reactPath.
      if (reactPath?.endsWith(tag.reactPath) !== true) {
        return false;
      }
    }
    const eventsToFire = tag.handlerToEvents[event.type] ?? [];
    if (eventsToFire.length > 0) {
      const selector = tag.selector;
      if (selector.startsWith('text=')) {
        const text = selector.slice(5);
        return el.textContent === text;
      }
      return el.matches(selector);
    }
  } catch (e) {}
  return false;
}
