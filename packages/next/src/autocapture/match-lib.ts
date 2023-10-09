import { type EventTag } from './types';

// https://github.com/facebook/react/blob/dddfe688206dafa5646550d351eb9a8e9c53654a/packages/react-devtools-shared/src/backend/renderer.js#L205
export enum ReactTypeOfWork {
  CacheComponent = 24, // Experimental
  ClassComponent = 1,
  ContextConsumer = 9,
  ContextProvider = 10,
  CoroutineComponent = -1, // Removed
  CoroutineHandlerPhase = -1, // Removed
  DehydratedSuspenseComponent = 18, // Behind a flag
  ForwardRef = 11,
  Fragment = 7,
  FunctionComponent = 0,
  HostComponent = 5,
  HostPortal = 4,
  HostRoot = 3,
  HostHoistable = 26, // In reality, 18.2+. But doesn't hurt to include it here
  HostSingleton = 27, // Same as above
  HostText = 6,
  IncompleteClassComponent = 17,
  IndeterminateComponent = 2,
  LazyComponent = 16,
  LegacyHiddenComponent = 23,
  MemoComponent = 14,
  Mode = 8,
  OffscreenComponent = 22, // Experimental
  Profiler = 12,
  ScopeComponent = 21, // Experimental
  SimpleMemoComponent = 15,
  SuspenseComponent = 13,
  SuspenseListComponent = 19, // Experimental
  TracingMarkerComponent = 25, // Experimental - This is technically in 18 but we don't
  // want to fork again so we're adding it here instead
  YieldComponent = -1 // Removed
}

/***
 * This file will be used as-it-is in Syft Package.
 */

export interface PathMatchResult {
  matched: boolean;
  matchedElement?: Element;
  matchedPathComps: Array<PathComponent | undefined>;

  // debugging.
  elComps: BasePathComponent[];
  tagComps: BasePathComponent[];
}

export interface PathComponent extends BasePathComponent {
  ele: HTMLElement;

  fiber: any;
  domChildren: DOMFiber[];
  rootChildren: ComponentFiber[];
  siblings: ComponentFiber[];
}

interface BasePathComponent {
  name: string;
  index: number;
}

/**
 * Keeps only DOM parents. and also keeps track of the element index.
 * @param element
 * @returns
 */
export function getDOMPathComponents(element: HTMLElement): PathComponent[] {
  const fiber = getFiber(element);
  if (fiber == null) {
    return [];
  }

  const paths: PathComponent[] = [];
  let current = findParentDOMCompFiber(fiber);
  let previous: FullCompFiber | undefined;
  while (current != null) {
    const domChildren = findChildDOMFibers(current.fiber);
    const rootChildren = findChildComponentFibers(current.fiber);
    // find the index of the previous element in this component.
    if (previous != null) {
      const siblings = rootChildren.filter((ch) => ch.name === previous?.name);
      if (siblings.length > 1) {
        const previousComp = paths[paths.length - 1];
        // we are searching based on fiber.
        previousComp.index = siblings.findIndex(
          (sib) => sib.fiber === previous?.fiber
        );
        previousComp.siblings = siblings;
      }
    }
    paths.push({
      name: current.name,
      ele: current.ele,

      fiber: current.fiber,

      rootChildren,
      domChildren,

      index: -1,
      siblings: []
    });
    previous = current;
    current = findParentDOMCompFiber(current.fiber.return);
  }
  return paths.reverse();
}

/**
 * Includes non-dom components as well. This path is meant to use only for property access.
 * children, rootChildren are not populated.
 * @param element
 * @returns
 */
export function getPropPathComponents(element: HTMLElement): PathComponent[] {
  const fiber = getFiber(element);
  if (fiber == null) {
    return [];
  }

  const paths: PathComponent[] = [];
  let current = findParentPropCompFiber(fiber.return, element);
  while (current != null) {
    paths.push({
      name: current.name,
      index: -1,
      ele: current.ele,
      fiber: current.fiber,
      siblings: [],
      domChildren: [],
      rootChildren: []
    });
    current = findParentPropCompFiber(current.fiber.return, current.ele);
  }
  return paths.reverse();
}

function getComponentAndIndex(pathComp: string): BasePathComponent {
  const matches = pathComp.match(/(.*)\[(\d+)\]/);
  const index = matches == null ? -1 : parseInt(matches[2]);
  const name = matches == null ? pathComp : matches[1];
  return { name, index };
}
const REACT_PATH_SEPARATOR = ' > ';
function getComponentsFromPath(path: string): BasePathComponent[] {
  return path.split(REACT_PATH_SEPARATOR).map((comp) => {
    return getComponentAndIndex(comp);
  });
}

export function match(
  tag: EventTag,
  elComps: PathComponent[]
): PathMatchResult {
  let parentEle: HTMLElement | undefined;
  const matchedPathComps: Array<PathComponent | undefined> = [];
  let tagComps: BasePathComponent[] = [];
  if (tag.reactPath.length > 0) {
    tagComps = getComponentsFromPath(tag.reactPath);
    if (tagComps.length === elComps.length) {
      for (let i = 0; i < elComps.length; i++) {
        const tagComp = tagComps[i];
        const elComp = elComps[i];
        if (elComp.name === tagComp.name) {
          if (tagComp.index === -1 || tagComp.index === elComp.index) {
            matchedPathComps.push(elComp);
          }
        } else {
          break;
        }
      }
      if (matchedPathComps.length === elComps.length) {
        parentEle = elComps[elComps.length - 1].ele;
      }
    }
  } else {
    parentEle = document.body;
  }

  if (parentEle != null) {
    const matchedElement =
      tag.selector === '' ? parentEle : parentEle.querySelector(tag.selector);
    if (matchedElement != null) {
      return {
        matched: true,
        matchedElement,
        matchedPathComps,
        elComps,
        tagComps
      };
    }
  }
  return {
    matched: false,
    matchedPathComps,
    elComps,
    tagComps
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

export type FiberNode = any;
export function getFiber(element: HTMLElement): FiberNode | undefined {
  const fiberKey = Object.keys(element).find((key) =>
    key.startsWith('__reactFiber')
  );

  if (fiberKey == null) {
    return;
  }

  return element[fiberKey];
}

function getFiberName(fiber: any): string | undefined {
  if (fiber.type == null) {
    return;
  }

  if (typeof fiber.type === 'string') {
    return fiber.type;
  }

  const name =
    fiber.type.name ?? fiber.type.displayName ?? fiber.type.render?.name;
  if (name == null || name.length === 0) return;
  if (name.startsWith('_') === true || name.endsWith('Boundary') === true) {
    // exclude styled components and boundaries
    return;
  }
  return name;
}

export interface ComponentFiber {
  fiber: any;
  name: string;
}

export interface DOMFiber {
  fiber: any;
  ele: HTMLElement;
}

/**
 * A component that also has a rendering functionality.
 */
export interface FullCompFiber extends ComponentFiber, DOMFiber {}

function findParentDOMCompFiber(fiber: any): FullCompFiber | undefined {
  // find the parent fiber with component name and state node.
  let current = fiber;
  let ele: HTMLElement | undefined;

  // 1. try to get the "outermost" DOM element of the parent fiber. if there is none, return.
  // 2. now, get the "outermost" react component that rendered this DOM element.
  // if there are multiple react components on top of this DOM element, take the outer most.

  while (current != null) {
    if (current.stateNode instanceof HTMLElement) {
      ele = current.stateNode;
      // even if you find an element, continue looping.
      // we need to find the outermost.
    } else {
      // found first non-dom element fiber.
      if (ele != null) {
        // if we already found a dom element, we are done.
        break;
      }
    }
    current = current.return;
  }
  if (ele == null) return;

  // now, this outermost element might be wrapped by providers and stuff. so we need to find the outermost react component.
  // so, iterate till we find the DOM element, and return outermost result.
  let result: FullCompFiber | undefined;
  while (current != null) {
    if (
      current.tag === ReactTypeOfWork.ClassComponent ||
      current.tag === ReactTypeOfWork.FunctionComponent
    ) {
      const name = getFiberName(current);
      if (name != null) {
        result = {
          fiber: current,
          name,
          ele
        };
      }
    }

    if (
      current.tag === ReactTypeOfWork.Fragment ||
      current.tag === ReactTypeOfWork.HostRoot ||
      current.tag === ReactTypeOfWork.HostComponent ||
      current.tag === ReactTypeOfWork.HostText ||
      current.tag === ReactTypeOfWork.HostPortal
    ) {
      if (result != null) return result;
    }

    current = current.return;
  }
  return result;
}

/**
 * Can include fibers that don't have a DOM element. includes providers, shallow components.
 * @param fiber
 * @param ele
 * @returns
 */
function findParentPropCompFiber(
  fiber: any,
  ele: HTMLElement
): FullCompFiber | undefined {
  // find the parent fiber with component name.
  let current = fiber;

  // now, this outermost element might be wrapped by providers and stuff. so we need to find the outermost react component.
  // so, iterate till we find the DOM element, and return outermost result.
  while (current != null) {
    // if we come across any statenode in between, that becomes the latest ele of this element.
    if (current.stateNode instanceof HTMLElement) {
      ele = current.stateNode;
    } else {
      const name = getFiberName(current);
      if (name != null) {
        return {
          fiber: current,
          name,
          ele
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

/**
 * Returns child fibers with a name.
 * @param fiber
 * @param name
 * @returns
 */
function findChildComponentFibers(fiber: any): ComponentFiber[] {
  const children = getChildFibers(fiber).flatMap((child) => {
    if (!(child.stateNode instanceof HTMLElement)) {
      const compName = getFiberName(child);
      if (compName != null) {
        return {
          name: compName,
          fiber: child
        };
      }
    }
    return findChildComponentFibers(child);
  });
  return children.filter((child) => child != null);
}

/**
 * Returns child fibers with a dom.
 * @param fiber
 * @param name
 * @returns
 */
function findChildDOMFibers(fiber: any): DOMFiber[] {
  const children = getChildFibers(fiber).flatMap((child) => {
    if (child.stateNode instanceof HTMLElement) {
      return {
        fiber: child,
        ele: child.stateNode
      };
    }
    return findChildDOMFibers(child);
  });
  return children.filter((child) => child != null);
}
