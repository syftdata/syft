import genSelectors from "../builders/selector";
import { ActionType, BaseAction, ReactSource, TagName } from "../types";

export function getReactSourceFileForElement(ele: HTMLElement) {
  const syftSource = ele.getAttribute("data-syft-source");
  if (syftSource == null) {
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

export function buildBaseAction(
  event: Event,
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
