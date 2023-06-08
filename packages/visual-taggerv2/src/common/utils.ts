import { updateRecordingState } from "../cloud/state/recordingstate";
import { Action, ActionType, GitInfo, NavigateAction } from "../types";

// TODO: nages added this global to resolve compilation issues.
declare global {
  namespace browser {
    const tabs: typeof chrome.tabs;
    const webNavigation: typeof chrome.webNavigation;
    const scripting: typeof chrome.scripting;
  }
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

export function sessionStorageGet(keys: string[]) {
  return new Promise<{ [key: string]: any }>((resolve, reject) => {
    chrome.storage.session.get(keys, (storage) => {
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

export function getCurrentTabId() {
  return chrome.devtools.inspectedWindow.tabId;
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
  return await updateRecordingState((state) => {
    const newRecording = [...state.recording];
    newRecording.splice(index ?? newRecording.length, 0, action);
    return { ...state, recording: newRecording };
  });
}

export async function replaceAction(index: number, newAction?: Action) {
  return await updateRecordingState((state) => {
    const newRecording = [...state.recording];
    if (newAction != null) {
      newRecording.splice(index, 1, newAction);
    } else {
      newRecording.splice(index, 1);
    }
    return { ...state, recording: newRecording };
  });
}

export function shallowEqual(
  object1: { [key: string]: any },
  object2: { [key: string]: any }
) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }

  return true;
}
