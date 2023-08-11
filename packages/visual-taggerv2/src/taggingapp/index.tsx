import { EventTag, ReactElement, VisualMode } from "../types";

import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import { useUserSession } from "../cloud/state/usersession";
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
import { getUniqueKey, mergeEventTags1 } from "./merge";
import ReactElementTree from "./ReactElementTree";
import TagDetailedView from "./TagDetailedView";
import { shallowEqual } from "../common/utils";

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

  const elements = recordingState.elements;
  const rootElement = elements[0] as ReactElement;
  const enrichedElements = mergeEventTags1(elements, gitInfo.eventTags);
  const schemas = gitInfo.eventSchema.events;

  const selectedIndex = Math.max(recordingState.selectedIndex ?? 0, 0);
  const selectedTag = enrichedElements[selectedIndex];
  const selectedElement = elements[selectedIndex];

  console.log(
    "selectedTag",
    selectedTag,
    selectedElement,
    selectedIndex,
    elements,
    enrichedElements
  );

  const onMagicWand = () => {
    // now wait for the reply.
    if (userSession == null) {
      return;
    }
    magicAPI(userSession, rootElement).then((g) => {
      dispatch({
        type: GitInfoActionType.FETCHED_MAGIC_CHANGES,
        data: g,
      });
      // startPreview();
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
        <IconButton icon="cursor" onClick={() => {}} />
        <IconButton icon="magic-wand" onClick={onMagicWand} />
        {recordingState.mode === VisualMode.ALL ? (
          <PrimaryIconButton icon="highlighter" onClick={stopPreview} />
        ) : (
          <IconButton icon="highlighter" onClick={startPreview} />
        )}
      </FlexExtra.RowWithDivider>
      {rootElement && (
        <ReactElementTree
          element={rootElement}
          selectedElement={selectedElement}
          onClick={(element) => {
            const idx = elements.findIndex(
              (t) => getUniqueKey(t) === getUniqueKey(element)
            );
            if (idx != -1) {
              updateRecordingState((state) => ({
                ...state,
                selectedIndex: idx,
              }));
            } else {
              console.log(">>> couldnt find the element ", element, elements);
            }
          }}
        />
      )}
      {selectedTag && (
        <TagDetailedView
          key={getUniqueKey(selectedTag)}
          tag={selectedTag}
          schemas={schemas}
          onMagicWand={onMagicWand}
          onAddSchema={(schema) => {
            dispatch({
              type: GitInfoActionType.UPDATE_EVENT_SCHEMA,
              data: [...gitInfo.eventSchema.events, schema],
            });
          }}
          onUpdateTag={(action) => {
            onUpdateTag(selectedIndex, action);
          }}
        />
      )}
    </Flex.Col>
  );
}
