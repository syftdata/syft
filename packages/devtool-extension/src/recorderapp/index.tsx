import { useState } from "react";
import { usePreferredLibrary } from "../common/hooks";

import { Action } from "../types";
import { ScriptType } from "../types";

import RecordScriptView from "./RecordedScriptView";
import Card from "../common/components/core/Card";
import { IconButton } from "../common/components/core/Button";
import { Subheading } from "../common/styles/fonts";
import { Flex } from "../common/styles/common.styles";
import ActionList from "./ActionList";

export default function RecorderApp({
  startRecording,
  endRecording,
  addEvent,
  actions,
}: {
  actions: Action[];
  startRecording: () => void;
  endRecording: () => void;
  addEvent: (action: Action) => void;
}) {
  const [_scriptType, setScriptType] = usePreferredLibrary();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const onStartRecording = () => {
    startRecording();
    setIsRecording(true);
    setIsFinished(false);
  };
  const onStopRecording = () => {
    endRecording();
    setIsRecording(false);
    setIsFinished(true);
  };

  const scriptType = _scriptType ?? ScriptType.Playwright;

  return (
    <>
      <Card gap={8}>
        {!isRecording ? (
          <IconButton
            onClick={onStartRecording}
            icon="video-camera"
            label="Start Recording"
          />
        ) : (
          <IconButton
            label="Stop Recording"
            icon="video-camera-off"
            onClick={onStopRecording}
          />
        )}
        {isRecording && <ActionList actions={actions} onAddEvent={addEvent} />}
        {isFinished && (
          <Flex.Col alignItems="center" gap={8}>
            <Subheading.SH14>Recording Finished!</Subheading.SH14>
            <RecordScriptView
              actions={actions}
              scriptType={scriptType}
              setScriptType={setScriptType}
            />
          </Flex.Col>
        )}
      </Card>
    </>
  );
}
