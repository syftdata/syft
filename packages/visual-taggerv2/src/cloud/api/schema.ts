import { Action, EventSchemas, GitInfo, UserSession } from "../../types";
import { getGitInfo, setGitInfo } from "../state/gitinfo";
import { handleGitInfoResponse } from "./git";
import { post } from "./utils";
import data from "./mock_magic.json";

export async function updateEventSchemas(
  sourceId: string,
  branch: string,
  eventSchema: EventSchemas,
  eventSchemaSha: string | undefined,
  eventTags: Action[],
  eventTagsSha: string | undefined,
  user: UserSession
): Promise<void> {
  const response = await post("/api/catalog", user, {
    sourceId,
    branch,
    eventSchema,
    eventSchemaSha,
    eventTags,
    eventTagsSha,
  });
  await handleGitInfoResponse(response);
}

export async function magicAPI(user: UserSession): Promise<void> {
  const gitInfo = await getGitInfo();
  if (!gitInfo) {
    throw new Error("GitInfo not found");
  }
  const newGitInfo: GitInfo = {
    ...gitInfo,
    eventSchema: {
      ...gitInfo.eventSchema,
      events: data.events,
    },
    eventTags: data.eventTags,
  };
  await setGitInfo(newGitInfo);
}
