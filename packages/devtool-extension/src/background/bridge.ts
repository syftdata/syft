import {
  setEndRecordingStorage,
  setStartRecordingStorage,
} from "../common/utils";
import { executeCleanUp, executeContentScript } from "../common/scripting";
import { MessageType } from "../types";

export async function startRecording(tabId: number) {
  console.debug("[Syft][Background] starting recording on ", tabId);
  const tab = await chrome.tabs.get(tabId);
  setStartRecordingStorage(tabId, 0, tab.url || "");
  await executeCleanUp(tabId, 0);
  // start with a fresh page / state.
  await chrome.tabs.reload(tabId, { bypassCache: true });
  await executeContentScript(tabId, 0);
}

export async function stopRecording(tabId: number) {
  console.debug("[Syft][Background] stoping recording on ", tabId);
  await setEndRecordingStorage();
}

///// Listen from Webapp
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (request.type === MessageType.LoggedIn) {
      if (request.jwt) {
        console.log("Token ::: ", request.jwt);
        sendResponse({ success: true, message: "Token has been received" });
      } else {
        sendResponse({ success: false, message: "Token not found" });
      }
    }
  }
);
