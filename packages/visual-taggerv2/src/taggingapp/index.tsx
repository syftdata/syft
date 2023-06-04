import { useState } from "react";
import { Action } from "../types";

import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import LoginView from "../cloud/views/LoginView";
import { useUserSession } from "../cloud/state/usersession";
import ActionsEditor from "./ActionsEditor";
import { useGitInfoContext } from "../cloud/state/gitinfo";
import { Subheading } from "../common/styles/fonts";
import { css } from "@emotion/css";
import Spinner from "../common/components/core/Spinner/Spinner";
import { magicAPI } from "../cloud/api/schema";
import { GitInfoActionType } from "../cloud/state/types";

export interface TaggingAppProps {
  actions: Action[];
  startTagging: () => void;
  stopTagging: () => void;
  onUpdateAction: (index: number, action?: Action) => void;
}

enum TaggingState {
  Stopped,
  Tagging,
}

export default function TaggingApp({
  startTagging,
  stopTagging,
  onUpdateAction,
  actions,
}: TaggingAppProps) {
  const [userSession] = useUserSession();
  const { gitInfoState, dispatch } = useGitInfoContext();
  const [taggingState, setTaggingState] = useState(TaggingState.Stopped);

  if (!userSession) {
    return (
      <Flex.Col className={Css.height("calc(100vh - 80px)")}>
        <LoginView />
      </Flex.Col>
    );
  }

  if (!gitInfoState.info) {
    return (
      <Flex.Col
        gap={24}
        alignItems="center"
        className={css(Css.padding("24px 10px"), Flex.grow(1))}
      >
        <Subheading.SH12>
          Connecting to your Syft Studio workspace..
        </Subheading.SH12>
        <Flex.Row>
          <Spinner />
        </Flex.Row>
      </Flex.Col>
    );
  }

  const onStartTagging = () => {
    startTagging();
    setTaggingState(TaggingState.Tagging);
  };
  const onStopTagging = () => {
    stopTagging();
    setTaggingState(TaggingState.Stopped);
  };
  const onMagicWand = () => {
    dispatch({
      type: GitInfoActionType.FETCH_MAGIC_CHANGES,
    });
    magicAPI(userSession).then((g) => {
      dispatch({
        type: GitInfoActionType.FETCHED_MAGIC_CHANGES,
        data: g,
      });
    });
  };

  const getTaggingView = () => {
    return (
      <>
        <FlexExtra.RowWithDivider gap={16} className={Css.padding(8)}>
          <PrimaryIconButton
            icon="highlighter"
            onClick={onStopTagging}
            size="medium"
          />
        </FlexExtra.RowWithDivider>
        <ActionsEditor
          title="Actions"
          actions={actions}
          onUpdateAction={onUpdateAction}
        />
        <ActionsEditor
          title="Tags"
          actions={gitInfoState.info?.eventTags ?? []}
        />
      </>
    );
  };

  const getHomeView = () => {
    return (
      <>
        <FlexExtra.RowWithDivider gap={16} className={Css.padding(8)}>
          <IconButton icon="highlighter" onClick={onStartTagging} />
          <IconButton icon="magic-wand" onClick={onMagicWand} />
        </FlexExtra.RowWithDivider>
        <ActionsEditor actions={gitInfoState.info?.eventTags ?? []} />
      </>
    );
  };

  const getView = () => {
    switch (taggingState) {
      case TaggingState.Stopped:
        return getHomeView();
      case TaggingState.Tagging:
        return getTaggingView();
    }
  };

  return (
    <Flex.Col className={Css.height("calc(100vh - 80px)")}>
      {getView()}
    </Flex.Col>
  );
}
