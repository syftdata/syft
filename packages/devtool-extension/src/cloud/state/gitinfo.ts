import { useEffect, useState } from "react";
import { localStorageGet } from "../../common/utils";
import { GitInfo } from "../../types";

export const STORAGE_KEY = "gitInfo";

export async function getGitInfo(): Promise<GitInfo | undefined> {
  const { gitInfo } = await localStorageGet([STORAGE_KEY]);
  if (gitInfo) {
    return gitInfo;
  }
}

export async function setGitInfo(gitInfo: GitInfo | undefined) {
  if (gitInfo == null) {
    await chrome.storage.local.remove([STORAGE_KEY]);
  } else {
    await chrome.storage.local.set({ [STORAGE_KEY]: gitInfo });
  }
}

export function useGitInfo() {
  const [_gitInfo, _setGitInfo] = useState<GitInfo | undefined>();
  useEffect(() => {
    getGitInfo().then((storedGitInfo) => {
      if (storedGitInfo != null) {
        _setGitInfo(storedGitInfo);
      }
    });
  }, []);

  // changes flow through the storage listener
  chrome.storage.onChanged.addListener((changes) => {
    if (
      changes[STORAGE_KEY] != null &&
      changes[STORAGE_KEY].newValue != changes[STORAGE_KEY].oldValue
    ) {
      _setGitInfo(changes[STORAGE_KEY].newValue);
    }
  });

  return [_gitInfo, setGitInfo] as const;
}
