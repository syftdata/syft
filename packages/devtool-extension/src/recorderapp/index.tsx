import { useState } from "react";
import { usePreferredLibrary } from "../common/hooks";

import { Action } from "../types";
import { ScriptType } from "../types";

import RecordScriptView from "./RecordedScriptView";
import {
  PrimaryIconButton,
  SecondaryIconButton,
} from "../common/components/core/Button";
import { Flex } from "../common/styles/common.styles";
import ActionList from "./ActionList";
import { genCode } from "../builders";

function downloadScript(actions: Action[], scriptType: ScriptType): void {
  // write code to show download dialog for a text.
  const code = genCode(actions, true, scriptType);
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.setProperty("display", "none");
  a.href = url;
  a.download = `syft_test.${scriptType}.js`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

export default function RecorderApp({
  startRecording,
  endRecording,
  onUpdateAction,
  actions,
}: {
  actions: Action[];
  startRecording: () => void;
  endRecording: () => void;
  onUpdateAction: (index: number, action?: Action) => void;
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

  const getRecordingView = () => {
    return (
      <>
        <PrimaryIconButton
          label="Stop Recording"
          icon="video-camera-off"
          onClick={onStopRecording}
        />
        <ActionList actions={actions} onUpdateAction={onUpdateAction} />
      </>
    );
  };

  const getFreshView = () => {
    return (
      <>
        <PrimaryIconButton
          onClick={onStartRecording}
          icon="video-camera"
          label="Start Recording"
        />
        <ActionList actions={[]} />
      </>
    );
  };

  const getRecordOverView = () => {
    return (
      <>
        <Flex.Row gap={4} justifyContent="space-between">
          <SecondaryIconButton
            onClick={onStartRecording}
            icon="video-camera"
            label="Start new Recording"
          />
          <PrimaryIconButton
            onClick={() => {
              downloadScript(actions, scriptType);
            }}
            icon="arrow-down"
            label="Download Script"
          />
        </Flex.Row>
        <RecordScriptView
          actions={actions}
          scriptType={scriptType}
          setScriptType={setScriptType}
        />
      </>
    );
  };
  return (
    <>
      <Flex.Col>
        {isRecording
          ? getRecordingView()
          : isFinished
          ? getRecordOverView()
          : getFreshView()}
      </Flex.Col>
    </>
  );
}
