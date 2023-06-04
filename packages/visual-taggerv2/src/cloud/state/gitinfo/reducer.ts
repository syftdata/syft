import { UserSession } from "../../../types";
import { createBranch, deleteBranch, fetchGitInfo } from "../../api/git";
import { updateEventSchemas } from "../../api/schema";
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
    };
    console.log(">> old state ", state, action);
    switch (action.type) {
      case GitInfoActionType.SET_DATA:
        // gets called by the API call.
        return {
          ...state,
          state: LoadingState.LOADED,
          info: action.data,
        } as GitInfoState;
      case GitInfoActionType.REFRESH:
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
        break;
      case GitInfoActionType.UPDATE_SOURCE:
        if (newState.info == null) throw new Error("");
        // TODO: dont allow switching if current branch has changes.
        newState.info.activeSourceId = action.data;
        newState.info.activeBranch = undefined;
        break;
      case GitInfoActionType.UPDATE_BRANCH:
        if (newState.info == null) throw new Error("");
        // TODO: dont allow switching if current branch has changes.
        newState.info.activeBranch = action.data;
        break;
      case GitInfoActionType.UPDATE_EVENT_SCHEMA:
        if (newState.info == null) throw new Error("");
        newState.info.eventSchema.events = action.data;
        newState.isModified = true;
        break;
      case GitInfoActionType.UPDATE_EVENT_TAGS:
        if (newState.info == null) throw new Error("");
        newState.info.eventTags = action.data;
        newState.isModified = true;
        break;
      case GitInfoActionType.COMMIT:
        if (newState.info == null) throw new Error("");
        // write changes to cloud.
        newState.isModified = false;
        updateEventSchemas(
          newState.info.activeSourceId!,
          newState.info.activeSourceId!,
          newState.info.eventSchema,
          newState.info.eventSchemaSha,
          newState.info.eventTags,
          newState.info.eventTagsSha,
          userSession
        );
        break;
    }
    if (
      newState.info != null &&
      (forceRefresh ||
        state.info?.activeSourceId != newState.info.activeSourceId ||
        state.info?.activeBranch != newState.info.activeBranch)
    ) {
      // make a call to the backend to set the active source.
      void fetchGitInfo(
        userSession,
        newState.info.activeSourceId,
        newState.info.activeBranch
      );
      newState.state = LoadingState.LOADING;
    }
    console.log(">> new state ", newState);
    return newState;
  };
}
