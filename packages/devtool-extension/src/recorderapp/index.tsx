import { useState } from "react";
import { useLoginSessionState, usePreferredLibrary } from "../common/hooks";

import { Action, LoginResponse } from "../types";
import { ScriptType } from "../types";

import RecordScriptView from "./RecordedScriptView";
import {
  IconButton,
  PrimaryIconButton,
  SecondaryIconButton,
} from "../common/components/core/Button";
import { Css, Flex } from "../common/styles/common.styles";
import ActionList from "./ActionList";
import { genJson } from "../builders";
import { downloadFile, initiateLoginFlow, saveFile } from "../common/utils";
import { Mono } from "../common/styles/fonts";
import GitInfo from "../cloud/gitinfo";

export interface RecorderAppProps {
  actions: Action[];
  startRecording: () => void;
  endRecording: () => void;
  onUpdateAction: (index: number, action?: Action) => void;
}

export default function RecorderApp({
  startRecording,
  endRecording,
  onUpdateAction,
  actions,
}: RecorderAppProps) {
  const [loginSession] = useLoginSessionState();
  const [_scriptType, setScriptType] = usePreferredLibrary();
  const [scriptTitle, setScriptTitle] = useState(`syft_test_todo_app_may_2nd`);
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
        {/* <GitInfo loginResponse={loginSession} /> */}
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
                const code = genJson(actions);
                downloadFile(`${scriptTitle}.json`, code);
              }}
              icon="arrow-down"
              label="Download"
            /> */}
            <PrimaryIconButton
              onClick={async () => {
                const code = genJson(actions);
                await saveFile(`${scriptTitle}.json`, code);
              }}
              icon="floppy-disc"
              label="Commit"
            />
            <IconButton
              onClick={() => {
                setIsFinished(false);
                setIsRecording(false);
              }}
              icon="close"
            />
          </Flex.Row>
        </Flex.RowWithDivider>
        <RecordScriptView
          actions={actions}
          scriptType={scriptType}
          setScriptType={setScriptType}
          scriptTitle={scriptTitle}
          setScriptTitle={setScriptTitle}
        />
      </Flex.Col>
    );
  };

  const getLoginView = () => {
    return (
      <Flex.Col alignItems="center" className={Css.margin("36px 0px")}>
        <PrimaryIconButton label="Login" onClick={initiateLoginFlow} />
        <Mono.M14>
          Login gives you ability to save recordings to your account.
        </Mono.M14>
      </Flex.Col>
    );
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
