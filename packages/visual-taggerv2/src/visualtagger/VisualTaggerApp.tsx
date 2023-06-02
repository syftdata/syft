import { useState, useEffect, useRef } from "react";
import Recorder from "./recorder";

import { Action, MessageType } from "../types";
import Highlighters from "./Highlighters";

export default function VisualTaggerApp() {
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [actions, setActions] = useState<Action[]>([]);
  const recorderRef = useRef<Recorder | null>(null);

  const onEndRecording = () => {
    setIsFinished(true);
    // Turn off recorder
    recorderRef.current?.deregister();
  };

  useEffect(() => {
    if (recorderRef.current != null) {
      // only inject once.
      return;
    }

    recorderRef.current = new Recorder({
      onAction: (actions: Action[]) => {
        window.postMessage({
          type: MessageType.GetSourceFile,
        });
        chrome.runtime.sendMessage({
          type: MessageType.RecordedStep,
          data: actions,
        });
      },
    });
    console.debug("[Syft][Content] Injecting the recorder listeners");

    // Set recording to be finished if somewhere else (ex. popup) the state has been set to be finished
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.recording != null) {
        if (
          changes.recording.newValue.recordingState === "finished" &&
          changes.recording.newValue.recordingState !==
            changes.recording.oldValue.recordingState
        ) {
          if (!isFinished) {
            onEndRecording();
          }
        }
        if (
          changes.recording.newValue.recording !==
          changes.recording.oldValue.recording
        ) {
          setActions(changes.recording.newValue.recording);
        }
      }
    });
  }, []);

  if (isFinished) {
    return <></>;
  }

  const taggedActions = actions.filter(
    (action) => action.events && action.events.length > 0
  );
  return <Highlighters actions={taggedActions} />;
}
