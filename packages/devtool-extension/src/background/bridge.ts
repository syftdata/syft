import { endRecording } from "../common/endRecording";
import {
  executeCleanUp,
  executeContentScript,
  setStartRecordingStorage,
} from "../common/utils";

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
  await endRecording();
}
