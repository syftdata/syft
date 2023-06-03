import { EventSchemas, UserSession } from "../../types";
import { getGitInfo, setGitInfo } from "../state/gitinfo";
import { handleGitInfoResponse } from "./git";
import { post } from "./utils";
import data from "./mock_magic.json";

export async function updateEventSchemas(
  eventSchema: EventSchemas,
  eventSchemaSha: string | undefined,
  user: UserSession
): Promise<void> {
  const gitInfo = await getGitInfo();
  if (!gitInfo) {
    throw new Error("GitInfo not found");
  }
  const response = await post("/api/catalog", user, {
    sourceId: gitInfo.activeSourceId,
    branch: gitInfo.activeBranch,
    eventSchema,
    eventSchemaSha,
  });
  await handleGitInfoResponse(response);
}

export async function magicAPI(user: UserSession): Promise<void> {
  const gitInfo = await getGitInfo();
  if (!gitInfo) {
    throw new Error("GitInfo not found");
  }
  const newGitInfo = {
    ...gitInfo,
    eventSchema: {
      ...gitInfo.eventSchema,
      events: data.events,
    },
  };
  await setGitInfo(newGitInfo);
}
