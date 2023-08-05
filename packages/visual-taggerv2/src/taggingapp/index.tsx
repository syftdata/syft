import { Action, RecordingMode } from "../types";

import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import { useUserSession } from "../cloud/state/usersession";
import PreviewEditor from "./PreviewEditor";
import { useGitInfoContext } from "../cloud/state/gitinfo";
import { Subheading } from "../common/styles/fonts";
import { css } from "@emotion/css";
import Spinner from "../common/components/core/Spinner/Spinner";
import { magicAPI } from "../cloud/api/schema";
import { GitInfoActionType } from "../cloud/state/types";
import {
  updateRecordingState,
  useRecordingState,
} from "../cloud/state/recordingstate";
import Section from "../common/components/core/Section";
import ActionList from "./ActionList";

export interface TaggingAppProps {
  startTagging: () => void;
  stopTagging: () => void;
  magicWand: () => void;
}

export default function TaggingApp({
  startTagging,
  stopTagging,
  magicWand,
}: TaggingAppProps) {
  const [userSession] = useUserSession();
  const { gitInfoState, dispatch } = useGitInfoContext();
  const { recordingState } = useRecordingState();

  if (!userSession) {
    return <></>;
  }

  const actions = recordingState.recording;
  const gitInfo = gitInfoState.modifiedInfo ?? gitInfoState.info;
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

  const onMagicWand = () => {
    magicWand();
  };

  const onUpdateTag = (index: number, action?: Action) => {
    const newTags = [...gitInfo.eventTags];
    if (action != null) {
      newTags.splice(index, 1, action);
    } else {
      newTags.splice(index, 1);
    }
    dispatch({
      type: GitInfoActionType.UPDATE_EVENT_TAGS,
      data: newTags,
    });
  };

  const getPreviewView = () => {
    const tags = gitInfo.eventTags ?? [];
    const schemas = gitInfo.eventSchema.events ?? [];
    return (
      <>
        <FlexExtra.RowWithDivider gap={16} className={Css.padding(8)}>
          <PrimaryIconButton icon="highlighter" onClick={stopTagging} />
        </FlexExtra.RowWithDivider>
        <PreviewEditor
          tags={tags}
          actions={actions}
          schemas={schemas}
          previewAction={recordingState.previewAction}
          previewActionMatchedTagIndex={
            recordingState.previewActionMatchedTagIndex
          }
          onUpdateTag={onUpdateTag}
          onSelectTag={(index) => {
            updateRecordingState((state) => ({
              ...state,
              previewActionMatchedTagIndex: index,
              previewAction: tags[index],
            }));
          }}
        />
      </>
    );
  };

  const getRecordingView = () => {
    return (
      <>
        <FlexExtra.RowWithDivider gap={16} className={Css.padding(8)}>
          <IconButton icon="highlighter" onClick={startTagging} />
          <IconButton icon="magic-wand" onClick={onMagicWand} />
        </FlexExtra.RowWithDivider>
        <Section
          title="Interactions"
          className={Flex.grow(1)}
          expandable={true}
          defaultExpanded={true}
        >
          <ActionList actions={actions} className={Flex.grow(1)} />
        </Section>
      </>
    );
  };

  const getView = () => {
    switch (recordingState.mode) {
      case RecordingMode.RECORDING:
        return getRecordingView();
      case RecordingMode.PREVIEW:
        return getPreviewView();
    }
    return <></>;
  };

  return (
    <Flex.Col className={Css.height("calc(100vh - 80px)")}>
      {getView()}
    </Flex.Col>
  );
}
