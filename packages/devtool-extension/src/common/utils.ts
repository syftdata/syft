// TODO: nages added this global to resolve compilation issues.
declare global {
  namespace browser {
    const tabs: typeof chrome.tabs;
    const webNavigation: typeof chrome.webNavigation;
    const scripting: typeof chrome.scripting;
  }
}

export function setEndRecordingStorage() {
  chrome.storage.local.set({
    recordingState: "finished",
    recordingTabId: null,
    recordingFrameId: null,
    returnTabId: null,
  });
}

export function setPreferredLibraryStorage(library: string) {
  chrome.storage.local.set({ preferredLibrary: library });
}

export function setStartRecordingStorage(
  tabId: number,
  frameId: number,
  newUrl: string
) {
  const storage = {
    recordingState: "active",
    recordingTabId: tabId,
    recordingFrameId: frameId,
    recording: [
      {
        type: "load",
        url: newUrl,
      },
    ],
  };
  chrome.storage.local.set(storage);
}

export async function createTab(url: string) {
  const tab = await chrome.tabs.create({
    url,
  });

  return tab;
}

export function localStorageGet(keys: string[]) {
  return new Promise<{ [key: string]: any }>((resolve, reject) => {
    chrome.storage.local.get(keys, (storage) => {
      resolve(storage);
    });
  });
}

export async function getRandomInstallId() {
  return localStorageGet(["randomId"]).then(({ randomId }) => {
    let id = randomId;
    if (randomId == null) {
      id = `${Math.floor(Math.random() * 1000000)}`;
      chrome.storage.local.set({ randomId: id });
    }

    return id;
  });
}

export async function getCurrentTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab;
}

export async function executeScript(
  tabId: number,
  frameId: number,
  file: string
) {
  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    files: [file],
  });
}

// @ts-ignore-error - CRXJS needs injected scripts to be this way.
// https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import scriptPath from "../recorder?script";
import { Action, ActionType, NavigateAction } from "../types";

export async function executeContentScript(tabId: number, frameId: number) {
  executeScript(tabId, frameId, scriptPath);
}

export async function executeCleanUp(tabId: number, frameId: number) {
  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    func: () => {
      if (typeof window?.__SYFT_CLEAN_UP === "function") {
        window.__SYFT_CLEAN_UP();
      }
    },
  });
}

export async function recordNavigationEvent(
  url: string,
  transitionType: string
) {
  const navigationEvent = {
    type: ActionType.Navigate,
    url,
    source: transitionType,
  } as NavigateAction;
  console.log("[Syft][Unknown] Recording navigation event", navigationEvent);
  await insertNewAction(navigationEvent);
}

export async function insertNewAction(action: Action, index?: number) {
  const { recording } = await localStorageGet(["recording"]);
  console.log("[Syft][Unknown] Modifying the recording directly");
  const newRecording = [...recording];
  newRecording.splice(index ?? newRecording.length, 0, action);
  await chrome.storage.local.set({ recording: newRecording });
}
