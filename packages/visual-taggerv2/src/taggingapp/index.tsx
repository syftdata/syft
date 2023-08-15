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
import { GitInfoActionType, LoadingState } from "../cloud/state/types";
import {
  updateRecordingState,
  useRecordingState,
} from "../cloud/state/recordingstate";
import { getUniqueKey, enrichElementsWithTags } from "./merge";
import ReactElementTree from "./ReactElementTree";
import TagDetailedView from "./TagDetailedView";

export interface TaggingAppProps {
  setVisualMode: (mode: VisualMode) => void;
}

export default function TaggingApp({ setVisualMode }: TaggingAppProps) {
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
          <Spinner center={true} />
        </Flex.Row>
      </Flex.Col>
    );
  }

  const isLoading = gitInfoState.state === LoadingState.LOADING;
  const elements = recordingState.elements;
  enrichElementsWithTags(elements, gitInfo.eventTags);
  const rootElement = elements[0] as ReactElement;
  const schemas = gitInfo.eventSchema.events;

  const selectedIndex = Math.max(recordingState.selectedIndex ?? 0, 0);
  const selectedTag = elements[selectedIndex];
  const selectedElement = elements[selectedIndex];

  const onMagicWand = () => {
    if (userSession == null) {
      return;
    }
    dispatch({
      type: GitInfoActionType.FETCH_MAGIC_CHANGES,
    });
    magicAPI(userSession, rootElement).then((g) => {
      dispatch({
        type: GitInfoActionType.FETCHED_MAGIC_CHANGES,
        data: g,
      });
      setVisualMode(VisualMode.ALL);
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
        {recordingState.mode === VisualMode.INSPECT ? (
          <PrimaryIconButton
            icon="cursor"
            onClick={() => {
              setVisualMode(VisualMode.SELECTED);
            }}
          />
        ) : (
          <IconButton
            icon="cursor"
            onClick={() => {
              setVisualMode(VisualMode.INSPECT);
            }}
          />
        )}
        {recordingState.mode === VisualMode.ALL ? (
          <PrimaryIconButton
            icon="highlighter"
            onClick={() => {
              setVisualMode(VisualMode.SELECTED);
            }}
          />
        ) : (
          <IconButton
            icon="highlighter"
            onClick={() => {
              setVisualMode(VisualMode.ALL);
            }}
          />
        )}
        <div className={Flex.grow(1)}>
          {isLoading && (
            <Flex.Row gap={8} alignItems="center">
              <Spinner />
              Analyzing...
            </Flex.Row>
          )}
        </div>
        <IconButton icon="magic-wand" onClick={onMagicWand} />
      </FlexExtra.RowWithDivider>
      {rootElement && (
        <ReactElementTree
          rootElement={rootElement}
          elements={elements}
          selectedElement={selectedElement}
          onClick={(element) => {
            const idx = elements.findIndex((t) => t === element);
            if (idx != -1) {
              updateRecordingState((state) => ({
                ...state,
                selectedIndex: idx,
              }));
            } else {
              // if nothing is selected or found, select the top element.
              updateRecordingState((state) => ({
                ...state,
                selectedIndex: 0,
              }));
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
          onUpdateSchema={(schema) => {
            const newSchemas = [...gitInfo.eventSchema.events];
            const idx = newSchemas.findIndex((s) => s.name === schema.name);
            if (idx != -1) {
              newSchemas.splice(idx, 1, schema);
              dispatch({
                type: GitInfoActionType.UPDATE_EVENT_SCHEMA,
                data: newSchemas,
              });
            }
          }}
          onUpdateTag={(action) => {
            onUpdateTag(selectedIndex, action);
          }}
        />
      )}
    </Flex.Col>
  );
}
