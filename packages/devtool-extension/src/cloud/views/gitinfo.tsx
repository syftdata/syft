import { useEffect } from "react";
import { GitView } from "../../common/components/gitview";
import { EventSource, UserSession } from "../../types";
import { createBranch, deleteBranch, fetchGitInfo } from "../api/git";
import { useGitInfo } from "../state/gitinfo";
import { useUserSession } from "../state/usersession";

const GitInfo = () => {
  const [userSession] = useUserSession();
  const [gitInfo, setGitInfo] = useGitInfo();

  let activeSource: EventSource | undefined;
  const branch: string = gitInfo?.activeBranch ?? "";

  useEffect(() => {
    if (gitInfo == null) {
      return;
    }
    if (gitInfo.activeSourceId != null) {
      activeSource = gitInfo.sources.find(
        (source) => source.id === gitInfo.activeSourceId
      );
    }
  }, [gitInfo]);

  const setActiveSourceById = (sourceId: string) => {
    if (userSession == null || gitInfo == null) {
      return;
    }
    gitInfo.activeSourceId = sourceId;
    setGitInfo({ ...gitInfo });
    // make a call to the backend to set the active source.
    void fetchGitInfo(
      userSession,
      gitInfo.activeSourceId,
      gitInfo.activeBranch
    );
  };

  const setActiveBranch = (branch: string) => {
    if (userSession == null || gitInfo == null) {
      return;
    }
    gitInfo.activeBranch = branch;
    setGitInfo({ ...gitInfo });
    // make a call to the backend to set the active source.
    void fetchGitInfo(
      userSession,
      gitInfo.activeSourceId,
      gitInfo.activeBranch
    );
  };

  // TODO: show selected items at the top.
  if (!userSession || !gitInfo) {
    return <></>;
  }

  const sources = gitInfo?.sources;
  const branches = gitInfo?.branches;
  const files = gitInfo?.files ?? [];

  const _createBranch = (branch: string) => {
    createBranch(branch, userSession);
  };

  const _deleteBranch = (branch: string) => {
    deleteBranch(branch, userSession);
  };

  return (
    <GitView
      sources={sources}
      activeSource={activeSource}
      setActiveSourceById={setActiveSourceById}
      branches={branches}
      activeBranch={branch}
      setActiveBranch={setActiveBranch}
      deleteBranch={_deleteBranch}
      createBranch={_createBranch}
      files={files}
    />
  );
};

export default GitInfo;
