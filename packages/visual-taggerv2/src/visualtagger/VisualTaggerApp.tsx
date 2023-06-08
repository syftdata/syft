import { useState, useEffect, useRef, useCallback } from "react";
import Recorder from "./recorder";

import { Action, MessageType, RecordingMode } from "../types";
import Highlighters from "./Highlighters";
import { GIT_INFO_STATE_KEY, getGitInfoState } from "../cloud/state/gitinfo";
import { RECORDING_STORAGE_KEY } from "../cloud/state/recordingstate";
import { getReactSourceFileForElement } from "./utils";

export default function VisualTaggerApp() {
  const [eventTags, setEventTags] = useState<Action[]>([]);
  const recorderRef = useRef<Recorder | null>(null);
  const [recordingMode, setRecordingMode] = useState(RecordingMode.RECORDING);

  const storageListener = useCallback(
    (changes: { [key: string]: chrome.storage.StorageChange }) => {
      console.log("[Syft][Content] storage changed ", changes);
      if (changes[GIT_INFO_STATE_KEY] != null) {
        const gitInfo = changes[GIT_INFO_STATE_KEY];
        if (gitInfo.newValue?.modifiedInfo !== gitInfo.oldValue?.modifiedInfo) {
          setEventTags(gitInfo.newValue?.modifiedInfo?.eventTags ?? []);
        }
      }

      if (changes[RECORDING_STORAGE_KEY] != null) {
        const recording = changes[RECORDING_STORAGE_KEY];
        if (recording.newValue?.mode !== recording.oldValue?.mode) {
          setRecordingMode(recording.newValue?.mode ?? RecordingMode.NONE);
        }
      }
    },
    []
  );
  const onActionCreated = useCallback((actions: Action[]) => {
    if (!recorderRef.current) return;
    window.postMessage({
      type: MessageType.GetSourceFile,
    });
    chrome.runtime.sendMessage({
      type: MessageType.RecordedActions,
      data: actions,
    });
  }, []);

  const onPreviewClick = useCallback((action: Action) => {
    console.log(
      ">>> preview clicked in content ",
      action,
      MessageType.PreviewClicked
    );
    chrome.runtime.sendMessage({
      type: MessageType.PreviewClicked,
      data: action,
    });
  }, []);

  useEffect(() => {
    getGitInfoState().then((state) => {
      if (state?.modifiedInfo) {
        setEventTags(state?.modifiedInfo.eventTags);
      }
    });
    // Set recording to be finished if somewhere else (ex. popup) the state has been set to be finished
    chrome.storage.onChanged.addListener(storageListener);
    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  useEffect(() => {
    if (recordingMode === RecordingMode.RECORDING) {
      recorderRef.current = new Recorder({
        onAction: onActionCreated,
      });
      return () => {
        recorderRef.current?.deregister();
        recorderRef.current = null;
        onActionCreated([]);
      };
    }
  }, [recordingMode]);

  if (recordingMode === RecordingMode.PREVIEW) {
    return <Highlighters actions={eventTags} onPreviewClick={onPreviewClick} />;
  }
  return <></>;
}
