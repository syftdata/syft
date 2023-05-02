import { getConstants } from "../constants";
// @ts-ignore-error - CRXJS needs injected scripts to be this way.
// https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import scriptPath from "../recorder?script";
import { Action, ActionType, LoginSession, NavigateAction } from "../types";

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

export function setLoginSessionStorage(session: LoginSession) {
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

export function isEmptyArray(array?: any[]) {
  return array == null || array.length === 0;
}

export function isArrayEqual(array?: any[], other?: any[]) {
  if (array == other) return true;
  if (isEmptyArray(array) && isEmptyArray(other)) return true;
  if (!array || !other) return false;
  return (
    array.length === other.length &&
    array.every((value, index) => value === other[index])
  );
}

export async function retrieveLoginSession(): Promise<
  LoginSession | undefined
> {
  const { loginSession } = await localStorageGet(["loginSession"]);
  if (loginSession) {
    return loginSession;
  }
  const constants = await getConstants();
  const response = await fetch(`${constants.WebAppUrl}/api/auth/session`, {
    mode: "cors",
  });
  console.log(
    "[Syft][Devtools] loginSession not found. Retrieving from server."
  );
  const session = await response.json();
  console.log("[Syft][Devtools] session", session);
  if (Object.keys(session).length > 0) {
    console.log("[Syft][Devtools] setting loginSession in storage");
    setLoginSessionStorage(session);
    return session;
  }
  return;
}

let loginCheckInterval: NodeJS.Timer | null = null;
export async function initiateLoginFlow(): Promise<LoginSession> {
  const session = await retrieveLoginSession();
  if (session) {
    return session;
  } else {
    const constants = await getConstants();
    // TODO: clearing old interval. This is a hack. Need to fix this.
    if (loginCheckInterval) clearInterval(loginCheckInterval);
    return new Promise((resolve, reject) => {
      createTab(constants.WebAppUrl);
      loginCheckInterval = setInterval(async () => {
        const session = await retrieveLoginSession();
        if (session) {
          resolve(session);
          if (loginCheckInterval) clearInterval(loginCheckInterval);
        }
      }, 1000);
    });
  }
}

export function downloadFile(name: string, contents: string): void {
  // write code to show download dialog for a text.
  const blob = new Blob([contents], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.setProperty("display", "none");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

export async function saveFile(name: string, contents: string): Promise<void> {
  const session = await retrieveLoginSession();
  if (session) {
    const constants = await getConstants();
    const response = await fetch(`${constants.WebAppUrl}/api/authed/file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.jwt}`,
      },
      body: JSON.stringify({
        name,
        contents,
      }),
    });
    const data = await response.json();
    console.log("[Syft][Devtools] saveFile response", data);
  }
}
