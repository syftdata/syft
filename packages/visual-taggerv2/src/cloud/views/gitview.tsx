/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useGitInfoContext } from "../state/gitinfo";
import { useUserSession } from "../state/usersession";
import { SimpleGitView } from "../../common/components/simplegitview";
import { Css, Flex } from "../../common/styles/common.styles";
import { GitInfoActionType, LoadingState } from "../state/types";
import Spinner from "../../common/components/core/Spinner/Spinner";
import Icon from "../../common/components/core/Icon/Icon";

export function GitView() {
  const [userSession] = useUserSession();
  const { gitInfoState, dispatch } = useGitInfoContext();

  const gitInfo = gitInfoState.modifiedInfo ?? gitInfoState.info;

  // TODO: show selected items at the top.
  if (!userSession || !gitInfo) {
    return <></>;
  }

  const setActiveSourceById = (sourceId: string) => {
    dispatch({
      type: GitInfoActionType.UPDATE_SOURCE,
      data: sourceId,
    });
  };

  const setActiveBranch = (branch: string) => {
    dispatch({
      type: GitInfoActionType.UPDATE_BRANCH,
      data: branch,
    });
  };

  const createBranch = (branch: string) => {
    dispatch({
      type: GitInfoActionType.CREATE_BRANCH,
      data: branch,
    });
  };

  const deleteBranch = (branch: string) => {
    dispatch({
      type: GitInfoActionType.DELETE_BRANCH,
      data: branch,
    });
  };

  const onCommit = () => {
    dispatch({
      type: GitInfoActionType.COMMIT,
    });
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
        createBranch={createBranch}
        rowWise={true}
        onCommit={onCommit}
        hasChanges={gitInfoState.isModified}
      />
      {gitInfoState.state === LoadingState.LOADING && (
        <Icon icon="spinner" size="medium" />
      )}
    </Flex.Row>
  );
}
