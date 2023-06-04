import { Action, EventSchemas, GitInfo, UserSession } from "../../types";
import { getGitInfo } from "../state/gitinfo";
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
  const gitInfo = await getGitInfo();
  if (!gitInfo) {
    throw new Error("GitInfo not found");
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const newGitInfo: GitInfo = {
    ...gitInfo,
    eventSchema: {
      ...gitInfo.eventSchema,
      events: data.events,
    },
    eventTags: data.eventTags as unknown as Action[],
  };
  return newGitInfo;
}
