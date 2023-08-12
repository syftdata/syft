import { useEffect, useRef, useCallback } from "react";
import Recorder from "./recorder";

import { ReactElement } from "../types";
import Highlighters from "./Highlighters";
import {
  updateRecordingState,
  useRecordingState,
} from "../cloud/state/recordingstate";
import { useSimpleGitInfoState } from "../cloud/state/gitinfo";
import { enrichElementsWithTags } from "../taggingapp/merge";

/**
 * This is the main component that sits in the web page and is responsible for
 * rendering the highlighters/markers and listening to user interactions.
 * @returns
 */
export default function VisualTaggerApp() {
  const recorderRef = useRef<Recorder | null>(null);
  const { recordingState } = useRecordingState();

  const onHighlightClick = useCallback((idx: number, element: ReactElement) => {
    console.log(">>> onHighlightClick ", idx);
    updateRecordingState((state) => ({
      ...state,
      selectedIndex: idx,
    }));
  }, []);

  useEffect(() => {
    recorderRef.current = new Recorder();
    return () => {
      recorderRef.current?.deregister();
      recorderRef.current = null;
    };
  }, []);

  const gitInfoState = useSimpleGitInfoState();
  const gitInfo = gitInfoState.modifiedInfo ?? gitInfoState.info;
  if (!gitInfo) {
    return null;
  }

  const elements = recordingState.elements;
  enrichElementsWithTags(elements, gitInfo.eventTags);
  let selectedIndex = recordingState.selectedIndex;
  if (selectedIndex != null) {
    selectedIndex = selectedIndex < elements.length ? selectedIndex : 0;
  }

  return (
    <Highlighters
      elements={elements}
      mode={recordingState.mode}
      selectedIndex={selectedIndex}
      onClick={onHighlightClick}
    />
  );
}
