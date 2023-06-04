import { createContext, useContext, useEffect, useReducer } from "react";
import { localStorageGet } from "../../common/utils";
import { GitInfo } from "../../types";
import {
  GitInfoAction,
  GitInfoActionType,
  GitInfoState,
  LoadingState,
} from "./types";
import reducer from "./gitinfo/reducer";
import { useUserSession } from "./usersession";

export const GIT_STORAGE_KEY = "gitInfo";

export async function getGitInfo(): Promise<GitInfo | undefined> {
  const { gitInfo } = await localStorageGet([GIT_STORAGE_KEY]);
  if (gitInfo) {
    return gitInfo;
  }
}

export async function setGitInfo(gitInfo: GitInfo | undefined) {
  if (gitInfo == null) {
    await chrome.storage.local.remove([GIT_STORAGE_KEY]);
  } else {
    await chrome.storage.local.set({ [GIT_STORAGE_KEY]: gitInfo });
  }
}

export function useGitInfo() {
  const [userSession] = useUserSession();
  const [gitInfo, dispatch] = useReducer(
    reducer(userSession),
    {
      state: LoadingState.NOT_INITIALIZED,
      isModified: false,
    } as GitInfoState,
    (a) => a
  );

  useEffect(() => {
    getGitInfo().then((storedGitInfo) => {
      if (storedGitInfo != null) {
        dispatch({
          type: GitInfoActionType.SET_DATA,
          data: storedGitInfo,
        });
      }
      // changes flow through the storage listener
      chrome.storage.onChanged.addListener((changes) => {
        if (changes[GIT_STORAGE_KEY] != null) {
          dispatch({
            type: GitInfoActionType.SET_DATA,
            data: changes[GIT_STORAGE_KEY].newValue,
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    if (userSession != null) {
      dispatch({
        type: GitInfoActionType.REFRESH,
      });
    }
  }, [userSession]);

  return [gitInfo, dispatch] as const;
}

type GitInfoContextType = {
  gitInfoState: GitInfoState;
  dispatch: (action: GitInfoAction) => void;
};
export const GitInfoContext = createContext<GitInfoContextType>({
  gitInfoState: {
    state: LoadingState.NOT_INITIALIZED,
    isModified: false,
  },
  dispatch: () => {},
});
export function useGitInfoContext() {
  return useContext(GitInfoContext);
}
