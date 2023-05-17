import { useEffect, useState } from "react";
import { localStorageGet } from "../../common/utils";
import { GitInfo, UserSession } from "../../types";
import { setGitInfo } from "./gitinfo";

export const STORAGE_KEY = "userSession";
export async function getUserSession(): Promise<UserSession | undefined> {
  const { userSession } = await localStorageGet([STORAGE_KEY]);
  if (userSession) {
    return userSession;
  }
}

export async function setUserSession(userSession: UserSession | undefined) {
  if (userSession == null) {
    // clear all cloud data.
    // TODO: we need to group this data.
    await setGitInfo(undefined);
    await chrome.storage.local.remove([STORAGE_KEY]);
  } else {
    await chrome.storage.local.set({ [STORAGE_KEY]: userSession });
  }
}

export function useUserSession() {
  const [_userSession, _setUserSession] = useState<UserSession | undefined>();
  useEffect(() => {
    getUserSession().then((storedSession) => {
      if (storedSession != null) {
        _setUserSession(storedSession);
      }
    });
  }, []);

  // changes flow through the storage listener
  chrome.storage.onChanged.addListener((changes) => {
    if (
      changes[STORAGE_KEY] != null &&
      changes[STORAGE_KEY].newValue != changes[STORAGE_KEY].oldValue
    ) {
      _setUserSession(changes[STORAGE_KEY].newValue);
    }
  });

  return [_userSession, setUserSession] as const;
}
