/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useGitInfo } from "../state/gitinfo";
import { useUserSession } from "../state/usersession";
import { SimpleGitView } from "../../common/components/simplegitview";
import { Css, Flex } from "../../common/styles/common.styles";
import { createBranch, deleteBranch, fetchGitInfo } from "../api/git";

export function GitView() {
  const [userSession] = useUserSession();
  const [gitInfo, setGitInfo] = useGitInfo();

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

  const _createBranch = (branch: string) => {
    createBranch(branch, userSession);
  };

  const _deleteBranch = (branch: string) => {
    deleteBranch(branch, userSession);
  };

  const activeSource =
    gitInfo.sources.find((source) => source.id === gitInfo.activeSourceId) ??
    gitInfo.sources[0];

  return (
    <Flex.Row
      gap={8}
      alignItems="center"
      justifyContent="start"
      className={Css.padding("0px 8px")}
    >
      <SimpleGitView
        sources={gitInfo.sources}
        activeSource={activeSource}
        setActiveSourceById={setActiveSourceById}
        branches={gitInfo.branches}
        activeBranch={gitInfo.activeBranch ?? ""}
        setActiveBranch={setActiveBranch}
        createBranch={_createBranch}
        rowWise={true}
      />
    </Flex.Row>
  );
}
