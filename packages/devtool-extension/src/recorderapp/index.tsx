import { useState } from "react";
import { useLoginSessionState, usePreferredLibrary } from "../common/hooks";

import { Action } from "../types";
import { ScriptType } from "../types";

import RecordScriptView from "./RecordedScriptView";
import {
  PrimaryIconButton,
  SecondaryIconButton,
} from "../common/components/core/Button";
import { Flex } from "../common/styles/common.styles";
import ActionList from "./ActionList";
import { genJson } from "../builders";
import { downloadFile, initiateLoginFlow, saveFile } from "../common/utils";

function downloadScript(actions: Action[], scriptType: ScriptType): void {
  const code = genJson(actions);
  downloadFile(`syft_test.${scriptType}.js`, code);
}

async function saveScript(
  actions: Action[],
  scriptType: ScriptType
): Promise<void> {
  const code = genJson(actions);
  await saveFile(`syft_test.${scriptType}.js`, code);
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
  const [loginSession] = useLoginSessionState();
  const [_scriptType, setScriptType] = usePreferredLibrary();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  // const [recordingTabId, _actions] = useRecordingState();
  // console.log(">>>>> recordingTabId", recordingTabId, _actions);

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
      <Flex.Col>
        <Flex.RowWithDivider>
          <PrimaryIconButton
            label="Stop Recording"
            icon="video-camera-off"
            onClick={onStopRecording}
          />
        </Flex.RowWithDivider>
        <ActionList actions={actions} onUpdateAction={onUpdateAction} />
      </Flex.Col>
    );
  };

  const getFreshView = () => {
    return (
      <Flex.Col>
        <Flex.RowWithDivider>
          <PrimaryIconButton
            onClick={onStartRecording}
            icon="video-camera"
            label="Start Recording"
          />
        </Flex.RowWithDivider>
        <ActionList actions={[]} />
      </Flex.Col>
    );
  };

  const getRecordOverView = () => {
    return (
      <Flex.Col>
        <Flex.RowWithDivider gap={4} justifyContent="space-between">
          <SecondaryIconButton
            onClick={onStartRecording}
            icon="video-camera"
            label="Start new Recording"
          />
          <Flex.Row gap={4}>
            {/* <SecondaryIconButton
              onClick={() => {
                downloadScript(actions, scriptType);
              }}
              icon="arrow-down"
              label="Download"
            /> */}
            <PrimaryIconButton
              onClick={() => saveScript(actions, scriptType)}
              icon="floppy-disc"
              label="Commit"
            />
          </Flex.Row>
        </Flex.RowWithDivider>
        <RecordScriptView
          actions={actions}
          scriptType={scriptType}
          setScriptType={setScriptType}
        />
      </Flex.Col>
    );
  };

  const getLoginView = () => {
    return <PrimaryIconButton label="Login" onClick={initiateLoginFlow} />;
  };
  return (
    <>
      {!loginSession
        ? getLoginView()
        : isRecording
        ? getRecordingView()
        : isFinished
        ? getRecordOverView()
        : getFreshView()}
    </>
  );
}
