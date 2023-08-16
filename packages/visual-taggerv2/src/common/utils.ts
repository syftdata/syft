import { unicodeWords } from "./naming";

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

export function shallowEqual(
  object1?: { [key: string]: any },
  object2?: { [key: string]: any }
) {
  const obj1 = object1 ?? {};
  const obj2 = object2 ?? {};
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

export function lowerize(s: string): string {
  return s[0].toLocaleLowerCase() + s.slice(1);
}

export function capitalize(s: string): string {
  return s[0].toLocaleUpperCase() + s.slice(1);
}

export function getHumanizedName(name: string): string {
  return unicodeWords(name).map(capitalize).join(" ");
}
