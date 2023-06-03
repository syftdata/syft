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
import { genPuppeteerSteps } from "../builders";
import { useGitInfo } from "../cloud/state/gitinfo";
import { Subheading } from "../common/styles/fonts";
import { css } from "@emotion/css";
import Spinner from "../common/components/core/Spinner/Spinner";
import { magicAPI } from "../cloud/api/schema";

export interface TaggingAppProps {
  actions: Action[];
  startTagging: () => void;
  endTagging: () => void;
  onUpdateAction: (index: number, action?: Action) => void;
}

enum TaggingState {
  Stopped,
  Recording,
}

export default function TaggingApp({
  startTagging,
  endTagging,
  onUpdateAction,
  actions,
}: TaggingAppProps) {
  const [userSession] = useUserSession();
  const [gitInfo] = useGitInfo();
  const [taggingState, setTaggingState] = useState(TaggingState.Stopped);

  if (!userSession) {
    return (
      <Flex.Col className={Css.height("calc(100vh - 80px)")}>
        <LoginView />
      </Flex.Col>
    );
  }

  if (!gitInfo) {
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

  const onStartRecording = () => {
    startTagging();
    setTaggingState(TaggingState.Recording);
  };
  const onStopRecording = () => {
    endTagging();
    setTaggingState(TaggingState.Stopped);
  };
  const onMagicWand = () => {
    magicAPI(userSession);
  };

  const getRecordingView = () => {
    return (
      <>
        <FlexExtra.RowWithDivider>
          <PrimaryIconButton
            icon="highlighter"
            onClick={onStopRecording}
            size="medium"
          />
        </FlexExtra.RowWithDivider>
        <ActionsEditor actions={actions} onUpdateAction={onUpdateAction} />
      </>
    );
  };

  const getHomeView = () => {
    return (
      <>
        <FlexExtra.RowWithDivider gap={16} className={Css.padding(8)}>
          <IconButton icon="highlighter" onClick={onStartRecording} />
          <IconButton icon="magic-wand" onClick={onMagicWand} />
        </FlexExtra.RowWithDivider>
        <ActionsEditor actions={actions} />
      </>
    );
  };

  const getView = () => {
    switch (taggingState) {
      case TaggingState.Stopped:
        return getHomeView();
      case TaggingState.Recording:
        return getRecordingView();
    }
  };

  return (
    <Flex.Col className={Css.height("calc(100vh - 80px)")}>
      {getView()}
    </Flex.Col>
  );
}
