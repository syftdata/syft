import {
  setEndRecordingStorage,
  localStorageGet,
  recordNavigationEvent,
  executeContentScript,
  replaceAction,
} from "../common/utils";
import { MessageType } from "../types";
import { startRecording, stopRecording } from "./bridge";

/// *** Navigation Events *** ///

async function onNavEvent(
  details: chrome.webNavigation.WebNavigationTransitionCallbackDetails
) {
  const { tabId, url, transitionType, frameId } = details;
  const { recordingTabId, recordingFrameId, recordingState } =
    await localStorageGet([
      "recordingState",
      "recordingTabId",
      "recordingFrameId",
    ]);

  // Check if it's a parent frame, we're recording, and it's the right tabid
  if (
    frameId !== recordingFrameId ||
    recordingState !== "active" ||
    recordingTabId !== tabId
  ) {
    return;
  }

  await recordNavigationEvent(url, transitionType);
}

// Set recording as ended when the recording tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { recordingTabId } = await localStorageGet(["recordingTabId"]);
  if (tabId == recordingTabId) {
    setEndRecordingStorage();
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(onNavEvent);
chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavEvent);
chrome.webNavigation.onCommitted.addListener(onNavEvent);

chrome.webNavigation.onCompleted.addListener(async (details) => {
  const { tabId, frameId } = details;

  const { recordingTabId, recordingFrameId, recordingState } =
    await localStorageGet([
      "recordingTabId",
      "recordingFrameId",
      "recordingState",
    ]);

  if (
    frameId !== recordingFrameId ||
    tabId != recordingTabId ||
    recordingState != "active"
  ) {
    return;
  }

  await executeContentScript(tabId, recordingFrameId);
});

/// **** Context Menus **** ///

const HOVER_CTX_MENU_ID = "syft-menu-hover-id";
const AWAIT_TEXT_CTX_MENU_ID = "syft-menu-await-text-id";

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  title: "Record hover over element",
  contexts: ["all"],
  id: HOVER_CTX_MENU_ID,
  enabled: false,
});
chrome.contextMenus.create({
  title: "Assert/wait for selected text",
  contexts: ["selection"],
  id: AWAIT_TEXT_CTX_MENU_ID,
  enabled: false,
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (typeof tab === "undefined") {
    return;
  }
  const { recordingTabId } = await localStorageGet(["recordingTabId"]);
  if (tab.id != recordingTabId) {
    return;
  }
  let type = "onHoverCtxMenu";
  if (info.menuItemId === HOVER_CTX_MENU_ID) {
    type = "onHoverCtxMenu";
  } else if (info.menuItemId === AWAIT_TEXT_CTX_MENU_ID) {
    type = "onAwaitTextCtxMenu";
  }
  chrome.tabs.sendMessage(recordingTabId, {
    type,
    selectionText: info.selectionText,
  });
});

function updateContextMenuItems({ enabled }: { enabled: boolean }) {
  chrome.contextMenus.update(HOVER_CTX_MENU_ID, {
    enabled,
  });
  chrome.contextMenus.update(AWAIT_TEXT_CTX_MENU_ID, {
    enabled,
  });
}

localStorageGet(["recordingState"]).then(({ recordingState }) => {
  if (recordingState === "active") {
    updateContextMenuItems({ enabled: true });
  } else {
    updateContextMenuItems({ enabled: false });
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes?.recordingState?.oldValue === changes?.recordingState?.newValue) {
    return;
  }

  if (changes?.recordingState?.newValue == "active") {
    updateContextMenuItems({ enabled: true });
  }
  if (changes?.recordingState?.newValue == "finished") {
    updateContextMenuItems({ enabled: false });
  }
});

/// *** Devtools Panel Communication *** ///

const connections: Record<string, chrome.runtime.Port> = {};
async function handleMessageAsync(
  message: any,
  port: chrome.runtime.Port
): Promise<boolean> {
  console.debug("[Syft][Background] Received a message from Devtools", message);
  switch (message.type) {
    case MessageType.InitDevTools:
      connections[message.tabId] = port;
      break;
    case MessageType.StartRecord:
      await startRecording(message.tabId);
      break;
    case MessageType.StopRecord:
      await stopRecording(message.tabId);
      break;
    case MessageType.ReplaceStep:
      const actions = await replaceAction(message.index, message.action);
      await port.postMessage({
        type: MessageType.RecordedStep,
        data: actions,
      });
      break;
  }
  return true;
}

// this handles the connections from devtools page.
chrome.runtime.onConnect.addListener(async function (port) {
  console.debug("[Syft][Background] Received a connection", port);
  if (port.name !== "syft-devtools") {
    return;
  }

  const extensionListener = function (message: any, port: chrome.runtime.Port) {
    if (message.type == null) return true;
    handleMessageAsync(message, port).catch((err) => {
      console.error("[Syft][Background] Error handling message! ", err);
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
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    var tabId = sender.tab.id?.toString();
    console.debug(
      "[Syft][Background] Received a message from Content",
      request
    );
    if (tabId != null && tabId in connections) {
      connections[tabId].postMessage(request);
    } else {
      console.error(
        "Tab not found in connection list.",
        tabId,
        Object.keys(connections)
      );
    }
  }
  return true;
});

export {};
