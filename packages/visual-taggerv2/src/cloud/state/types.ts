import { GitInfo } from "../../types";

export enum LoadingState {
  NOT_INITIALIZED,
  LOADED,
  LOADING,
}

export enum GitInfoActionType {
  UPDATE_SOURCE,
  UPDATE_BRANCH,
  UPDATE_EVENT_TAGS,
  UPDATE_EVENT_SCHEMA,
  COMMIT,

  CREATE_BRANCH,
  DELETE_BRANCH,

  SET_DATA,
  REFRESH,

  FETCH_MAGIC_CHANGES,
  FETCHED_MAGIC_CHANGES,
}

export interface GitInfoAction {
  type: GitInfoActionType;
  data?: any;
}

export interface GitInfoState {
  info?: GitInfo;
  // unmodifiedInfo?: GitInfo;

  state: LoadingState;
  error?: string;
  isModified: boolean;
}
