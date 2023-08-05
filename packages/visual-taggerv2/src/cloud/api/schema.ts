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
  console.log(">>>>> updateEventSchemas", eventTags);
  const response = await post("/api/catalog", user, {
    sourceId,
    branch,
    eventSchema,
    eventSchemaSha,
    eventTags,
  });
  await handleGitInfoResponse(response);
}

export async function magicAPI1(
  user: UserSession,
  possibleActions: Action[]
): Promise<GitInfo> {
  const state = await getGitInfoState();
  if (state?.info == null) {
    throw new Error("GitInfo not found");
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // lets translate the possible actions to the actual actions.

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

export async function magicAPI(
  user: UserSession,
  possibleEventTags: Action[]
): Promise<GitInfo> {
  const state = await getGitInfoState();
  if (state?.info == null) {
    throw new Error("GitInfo not found");
  }

  console.log(">>>>> magicAPI", possibleEventTags);
  const response = await post("/api/magic_events", user, {
    possibleEventTags,
    eventTags: state.info.eventTags,
    eventSchema: state.info.eventSchema,
  });
  const data = (await response.json()) as GitInfo;
  return data;
}
