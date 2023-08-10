import { EventTag, ReactElement, VisualMode } from "../types";

import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import { useUserSession } from "../cloud/state/usersession";
import EventTagsEditor from "./EventTagsEditor";
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
import { mergeEventTags1 } from "./merge";

export interface TaggingAppProps {
  startPreview: () => void;
  stopPreview: () => void;
}

export default function TaggingApp({
  startPreview,
  stopPreview,
}: TaggingAppProps) {
  const [userSession] = useUserSession();
  const { gitInfoState, dispatch } = useGitInfoContext();
  const { recordingState } = useRecordingState();

  if (!userSession) {
    return <></>;
  }

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

  const enrichedElements = mergeEventTags1(
    recordingState.elements,
    gitInfo.eventTags
  );
  const schemas = gitInfo.eventSchema.events;

  const onMagicWand = () => {
    // now wait for the reply.
    if (userSession == null) {
      return;
    }
    magicAPI(userSession, enrichedElements).then((g) => {
      dispatch({
        type: GitInfoActionType.FETCHED_MAGIC_CHANGES,
        data: g,
      });
      startPreview();
    });
  };

  const onUpdateTag = (index: number, action?: EventTag) => {
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
  return (
    <Flex.Col className={Css.height("calc(100vh - 80px)")}>
      <FlexExtra.RowWithDivider gap={16} className={Css.padding(8)}>
        {recordingState.mode === VisualMode.ALL ? (
          <PrimaryIconButton icon="highlighter" onClick={stopPreview} />
        ) : (
          <IconButton icon="highlighter" onClick={startPreview} />
        )}
        <IconButton icon="magic-wand" onClick={onMagicWand} />
      </FlexExtra.RowWithDivider>
      <EventTagsEditor
        tags={enrichedElements}
        schemas={schemas}
        selectedIndex={recordingState.selectedIndex ?? 0}
        onUpdateTag={onUpdateTag}
        onSelectTag={(index, tag) => {
          updateRecordingState((state) => ({
            ...state,
            selectedIndex: index,
          }));
        }}
      />
    </Flex.Col>
  );
}
