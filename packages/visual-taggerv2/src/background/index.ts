import { recordNavigationEvent, replaceAction } from "../common/utils";
import { executeCleanUp, executeContentScript } from "../common/scripting";
import { MessageType, RecordingMode } from "../types";

import {
  getRecordingState,
  startPreview,
  stopPreview,
} from "../cloud/state/recordingstate";

/// *** Navigation Events *** ///

async function onNavEvent(
  details: chrome.webNavigation.WebNavigationTransitionCallbackDetails
) {
  const { tabId, url, transitionType, frameId } = details;
  const recordingState = await getRecordingState();

  // Check if it's a parent frame, we're recording, and it's the right tabid
  if (
    tabId !== recordingState?.recordingTabId ||
    frameId !== recordingState?.recordingFrameId ||
    recordingState?.mode !== RecordingMode.RECORDING
  ) {
    return;
  }

  await recordNavigationEvent(url, transitionType);
}

// Set recording as ended when the recording tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const recordingState = await getRecordingState();
  if (tabId == recordingState?.recordingTabId) {
    await stopPreview();
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(onNavEvent);
chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavEvent);
chrome.webNavigation.onCommitted.addListener(onNavEvent);

chrome.webNavigation.onCompleted.addListener(async (details) => {
  const { tabId, frameId } = details;
  const recordingState = await getRecordingState();

  // if the page moves to another location, insert content script again.
  if (
    tabId !== recordingState?.recordingTabId ||
    frameId !== recordingState?.recordingFrameId ||
    recordingState?.mode === RecordingMode.NONE
  ) {
    return;
  }

  await executeContentScript(tabId, frameId);
});

/// **** Context Menus **** ///

// const HOVER_CTX_MENU_ID = "syft-menu-hover-id";
// const AWAIT_TEXT_CTX_MENU_ID = "syft-menu-await-text-id";

// chrome.contextMenus.removeAll();
// chrome.contextMenus.create({
//   title: "Record hover over element",
//   contexts: ["all"],
//   id: HOVER_CTX_MENU_ID,
//   enabled: false,
// });
// chrome.contextMenus.create({
//   title: "Assert/wait for selected text",
//   contexts: ["selection"],
//   id: AWAIT_TEXT_CTX_MENU_ID,
//   enabled: false,
// });
// chrome.contextMenus.onClicked.addListener(async (info, tab) => {
//   if (typeof tab === "undefined") {
//     return;
//   }
//   const { recordingTabId } = await localStorageGet(["recordingTabId"]);
//   if (tab.id != recordingTabId) {
//     return;
//   }
//   let type = "onHoverCtxMenu";
//   if (info.menuItemId === HOVER_CTX_MENU_ID) {
//     type = "onHoverCtxMenu";
//   } else if (info.menuItemId === AWAIT_TEXT_CTX_MENU_ID) {
//     type = "onAwaitTextCtxMenu";
//   }
//   chrome.tabs.sendMessage(recordingTabId, {
//     type,
//     selectionText: info.selectionText,
//   });
// });

// function updateContextMenuItems({ enabled }: { enabled: boolean }) {
//   chrome.contextMenus.update(HOVER_CTX_MENU_ID, {
//     enabled,
//   });
//   chrome.contextMenus.update(AWAIT_TEXT_CTX_MENU_ID, {
//     enabled,
//   });
// }

// localStorageGet(["recordingState"]).then(({ recordingState }) => {
//   if (recordingState === "active") {
//     updateContextMenuItems({ enabled: true });
//   } else {
//     updateContextMenuItems({ enabled: false });
//   }
// });

// chrome.storage.onChanged.addListener((changes) => {
//   if (changes?.recordingState?.oldValue === changes?.recordingState?.newValue) {
//     return;
//   }

//   if (changes?.recordingState?.newValue == "active") {
//     updateContextMenuItems({ enabled: true });
//   }
//   if (changes?.recordingState?.newValue == "finished") {
//     updateContextMenuItems({ enabled: false });
//   }
// });

/// *** Devtools Panel Communication *** ///

const connections: Record<string, chrome.runtime.Port> = {};
async function handleMessageAsync(
  message: any,
  port: chrome.runtime.Port
): Promise<boolean> {
  console.debug("[Syft][Background] Received a message", message, port);
  switch (message.type) {
    case MessageType.InitDevTools:
      connections[message.tabId] = port;
      await executeContentScript(message.tabId, 0);
      break;
    case MessageType.CleanupDevTools:
      delete connections[message.tabId];
      await executeCleanUp(message.tabId, 0);
      break;
    case MessageType.StartTagging:
      const tab = await chrome.tabs.get(message.tabId);
      if (tab.id) {
        await startPreview(tab.id, 0, tab.url || "");
      }
      break;
    case MessageType.StopTagging:
      await stopPreview();
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
      console.warn(
        '[Syft][Background] Received a message without a "type" field',
        message
      );
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
  if (sender.tab) {
    const tabId = sender.tab.id?.toString();
    if (tabId != null && tabId in connections) {
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
  } else if (request.tabId != null) {
    const tabId = request.tabId.toString();
    if (tabId in connections) {
      connections[tabId].postMessage(request);
      sendResponse(true);
    } else {
      console.warn(
        "Tab not found in connection list 2.",
        request,
        tabId,
        Object.keys(connections)
      );
    }
  } else {
    console.warn(
      "[Syft][Background] Received a message from Devtools?",
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
