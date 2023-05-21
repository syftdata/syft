import { GitInfo, UserSession } from "../../types";
import { get, post } from "./utils";
import { getGitInfo, setGitInfo } from "../state/gitinfo";
import { Step } from "@puppeteer/replay";
import { genPuppeteerScript } from "../../builders";

export function downloadFile(name: string, contents: string): void {
  // write code to show download dialog for a text.
  const blob = new Blob([contents], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.setProperty("display", "none");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

async function handleGitInfoResponse(
  response: Response
): Promise<GitInfo | undefined> {
  if (response.ok) {
    const data = (await response.json()) as GitInfo;
    setGitInfo(data);
    return data;
  } else {
    console.error("Error fetching git info", response);
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
  const gitInfo = await getGitInfo();
  if (!gitInfo) {
    throw new Error("GitInfo not found");
  }
  const content = genPuppeteerScript(name, steps);
  const response = await post("/api/testspecs", user, {
    sourceId: gitInfo.activeSourceId,
    branch: gitInfo.activeBranch,
    name,
    content,
    sha,
  });
  handleGitInfoResponse(response);
}

export async function deleteTestSpec(
  name: string,
  sha: string,
  user: UserSession
): Promise<void> {
  const gitInfo = await getGitInfo();
  if (!gitInfo) {
    throw new Error("GitInfo not found");
  }
  const response = await post("/api/testspec_delete", user, {
    sourceId: gitInfo.activeSourceId,
    branch: gitInfo.activeBranch,
    name,
    sha,
  });
  handleGitInfoResponse(response);
}

export async function createBranch(
  branch: string,
  user: UserSession
): Promise<void> {
  const gitInfo = await getGitInfo();
  if (!gitInfo) {
    throw new Error("GitInfo not found");
  }

  const response = await post("/api/branches", user, {
    sourceId: gitInfo.activeSourceId,
    branch,
  });
  handleGitInfoResponse(response);
}

export async function deleteBranch(
  branch: string,
  user: UserSession
): Promise<void> {
  const gitInfo = await getGitInfo();
  if (!gitInfo) {
    throw new Error("GitInfo not found");
  }
  const response = await post("/api/branch_delete", user, {
    sourceId: gitInfo.activeSourceId,
    branch,
  });
  handleGitInfoResponse(response);
}
