import { useEffect, useRef, useCallback } from "react";
import Recorder from "./recorder";

import { ReactElement, VisualMode } from "../types";
import Highlighters from "./Highlighters";
import {
  updateRecordingState,
  useRecordingState,
} from "../cloud/state/recordingstate";

/**
 * This is the main component that sits in the web page and is responsible for
 * rendering the highlighters/markers and listening to user interactions.
 * @returns
 */
export default function VisualTaggerApp() {
  const recorderRef = useRef<Recorder | null>(null);
  const { recordingState } = useRecordingState();

  const onHighlightClick = useCallback((idx: number, element: ReactElement) => {
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

  const elements = recordingState.elements;
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
