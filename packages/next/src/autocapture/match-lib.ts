import { type EventTag } from './types';

export interface PathMatchResult {
  matched: boolean;
  matchedElement?: Element;
  matchedPathComps: Array<PathComponent | undefined>;

  elPathComps: PathComponent[];
  tagPathComps: any[];
}

interface PathComponent {
  name: string;
  index: number;
  ele: Element;
}
export function getPath(element: HTMLElement): PathComponent[] {
  const fiber = getFiberForElement(element);
  if (fiber == null) {
    return [];
  }

  const paths: PathComponent[] = [];
  let current = findParentFiberWithHTML(fiber);
  let previous: FiberElement | undefined;
  while (current != null) {
    // find the index of the previous element in this component.
    if (previous != null) {
      const siblings = findChildFibersWithName(current.fiber, previous.name);
      if (siblings.length > 1) {
        const previousComp = paths[paths.length - 1];
        previousComp.index = siblings.indexOf(previous.fiber);
      }
    }
    paths.push({
      name: current.name,
      index: -1,
      ele: current.ele
    });
    previous = current;
    current = findParentFiberWithHTML(current.fiber.return);
  }
  return paths.reverse();
}

function getComponentAndIndex(pathComp: string): PathComponent {
  const matches = pathComp.match(/(.*)\[(\d+)\]/);
  const index = matches == null ? -1 : parseInt(matches[2]);
  const name = matches == null ? pathComp : matches[1];
  return { name, index, ele: document.body };
}
const REACT_PATH_SEPARATOR = ' > ';
function getComponentsFromPath(path: string): PathComponent[] {
  return path.split(REACT_PATH_SEPARATOR).map((comp) => {
    return getComponentAndIndex(comp);
  });
}

export function match(
  tag: EventTag,
  elComps: PathComponent[]
): PathMatchResult {
  const tagComps = getComponentsFromPath(tag.reactPath);
  // last component should match with the last parent.

  const matchedPathComps: Array<PathComponent | undefined> = [];

  let parentIndex = 0;
  for (let i = 0; i < tagComps.length; i++) {
    const tagComp = tagComps[i];
    // find the parent that matches this path component.
    while (parentIndex < elComps.length) {
      const elComp = elComps[parentIndex];
      if (elComp.name === tagComp.name) {
        if (tagComp.index === -1 || tagComp.index === elComp.index) {
          break;
        }
      }
      matchedPathComps[parentIndex] = undefined;
      parentIndex++;
    }
    matchedPathComps[parentIndex] = elComps[parentIndex];
    parentIndex++;
  }

  if (parentIndex === elComps.length) {
    const parentEle = elComps[elComps.length - 1].ele; // we need to choose eles[0]
    const matchedElement =
      tag.selector === '' ? parentEle : parentEle?.querySelector(tag.selector);
    if (matchedElement == null) {
      return {
        matched: false,
        matchedPathComps,
        elPathComps: elComps,
        tagPathComps: tagComps
      };
    }
    return {
      matched: true,
      matchedElement,
      matchedPathComps,
      elPathComps: elComps,
      tagPathComps: tagComps
    };
  }
  return {
    matched: false,
    matchedPathComps,
    elPathComps: elComps,
    tagPathComps: tagComps
  };
}

export function matchedEventTag(
  event: Event,
  tag: EventTag,
  elComps: PathComponent[]
): boolean {
  try {
    const matchResult = match(tag, elComps);
    if (matchResult.matched) {
      const eventsToFire = tag.handlerToEvents[event.type] ?? [];
      return eventsToFire.length > 0;
    }
  } catch (e) {}
  return false;
}

/// // HELPER METHODS ////

function getFiberForElement(element: HTMLElement): any {
  const fiberKey = Object.keys(element).find((key) =>
    key.startsWith('__reactFiber')
  );
  return fiberKey != null ? element[fiberKey] : null;
}

function getFiberName(fiber: any): string | undefined {
  if (fiber.type == null || typeof fiber.type === 'string') {
    return;
  }
  const name =
    fiber.type.name ?? fiber.type.displayName ?? fiber.type.render?.name;
  if (name?.includes('__') === true) {
    // exclude styled components.
    return;
  }
  return name;
}

interface FiberElement {
  fiber: any;
  name: string;
  ele: Element;
}
function findParentFiberWithHTML(fiber: any): FiberElement | undefined {
  // find the parent fiber with component name and state node.
  let current = fiber;
  let topEle: Element | undefined;
  let foundHTML = false; // initialize with true as the current element is from an HTML element.
  while (current != null) {
    if (current.stateNode instanceof Element) {
      topEle = current.stateNode;
      foundHTML = true;
    }
    if (foundHTML) {
      const name = getFiberName(current);
      if (name != null) {
        return {
          fiber: current,
          name,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ele: topEle!
        };
      }
    }
    current = current.return;
  }
}

function getChildFibers(fiber: any): any[] {
  const children: any[] = [];
  let child = fiber.child;
  while (child != null) {
    children.push(child);
    child = child.sibling;
  }
  return children;
}

function findChildFibersWithName(fiber: any, name: string): any[] {
  const children = getChildFibers(fiber).flatMap((child) => {
    const compName = getFiberName(child);
    if (compName != null) {
      let foundHTML = child.stateNode instanceof Element;
      if (!foundHTML) {
        foundHTML = getChildFibers(child).some(
          (gchild) => gchild.stateNode instanceof Element
        );
      }
      if (foundHTML) {
        if (compName === name) {
          return child;
        } else {
          return undefined;
        }
      }
    }
    return findChildFibersWithName(child, name);
  });
  return children.filter((child) => child != null);
}
