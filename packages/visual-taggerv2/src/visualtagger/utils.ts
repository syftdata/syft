import genSelectors from "../builders/selector";
import {
  ActionType,
  BaseAction,
  LoadAction,
  ReactSource,
  TagName,
} from "../types";

export function getReactSourceFileForElement(
  ele: HTMLElement
): ReactSource | undefined {
  const syftSource = ele.getAttribute("data-syft-source");
  if (syftSource == null) {
    if (ele.parentElement != null) {
      return getReactSourceFileForElement(ele.parentElement);
    }
    return undefined;
  }
  const source = JSON.parse(syftSource) as ReactSource;
  return source;
}

export function hasHandlerOnReactElement(ele: HTMLElement) {
  const hasHandler = ele.getAttribute("data-syft-has-handler");
  if (hasHandler == null) {
    return false;
  }
  return /true/i.test(hasHandler);
}

export function getTagIndexFromElement(ele?: Element) {
  if (ele) {
    const index = ele.getAttribute("data-tag-index");
    if (index) {
      return parseInt(index);
    }
  }
  return -1;
}

export function buildBaseAction(
  event: { target: EventTarget | null; timeStamp: DOMHighResTimeStamp },
  overrideTarget?: HTMLElement
): BaseAction {
  const target = overrideTarget ?? (event.target as HTMLElement);

  // get the source from the target;
  const eventSource = getReactSourceFileForElement(target);

  return {
    isPassword:
      target instanceof HTMLInputElement &&
      target.type.toLowerCase() === "password",
    type: ActionType.Click, // UNKNOWN
    tagName: target.tagName as TagName,
    inputType: target instanceof HTMLInputElement ? target.type : undefined,
    selectors: genSelectors(target) ?? {},
    timestamp: event.timeStamp,
    hasOnlyText: target.children.length === 0 && target.innerText.length > 0,
    value: undefined,

    eventSource,
  };
}

export function buildLoadAction(url: string, title: string): LoadAction {
  return {
    type: ActionType.Load,
    url,
    timestamp: Date.now(),
    selectors: {},
    isPassword: false,
    hasOnlyText: false,
    tagName: TagName.Window,
  };
}
