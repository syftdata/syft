import genSelectors from "../builders/selector";
import { ActionType, BaseAction, LoadAction, TagName } from "../types";

export function buildBaseAction(
  event: { target: EventTarget | null; timeStamp: DOMHighResTimeStamp },
  overrideTarget?: HTMLElement
): BaseAction {
  const target = overrideTarget ?? (event.target as HTMLElement);

  return {
    isPassword:
      target instanceof HTMLInputElement &&
      target.type.toLowerCase() === "password",
    type: ActionType.Click, // UNKNOWN
    tagName: target.tagName as TagName,
    inputType: target instanceof HTMLInputElement ? target.type : undefined,
    selectors: genSelectors(target) ?? {},
    timestamp: event.timeStamp,
    hasOnlyText:
      target.children != null &&
      target.children.length === 0 &&
      target.innerText != null &&
      target.innerText.length > 0,
    value: undefined,
  };
}

export function buildBaseAction1(target: HTMLElement): BaseAction {
  return {
    isPassword:
      target instanceof HTMLInputElement &&
      target.type.toLowerCase() === "password",
    type: ActionType.ReactElement, // UNKNOWN
    tagName: target.tagName as TagName,
    inputType: target instanceof HTMLInputElement ? target.type : undefined,
    selectors: genSelectors(target) ?? {
      generalSelector: "",
    },
    timestamp: 0,
    hasOnlyText:
      target.children != null &&
      target.children.length === 0 &&
      target.innerText != null &&
      target.innerText.length > 0,
    value: undefined,
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
