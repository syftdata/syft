import { useEffect, useRef, useCallback, useState } from "react";
import Recorder from "./recorder";

import { Action, RecordingMode } from "../types";
import Highlighters from "./Highlighters";
import { useGitInfoState } from "../cloud/state/gitinfo";
import {
  updateRecordingState,
  useRecordingState,
} from "../cloud/state/recordingstate";
import { shallowEqual } from "../common/utils";

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
