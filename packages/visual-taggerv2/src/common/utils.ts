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
  // const navigationEvent = {
  //   type: ActionType.Navigate,
  //   url,
  //   source: transitionType,
  // } as NavigateAction;
  // await insertNewAction(navigationEvent);
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

/** Used to match words composed of alphanumeric characters. */
// eslint-disable-next-line no-control-regex
const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
export function asciiWords(val: string): string[] {
  return val.replace(/['\u2019]/g, "").match(reAsciiWord) ?? [];
}

export function getHumanizedName(name: string): string {
  return asciiWords(name).map(capitalize).join(" ");
}
