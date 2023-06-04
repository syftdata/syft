import { useEffect, useState } from "react";
import { localStorageGet } from "../../common/utils";
import { UserSession } from "../../types";
import { GIT_IN_MEMORY_STORAGE_KEY, GIT_STORAGE_KEY } from "./gitinfo";

export const USER_STORAGE_KEY = "userSession";
export async function getUserSession(): Promise<UserSession | undefined> {
  const { userSession } = await localStorageGet([USER_STORAGE_KEY]);
  if (userSession) {
    return userSession;
  }
}

export async function setUserSession(userSession: UserSession | undefined) {
  if (userSession == null) {
    await chrome.storage.local.remove([
      GIT_STORAGE_KEY,
      GIT_IN_MEMORY_STORAGE_KEY,
      USER_STORAGE_KEY,
    ]);
  } else {
    await chrome.storage.local.set({ [USER_STORAGE_KEY]: userSession });
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
      changes[USER_STORAGE_KEY] != null &&
      changes[USER_STORAGE_KEY].newValue != changes[USER_STORAGE_KEY].oldValue
    ) {
      _setUserSession(changes[USER_STORAGE_KEY].newValue);
    }
  });

  return [_userSession, setUserSession] as const;
}
