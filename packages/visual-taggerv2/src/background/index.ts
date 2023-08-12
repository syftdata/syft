import { executeCleanUp, executeContentScript } from "../common/scripting";
import { MessageType, VisualMode } from "../types";

import {
  getRecordingState,
  updateRecordingState,
} from "../cloud/state/recordingstate";

/// *** Navigation Events *** ///

async function onNavEvent(
  details: chrome.webNavigation.WebNavigationTransitionCallbackDetails
) {
  const { tabId, url, transitionType, frameId } = details;
  const recordingState = await getRecordingState();

  // Check if it's a parent frame, we're recording, and it's the right tabid
  if (tabId !== recordingState?.tabId || frameId !== recordingState?.frameId) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    func: () => {
      window.postMessage({
        type: MessageType.GetReactEles,
      });
    },
  });
}

chrome.webNavigation.onHistoryStateUpdated.addListener(onNavEvent);
chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavEvent);
chrome.webNavigation.onCommitted.addListener(onNavEvent);

chrome.webNavigation.onCompleted.addListener(async (details) => {
  const { tabId, frameId } = details;
  const recordingState = await getRecordingState();

  // if the page moves to another location, insert content script again.
  if (tabId !== recordingState?.tabId || frameId !== recordingState?.frameId) {
    return;
  }

  await executeContentScript(tabId, frameId);
});

/// *** Devtools Panel Communication *** ///

const connections: Record<string, chrome.runtime.Port> = {};
async function handleMessageAsync(
  message: any,
  port: chrome.runtime.Port
): Promise<boolean> {
  console.debug("[Syft][Background] Received a message", message.type);
  switch (message.type) {
    case MessageType.InitDevTools:
      console.log(">>> init dev tools");
      connections[message.tabId] = port;
      // update the recording state to active
      updateRecordingState((state) => {
        return {
          mode: VisualMode.SELECTED,
          tabId: message.tabId,
          frameId: 0,
          elements: [],
        };
      });
      await executeCleanUp(message.tabId, 0);
      await executeContentScript(message.tabId, 0);
      break;
    case MessageType.CleanupDevTools:
      delete connections[message.tabId];
      await executeCleanUp(message.tabId, 0);
      break;
    case MessageType.SetVisualMode:
      console.log(">>> set visual mode");
      await updateRecordingState((state) => ({
        ...state,
        mode: message.mode as VisualMode,
      }));
      break;
  }
  return true;
}

// this handles the connections from devtools page.
chrome.runtime.onConnect.addListener(async function (port) {
  console.debug("[Syft][Background] Received a connection", port);
  if (port.name !== "syft-devtools") {
    console.debug("[Syft][Background] Ignoring the connection");
    return;
  }

  const extensionListener = (message: any, port: chrome.runtime.Port) => {
    if (message.type == null) {
      return;
    }
    handleMessageAsync(message, port).catch((err) => {
      console.warn("[Syft][Background] Error handling message! ", err);
    });
    return true;
  };

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener);
  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(extensionListener);
    var tabs = Object.keys(connections);
    for (var i = 0, len = tabs.length; i < len; i++) {
      if (connections[tabs[i]] == port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Messages from content scripts should have sender.tab set
  let tabId: string | undefined;
  if (sender.tab) {
    tabId = sender.tab.id?.toString();
  } else if (request.tabId != null) {
    tabId = request.tabId.toString();
  }
  if (tabId != null) {
    if (tabId in connections) {
      connections[tabId].postMessage(request);
      sendResponse(true);
    } else {
      console.warn(
        "Tab not found in connection list.",
        request,
        sender.tab,
        tabId,
        Object.keys(connections)
      );
    }
  } else {
    console.warn(
      "[Syft][Background] Received a message without tabId",
      request
    );
  }
});

///// Listen from Webapp
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (request.type === MessageType.LoggedIn) {
      if (request.jwt) {
        sendResponse({ success: true, message: "Token has been received" });
      } else {
        sendResponse({ success: false, message: "Token not found" });
      }
    }
  }
);

export {};
