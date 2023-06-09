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
export const GIT_INFO_STATE_KEY = "gitInfoState";
export const GIT_IN_MEMORY_STORAGE_KEY = "gitInfoInMemory";

export async function getGitInfoState(): Promise<GitInfoState | undefined> {
  const { gitInfoState } = await localStorageGet([GIT_INFO_STATE_KEY]);
  if (gitInfoState) {
    return gitInfoState;
  }
}

export async function setGitInfoState(gitInfoState: GitInfoState | undefined) {
  if (gitInfoState == null) {
    await chrome.storage.local.remove([GIT_INFO_STATE_KEY]);
  } else {
    await chrome.storage.local.set({ [GIT_INFO_STATE_KEY]: gitInfoState });
  }
}

export function useGitInfoState() {
  const [userSession] = useUserSession();
  const [gitInfoState, dispatch] = useReducer(
    reducer(userSession),
    {
      state: LoadingState.NOT_INITIALIZED,
      isModified: false,
    } as GitInfoState,
    (a) => a
  );

  useEffect(() => {
    getGitInfoState().then((storedState) => {
      if (storedState != null) {
        dispatch({
          type: GitInfoActionType.UPDATE_FULL_STATE,
          data: storedState,
        });
      }
    });
    // changes from API call flow through the storage listener
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[GIT_INFO_STATE_KEY] != null) {
        if (
          changes[GIT_INFO_STATE_KEY].newValue !==
          changes[GIT_INFO_STATE_KEY].oldValue
        ) {
          dispatch({
            type: GitInfoActionType.UPDATE_FULL_STATE,
            data: changes[GIT_INFO_STATE_KEY].newValue,
          });
        }
      }
    });
  }, []);

  return [gitInfoState, dispatch] as const;
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