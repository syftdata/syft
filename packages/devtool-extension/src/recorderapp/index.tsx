import { useState } from "react";
import { usePreferredLibrary } from "../common/hooks";

import { Action } from "../types";
import { ScriptType } from "../types";

import RecordScriptView from "./RecordedScriptView";
import { PrimaryIconButton } from "../common/components/core/Button/IconButton";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import ActionList from "./ActionList";
import LoginView from "../cloud/views/LoginView";
import { useUserSession } from "../cloud/state/usersession";
import GitFileList from "../cloud/views/GitFileList";

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
  const [userSession] = useUserSession();
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
        <GitFileList />
        <ActionList actions={[]} />
      </>
    );
  };

  const getRecordOverView = () => {
    return (
      <RecordScriptView
        actions={actions}
        userSession={userSession!}
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

  return (
    <Flex.Col className={Css.height("calc(100vh - 80px)")}>
      {!userSession ? (
        <LoginView />
      ) : isRecording ? (
        getRecordingView()
      ) : isFinished ? (
        getRecordOverView()
      ) : (
        getFreshView()
      )}
    </Flex.Col>
  );
}
