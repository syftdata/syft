import { MessageType, ReactElement } from "../types";
import { updateRecordingState } from "../cloud/state/recordingstate";
import { observeDOM } from "./utils";

export default class Recorder {
  private onReactElesResp = (event: MessageEvent) => {
    if (event.data.type === MessageType.ReactElesResp) {
      const reactElements = event.data.data as ReactElement[];
      updateRecordingState((state) => ({
        ...state,
        elements: reactElements,
      }));
    }
  };

  private appendToActions = () => {
    window.postMessage({
      type: MessageType.GetReactEles,
    });
  };

  unregisterDOMObserver: (() => void) | undefined;
  constructor() {
    this.appendToActions();
    this.unregisterDOMObserver = observeDOM(
      window.document.body,
      this.appendToActions
    );
    window.addEventListener("message", this.onReactElesResp, true);
  }

  deregister() {
    window.removeEventListener("message", this.onReactElesResp, true);
  }
}
