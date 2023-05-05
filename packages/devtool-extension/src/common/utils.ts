import { getConstants } from "../constants";
import { Action, ActionType, GitInfo, NavigateAction } from "../types";

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

export function setPreferredLibraryStorage(library: string) {
  chrome.storage.local.set({ preferredLibrary: library });
}

export function setLoginSessionStorage(session: GitInfo) {
  // store this only for 1 hr.
  chrome.storage.local.set({ loginSession: session });
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

export async function recordNavigationEvent(
  url: string,
  transitionType: string
) {
  const navigationEvent = {
    type: ActionType.Navigate,
    url,
    source: transitionType,
  } as NavigateAction;
  await insertNewAction(navigationEvent);
}

export async function insertNewAction(action: Action, index?: number) {
  const { recording } = await localStorageGet(["recording"]);
  const newRecording = [...recording];
  newRecording.splice(index ?? newRecording.length, 0, action);
  await chrome.storage.local.set({ recording: newRecording });
}

export async function replaceAction(
  index: number,
  newAction?: Action
): Promise<Action[]> {
  const { recording } = await localStorageGet(["recording"]);
  const newRecording = [...recording];
  if (newAction != null) {
    newRecording.splice(index, 1, newAction);
  } else {
    newRecording.splice(index, 1);
  }
  await chrome.storage.local.set({ recording: newRecording });
  return newRecording;
}
