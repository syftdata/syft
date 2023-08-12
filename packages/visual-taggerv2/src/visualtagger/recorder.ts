import debounce from "lodash.debounce";

import genSelectors from "../builders/selector";

import {
  Action,
  ActionType,
  ClickAction,
  DragAndDropAction,
  InputAction,
  KeydownAction,
  MessageType,
  ReactElement,
  ResizeAction,
  WheelAction,
} from "../types";
import {
  RECORDING_STORAGE_KEY,
  updateRecordingState,
} from "../cloud/state/recordingstate";
import { buildBaseAction, buildLoadAction } from "./utils";

/**
 * This is directly derived from:
 * https://github.com/microsoft/playwright/blob/4ff69529d410144b30bcdbde9497ad600141a6b8/packages/playwright-core/src/server/supplements/injected/recorder.ts#L449
 */
function _shouldGenerateKeyPressFor(event: KeyboardEvent): boolean {
  // Backspace, Delete, AltGraph are changing input, will handle it there.
  if (["AltGraph", "Backspace", "Delete"].includes(event.key)) return false;
  // Ignore the QWERTZ shortcut for creating a at sign on MacOS
  if (event.key === "@" && event.code === "KeyL") return false;
  // Allow and ignore common used shortcut for pasting.
  if (navigator.platform.includes("Mac")) {
    if (event.key === "v" && event.metaKey) return false;
  } else {
    if (event.key === "v" && event.ctrlKey) return false;
    if (event.key === "Insert" && event.shiftKey) return false;
  }
  if (["Shift", "Control", "Meta", "Alt"].includes(event.key)) return false;
  const hasModifier = event.ctrlKey || event.altKey || event.metaKey;
  if (event.key.length === 1 && !hasModifier) return false;
  return true;
}

export default class Recorder {
  private _actions: Action[];
  private currentEventHandleType: string | null = null;

  private onReactElesResp = (event: MessageEvent) => {
    if (event.data.type === MessageType.ReactElesResp) {
      const reactElements = event.data.data as ReactElement[];
      updateRecordingState((state) => ({
        ...state,
        elements: reactElements,
        rootElement: reactElements[0],
      }));
    }
  };

  private appendToActions = (action: Action) => {
    //this._actions.push(action);
    window.postMessage({
      type: MessageType.GetReactEles,
    });
  };

  private updateLastRecordedAction = (actionUpdate: any) => {
    // const lastAction = this._actions[this._actions.length - 1];
    // const newAction = {
    //   ...lastAction,
    //   ...actionUpdate,
    // };
    // this._actions[this._actions.length - 1] = newAction;
    window.postMessage({
      type: MessageType.GetReactEles,
    });
  };

  /**
   *
   * @param event
   * @returns true if it's already being handled somewhere else
   */
  private checkAndSetDuplicateEventHandle = (event: Event) => {
    if (this.currentEventHandleType != null) {
      return true; // This is a duplicate handle
    }
    this.currentEventHandleType = event.type;

    setTimeout(() => {
      this.currentEventHandleType = null;
    }, 0);
    return false; // This was not a duplicate handle
  };

  constructor() {
    this._actions = [];
    // Watch for changes to the recording from the background worker (when a SPA navigation happens)
    chrome.storage.onChanged.addListener(this.onStorageChange);

    window.addEventListener("click", this.onClick, true);
    window.addEventListener("dragstart", this.onDrag, true);
    window.addEventListener("drop", this.onDrag, true);
    window.addEventListener("input", this.onInput, true);
    window.addEventListener("keydown", this.onKeyDown, true);
    window.addEventListener("resize", this.debouncedOnResize, true);
    window.addEventListener("wheel", this.onMouseWheel, true);

    this.appendToActions(
      buildLoadAction(window.location.href, window.document.title)
    );

    window.addEventListener("message", this.onReactElesResp, true);
  }

  deregister() {
    chrome.storage.onChanged.removeListener(this.onStorageChange);
    window.removeEventListener("click", this.onClick, true);
    window.removeEventListener("dragstart", this.onDrag, true);
    window.removeEventListener("drop", this.onDrag, true);
    window.removeEventListener("input", this.onInput, true);
    window.removeEventListener("keydown", this.onKeyDown, true);
    window.removeEventListener("resize", this.debouncedOnResize, true);
    window.removeEventListener("wheel", this.onMouseWheel, true);
    window.removeEventListener("message", this.onReactElesResp, true);
  }

  private onStorageChange = (changes: {
    [key: string]: chrome.storage.StorageChange;
  }) => {
    if (
      changes[RECORDING_STORAGE_KEY] != null &&
      changes[RECORDING_STORAGE_KEY].newValue !==
        changes[RECORDING_STORAGE_KEY].oldValue
    ) {
      this._actions = changes[RECORDING_STORAGE_KEY].newValue.recording ?? [];
    }
  };

  private onMouseWheel = (event: WheelEvent) => {
    const lastAction = this._actions[this._actions.length - 1];

    const { pageXOffset, pageYOffset } = window;

    if (
      lastAction.type === "wheel" &&
      // We should record a new event if we've changed scroll directions
      Math.sign(lastAction.deltaX) === Math.sign(event.deltaX) &&
      Math.sign(lastAction.deltaY) === Math.sign(event.deltaY)
    ) {
      this.updateLastRecordedAction({
        deltaX: Math.floor(lastAction.deltaX + event.deltaX),
        deltaY: Math.floor(lastAction.deltaY + event.deltaY),
        pageXOffset,
        pageYOffset,
      });
    } else {
      const action = {
        type: ActionType.Wheel,
        deltaX: Math.floor(event.deltaX),
        deltaY: Math.floor(event.deltaY),
        pageXOffset,
        pageYOffset,
      } as WheelAction;
      this.appendToActions(action);
    }
  };

  private onClick = (event: MouseEvent) => {
    if (event.isTrusted === false) {
      // Ignore synthetic events
      return;
    }
    if (this.checkAndSetDuplicateEventHandle(event)) {
      return;
    }

    const target = event.target as HTMLElement;

    // Choose the parent element if it's a link, since we probably want the link
    const { parentElement } = target;
    const predictedTarget =
      parentElement?.tagName === "A" ? parentElement : target;

    if (predictedTarget instanceof HTMLHtmlElement) {
      return;
    }
    const action: ClickAction = {
      ...buildBaseAction(event, predictedTarget),
      type: ActionType.Click,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
    };

    this.appendToActions(action);
  };

  private onDrag = (event: DragEvent) => {
    const lastAction = this._actions[this._actions.length - 1];

    if (event.type === "dragstart") {
      this.appendToActions({
        ...buildBaseAction(event),
        type: ActionType.DragAndDrop,
        sourceX: event.x,
        sourceY: event.y,
      } as DragAndDropAction);
    } else if (
      event.type === "drop" &&
      lastAction.type === ActionType.DragAndDrop
    ) {
      this.updateLastRecordedAction({
        targetX: event.x,
        targetY: event.y,
      });
    }
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (!_shouldGenerateKeyPressFor(event)) {
      return;
    }

    // We're committed to handling, check and set handling flag
    if (this.checkAndSetDuplicateEventHandle(event)) {
      return;
    }

    const action: KeydownAction = {
      ...buildBaseAction(event),
      type: ActionType.Keydown,
      key: event.key,
    };

    this.appendToActions(action);
  };

  private onInput = (event: Event) => {
    if (this.checkAndSetDuplicateEventHandle(event)) {
      return;
    }

    const target = event.target as HTMLInputElement;
    const selectors = genSelectors(target);
    const lastAction = this._actions[this._actions.length - 1];
    // If the last event was also an input and for the same element, update the last event with the latest input
    if (
      lastAction.type === "input" &&
      lastAction.selectors.generalSelector === selectors?.generalSelector
    ) {
      this.updateLastRecordedAction({
        value: target?.value,
        timestamp: event.timeStamp,
      });
    } else {
      const action: InputAction = {
        ...buildBaseAction(event),
        type: ActionType.Input,
        value: target?.value,
      };
      this.appendToActions(action);
    }
  };

  private onResize = () => {
    const lastResizeAction = this.getLastResizeAction();
    const { innerWidth: width, innerHeight: height } = window;
    if (
      lastResizeAction == null ||
      lastResizeAction.width !== width ||
      lastResizeAction.height !== height
    ) {
      const action = {
        type: ActionType.Resize,
        width,
        height,
      } as ResizeAction;
      this.appendToActions(action);
    }
  };

  private getLastResizeAction = (): ResizeAction | undefined => {
    for (let i = this._actions.length - 1; i >= 0; i--) {
      if (this._actions[i].type === ActionType.Resize) {
        return this._actions[i] as ResizeAction;
      }
    }
  };

  private debouncedOnResize = debounce(this.onResize, 300);
}
