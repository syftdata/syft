import { Action, EventSchemas, GitInfo, UserSession } from "../../types";
import { getGitInfoState } from "../state/gitinfo";
import { handleGitInfoResponse } from "./git";
import { post } from "./utils";
import data from "./mock_magic.json";

export async function updateEventSchemas(
  sourceId: string,
  branch: string,
  eventSchema: EventSchemas,
  eventSchemaSha: string | undefined,
  eventTags: Action[],
  user: UserSession
): Promise<void> {
  // remove screenshots from events to reduce the payload size.
  eventTags.forEach((eventTag) => {
    eventTag.events?.forEach((event) => {
      delete event.screenshot;
    });
  });
  const response = await post("/api/catalog", user, {
    sourceId,
    branch,
    eventSchema,
    eventSchemaSha,
    eventTags,
  });
  await handleGitInfoResponse(response);
}

export async function magicAPI(user: UserSession): Promise<GitInfo> {
  const state = await getGitInfoState();
  if (state?.info == null) {
    throw new Error("GitInfo not found");
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const newGitInfo: GitInfo = {
    ...state.info,
    eventSchema: {
      ...state.info.eventSchema,
      events: data.events,
    },
    eventTags: data.eventTags as unknown as Action[],
  };
  return newGitInfo;
}
