import { executeCleanUp, executeContentScript } from "../common/scripting";
import { MessageType, VisualMode } from "../types";

import {
  getRecordingState,
  updateRecordingState,
} from "../cloud/state/recordingstate";
import ConnectionManager, { MessageListener2 } from "./ConnectionManager";

/// *** Devtools Panel Communication *** ///
async function asyncMessageListener(
  message: any,
  port: chrome.runtime.Port
): Promise<void> {
  switch (message.type) {
    case MessageType.InitDevTools:
      console.info("[Syft][Background] init dev tools, business logic");
      // update the recording state to active
      updateRecordingState((state) => {
        return {
          mode: VisualMode.SELECTED,
          tabId: message.tabId,
          selectedIndex: undefined,
          frameId: 0,
          elements: [],
        };
      });
      await executeCleanUp(message.tabId, 0);
      await executeContentScript(message.tabId, 0);
      break;
    case MessageType.SetVisualMode:
      await updateRecordingState((state) => {
        if (state.mode === message.mode) return state;

        let selectedIndex = state.selectedIndex;
        if (state.mode === VisualMode.ALL) {
          selectedIndex = undefined;
        }
        return {
          ...state,
          selectedIndex,
          mode: message.mode as VisualMode,
        };
      });
      break;
  }
}
const messageListener = (message: any, port: chrome.runtime.Port) => {
  asyncMessageListener(message, port).catch((err) => {
    console.warn("[Syft][Background] Error handling message! ", err);
  });
  return true;
};
const externalMessageListener: MessageListener2 = (
  request,
  sender,
  sendResponse
) => {
  if (request.type === MessageType.LoggedIn) {
    if (request.jwt) {
      sendResponse({ success: true, message: "Token has been received" });
    } else {
      sendResponse({ success: false, message: "Token not found" });
    }
  }
};

const connectionManager = new ConnectionManager();
connectionManager.init(messageListener, externalMessageListener);

/// *** Navigation Events *** ///

chrome.webNavigation.onCompleted.addListener(async (details) => {
  const { tabId, frameId } = details;
  const recordingState = await getRecordingState();
  if (tabId !== recordingState?.tabId || frameId !== recordingState?.frameId) {
    return;
  }

  // if the page moves to another location, insert content script again.
  console.debug("[Syft][Background] Inserting content script on navigation");
  await executeContentScript(tabId, frameId);
});

console.log("[Syft][Background] Background script loaded");
export {};
