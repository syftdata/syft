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

export function setPreferredBarPositionStorage(position: string) {
  chrome.storage.local.set({ preferredBarPosition: position });
}

export function setStartRecordingStorage(
  tabId: number,
  frameId: number,
  newUrl: string,
  returnTabId?: number
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
    ...(returnTabId != null
      ? {
          returnTabId,
        }
      : {}),
  };
  chrome.storage.local.set(storage);
}

export async function createTab(url: string) {
  // This is because we're straddling v2 and v3 manifest
  const api = typeof browser === "object" ? browser : chrome;

  const tab = await api.tabs.create({
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
  // This is because we're straddling v2 and v3 manifest
  const api = typeof browser === "object" ? browser : chrome;

  const [tab] = await api.tabs.query({
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
  if (typeof browser === "object") {
    await browser.tabs.executeScript(tabId, { file, frameId });
  } else {
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [frameId] },
      files: [file],
    });
  }
}

// @ts-ignore-error - CRXJS needs injected scripts to be this way.
// https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import scriptPath from "../recorder?script";

export async function executeContentScript(tabId: number, frameId: number) {
  executeScript(tabId, frameId, scriptPath);
}

export async function executeCleanUp(tabId: number, frameId: number) {
  if (typeof browser === "object") {
    await browser.tabs.executeScript(tabId, {
      frameId,
      code: `
        if (typeof window?.__SYFT_CLEAN_UP === 'function') {
          window.__SYFT_CLEAN_UP();
        }
      `,
    });
  } else {
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [frameId] },
      func: () => {
        if (typeof window?.__SYFT_CLEAN_UP === "function") {
          window.__SYFT_CLEAN_UP();
        }
      },
    });
  }
}

export async function recordNavigationEvent(
  url: string,
  transitionType: string,
  transitionQualifiers: string[],
  recording: any[]
) {
  const navigationEvent = {
    type: "navigate",
    url,
    transitionType,
    transitionQualifiers,
  };

  const newRecording = [
    ...recording,
    {
      ...navigationEvent,
    },
  ];

  await chrome.storage.local.set({ recording: newRecording });
}