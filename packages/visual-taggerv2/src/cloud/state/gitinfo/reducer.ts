import { UserSession } from "../../../types";
import { createBranch, deleteBranch, fetchGitInfo } from "../../api/git";
import { updateEventSchemas } from "../../api/schema";
import { setGitInfoState } from "../gitinfo";
import {
  GitInfoAction,
  GitInfoActionType,
  GitInfoState,
  LoadingState,
} from "../types";

export default function reducer(userSession: UserSession | undefined) {
  if (!userSession) {
    return (state: GitInfoState, action: GitInfoAction) => {
      return state;
    };
  }
  return (state: GitInfoState, action: GitInfoAction) => {
    let forceRefresh = false;
    let newState: GitInfoState = {
      ...state,
      info: state.info ? { ...state.info } : undefined,
      modifiedInfo: state.modifiedInfo ? { ...state.modifiedInfo } : state.info,
    };
    switch (action.type) {
      case GitInfoActionType.UPDATE_FULL_STATE:
        return {
          ...state,
          ...action.data,
        } as GitInfoState;
      case GitInfoActionType.REFRESH_INFO:
        forceRefresh = true;
        break;
      case GitInfoActionType.CREATE_BRANCH:
        if (newState.info == null) throw new Error("");
        // TODO: dont allow switching if current branch has changes.
        newState.state = LoadingState.LOADING;
        void createBranch(
          newState.info.activeSourceId!,
          action.data,
          userSession
        );
        newState.modifiedInfo = undefined;
        newState.isModified = false;
        break;
      case GitInfoActionType.DELETE_BRANCH:
        if (newState.info == null) throw new Error("");
        // TODO: dont allow switching if current branch has changes.
        newState.state = LoadingState.LOADING;
        void deleteBranch(
          newState.info.activeSourceId!,
          action.data,
          userSession
        );
        newState.modifiedInfo = undefined;
        newState.isModified = false;
        break;
      case GitInfoActionType.UPDATE_SOURCE:
        if (newState.info == null) throw new Error("");
        // TODO: dont allow switching if current branch has changes.
        newState.info.activeSourceId = action.data;
        newState.info.activeBranch = undefined;
        newState.modifiedInfo = undefined;
        newState.isModified = false;
        break;
      case GitInfoActionType.UPDATE_BRANCH:
        if (newState.info == null) throw new Error("");
        // TODO: dont allow switching if current branch has changes.
        newState.info.activeBranch = action.data;
        newState.modifiedInfo = undefined;
        newState.isModified = false;
        break;
      case GitInfoActionType.UPDATE_EVENT_SCHEMA:
        if (newState.modifiedInfo == null) throw new Error("");
        newState.modifiedInfo.eventSchema.events = action.data;
        newState.isModified = true;
        break;
      case GitInfoActionType.UPDATE_EVENT_TAGS:
        if (newState.modifiedInfo == null) throw new Error("");
        newState.modifiedInfo.eventTags = action.data;
        newState.isModified = true;
        break;
      case GitInfoActionType.COMMIT:
        if (!newState.isModified) return state;
        if (newState.modifiedInfo == null) throw new Error("");
        // write changes to cloud.
        newState.isModified = false;
        updateEventSchemas(
          newState.modifiedInfo.activeSourceId!,
          newState.modifiedInfo.activeBranch!,
          newState.modifiedInfo.eventSchema,
          newState.modifiedInfo.eventSchemaSha,
          newState.modifiedInfo.eventTags,
          userSession
        );
        break;
      case GitInfoActionType.FETCH_MAGIC_CHANGES:
        newState.state = LoadingState.LOADING;
        break;
      case GitInfoActionType.FETCHED_MAGIC_CHANGES:
        if (newState.modifiedInfo == null) throw new Error("");
        newState.state = LoadingState.LOADED;
        newState.isModified = true;
        newState.modifiedInfo.eventSchema.events =
          action.data.eventSchema.events;
        newState.modifiedInfo.eventTags = action.data.eventTags;
        break;
    }

    if (
      forceRefresh ||
      state.info?.activeSourceId != newState.info?.activeSourceId ||
      state.info?.activeBranch != newState.info?.activeBranch
    ) {
      // make a call to the backend to set the active source.
      void fetchGitInfo(
        userSession,
        newState.info?.activeSourceId,
        newState.info?.activeBranch
      );
      newState.state = LoadingState.LOADING;
    }
    setGitInfoState(newState);
    console.log(
      ">> Updating the new state and action type ",
      newState,
      action.type
    );
    return newState;
  };
}
