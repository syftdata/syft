import { useState } from "react";
import { useLoginSessionState, usePreferredLibrary } from "../common/hooks";

import { Action, LoginResponse } from "../types";
import { ScriptType } from "../types";

import RecordScriptView from "./RecordedScriptView";
import {
  IconButton,
  PrimaryIconButton,
  SecondaryIconButton,
} from "../common/components/core/Button/IconButton";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import ActionList from "./ActionList";
import { genJson } from "../builders";
import { downloadFile, initiateLoginFlow, saveFile } from "../common/utils";
import { Mono } from "../common/styles/fonts";
import GitInfo from "../cloud/gitinfo";
import { css } from "@emotion/css";

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
      <>
        <FlexExtra.RowWithDivider>
          <PrimaryIconButton
            label="Stop Recording"
            icon="video-camera-off"
            onClick={onStopRecording}
          />
        </FlexExtra.RowWithDivider>
        <ActionList actions={actions} onUpdateAction={onUpdateAction} />
      </>
    );
  };

  const getFreshView = () => {
    return (
      <>
        <FlexExtra.RowWithDivider>
          <PrimaryIconButton
            onClick={onStartRecording}
            icon="video-camera"
            label="Start Recording"
          />
        </FlexExtra.RowWithDivider>
        <GitInfo loginResponse={loginSession} />
        <ActionList actions={[]} />
      </>
    );
  };

  const getRecordOverView = () => {
    return (
      <RecordScriptView
        actions={actions}
        scriptType={scriptType}
        setScriptType={setScriptType}
        scriptTitle={scriptTitle}
        setScriptTitle={setScriptTitle}
        onClose={() => {
          setIsFinished(false);
          setIsRecording(false);
        }}
      />
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
    <Flex.Col className={Css.height("calc(100vh - 40px)")}>
      {!loginSession
        ? getLoginView()
        : isRecording
        ? getRecordingView()
        : isFinished
        ? getRecordOverView()
        : getFreshView()}
    </Flex.Col>
  );
}
