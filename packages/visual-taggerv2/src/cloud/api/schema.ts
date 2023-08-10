import {
  Action,
  EventSchemas,
  GitInfo,
  ReactElement,
  UserSession,
} from "../../types";
import { getGitInfoState } from "../state/gitinfo";
import { handleGitInfoResponse } from "./git";
import { post } from "./utils";

export async function updateEventSchemas(
  sourceId: string,
  branch: string,
  eventSchema: EventSchemas,
  eventSchemaSha: string | undefined,
  eventTags: Action[],
  user: UserSession
): Promise<void> {
  const response = await post("/api/catalog", user, {
    sourceId,
    branch,
    eventSchema,
    eventSchemaSha,
    eventTags,
  });
  await handleGitInfoResponse(response);
}

export async function magicAPI(
  user: UserSession,
  possibleEventTags: ReactElement[]
): Promise<GitInfo> {
  const state = await getGitInfoState();
  if (state?.info == null) {
    throw new Error("GitInfo not found");
  }

  const response = await post("/api/magic_events", user, {
    possibleEventTags,
    eventTags: state.info.eventTags,
    eventSchema: state.info.eventSchema,
  });
  const data = (await response.json()) as GitInfo;
  return data;
}
