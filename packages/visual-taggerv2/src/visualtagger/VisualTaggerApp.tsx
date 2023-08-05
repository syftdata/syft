import { useEffect, useRef, useCallback, useState } from "react";
import Recorder from "./recorder";

import {
  Action,
  ActionType,
  ClickAction,
  MessageType,
  RecordingMode,
} from "../types";
import Highlighters from "./Highlighters";
import { useGitInfoState } from "../cloud/state/gitinfo";
import {
  updateRecordingState,
  useRecordingState,
} from "../cloud/state/recordingstate";
import { buildBaseAction } from "./utils";

/**
 * This is the main component that sits in the web page and is responsible for
 * rendering the highlighters/markers and listening to user interactions.
 * @returns
 */
export default function VisualTaggerApp() {
  const recorderRef = useRef<Recorder | null>(null);
  const [recordingMode, setRecordingMode] = useState(RecordingMode.RECORDING);
  const { recordingState } = useRecordingState();
  const [gitInfoState] = useGitInfoState();

  const onPreviewClick = useCallback((action: Action, tagIndex: number) => {
    updateRecordingState((state) => ({
      ...state,
      previewAction: action,
      previewActionMatchedTagIndex: tagIndex,
    }));
  }, []);

  useEffect(() => {
    if (recordingState.mode !== recordingMode) {
      setRecordingMode(recordingState.mode);
    }
  }, [recordingState]);

  useEffect(() => {
    if (recordingMode === RecordingMode.RECORDING) {
      recorderRef.current = new Recorder();
      return () => {
        recorderRef.current?.deregister();
        recorderRef.current = null;
      };
    }
  }, [recordingMode]);

  if (!gitInfoState.info) {
    return <></>;
  }

  const gitInfo = gitInfoState?.modifiedInfo ?? gitInfoState?.info;
  if (recordingMode === RecordingMode.PREVIEW) {
    return (
      <Highlighters
        actions={gitInfo.eventTags}
        previewAction={recordingState.previewAction}
        onPreviewClick={onPreviewClick}
      />
    );
  }
  return <></>;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MessageType.MagicWand) {
    const possibleActions: ClickAction[] = [];
    document
      .querySelectorAll('[data-syft-has-handler="true"]')
      .forEach((el) => {
        // build a list of actions, event sources.
        possibleActions.push({
          ...buildBaseAction({
            target: el,
            timeStamp: Date.now(),
          }),
          type: ActionType.Click,
          offsetX: 0,
          offsetY: 0,
        });
      });
    sendResponse(possibleActions);
  }
});
