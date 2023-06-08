import { GitInfo, UserSession } from "../../types";
import { get, post } from "./utils";
import { getGitInfoState, setGitInfoState } from "../state/gitinfo";
import { Step } from "@puppeteer/replay";
import { genPuppeteerScript } from "../../builders";
import { GitInfoState, LoadingState } from "../state/types";

export async function handleGitInfoResponse(
  response: Response
): Promise<GitInfo | undefined> {
  if (response.ok) {
    const data = (await response.json()) as GitInfo;
    const gitInfoState: GitInfoState = {
      state: LoadingState.LOADED,
      info: data,
      modifiedInfo: data,
      error: undefined,
      isModified: false,
    };
    setGitInfoState(gitInfoState);
    return data;
  } else {
    console.error("Error fetching git info", response);
    const gitInfoState: GitInfoState = {
      state: LoadingState.LOADED,
      error: response.statusText,
      isModified: false,
    };
    setGitInfoState(gitInfoState);
  }
}

export async function fetchGitInfo(
  user: UserSession,
  sourceId?: string,
  branch?: string
): Promise<GitInfo | undefined> {
  const response = await get("/api/gitinfo", user, {
    sourceId,
    branch,
  });
  return handleGitInfoResponse(response);
}

export async function createTestSpec(
  name: string,
  steps: Step[],
  sha: string | undefined,
  user: UserSession
): Promise<void> {
  const gitInfo = await getGitInfoState();
  if (!gitInfo?.info) {
    throw new Error("GitInfo not found");
  }
  const content = genPuppeteerScript(name, steps);
  const response = await post("/api/testspecs", user, {
    sourceId: gitInfo.info.activeSourceId,
    branch: gitInfo.info.activeBranch,
    name,
    content,
    sha,
  });
  await handleGitInfoResponse(response);
}

export async function deleteTestSpec(
  name: string,
  sha: string,
  user: UserSession
): Promise<void> {
  const gitInfo = await getGitInfoState();
  if (!gitInfo?.info) {
    throw new Error("GitInfo not found");
  }
  const response = await post("/api/testspec_delete", user, {
    sourceId: gitInfo?.info.activeSourceId,
    branch: gitInfo?.info.activeBranch,
    name,
    sha,
  });
  await handleGitInfoResponse(response);
}

export async function createBranch(
  sourceId: string,
  branch: string,
  user: UserSession
): Promise<void> {
  const response = await post("/api/branches", user, {
    sourceId,
    branch,
  });
  await handleGitInfoResponse(response);
}

export async function deleteBranch(
  sourceId: string,
  branch: string,
  user: UserSession
): Promise<void> {
  const response = await post("/api/branch_delete", user, {
    sourceId,
    branch,
  });
  await handleGitInfoResponse(response);
}
