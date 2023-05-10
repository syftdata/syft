import { useState } from "react";
import { usePreferredLibrary } from "../common/hooks";

import { Action } from "../types";
import { ScriptType } from "../types";

import RecordScriptView from "./RecordScriptView";
import { PrimaryIconButton } from "../common/components/core/Button/IconButton";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import ActionList from "./ActionList";
import LoginView from "../cloud/views/LoginView";
import { useUserSession } from "../cloud/state/usersession";
import GitFileList from "../cloud/views/GitFileList";
import RecordPreviewView from "./RecordPreviewView";
import ActionsEditor from "./ActionsEditor";
import { Step } from "@puppeteer/replay";

export interface RecorderAppProps {
  actions: Action[];
  startRecording: () => void;
  endRecording: () => void;
  onUpdateAction: (index: number, action?: Action) => void;
}

enum RecordingState {
  Fresh,
  Recording,
  Finished,
}

export default function RecorderApp({
  startRecording,
  endRecording,
  onUpdateAction,
  actions,
}: RecorderAppProps) {
  const [userSession] = useUserSession();
  const [_scriptType, setScriptType] = usePreferredLibrary();
  const [recording, setRecording] = useState({
    title: "",
    state: RecordingState.Fresh,
  });
  const [preview, setPreview] = useState({
    title: "",
    isRunning: false,
    steps: [] as Step[],
  });

  if (!userSession) {
    return (
      <Flex.Col className={Css.height("calc(100vh - 80px)")}>
        <LoginView />
      </Flex.Col>
    );
  }

  const onStartRecording = () => {
    startRecording();
    setRecording((r) => ({
      ...r,
      state: RecordingState.Recording,
      title: `Test Spec - ${new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })}`,
    }));
  };
  const onStopRecording = () => {
    endRecording();
    setRecording((r) => ({ ...r, state: RecordingState.Finished }));
  };

  const onPreview = (title: string, steps: Step[]) => {
    setPreview((p) => ({ ...p, title, steps, isRunning: true }));
  };

  const onStopPreview = () => {
    setPreview((p) => ({ ...p, isRunning: false }));
  };

  const scriptType = _scriptType ?? ScriptType.Playwright;

  const getPreviewView = () => {
    return (
      <RecordPreviewView
        key="preview"
        steps={preview.steps}
        scriptTitle={preview.title}
        startPlaying={true}
        onClose={onStopPreview}
      />
    );
  };

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
        <ActionsEditor actions={actions} onUpdateAction={onUpdateAction} />
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
        <GitFileList
          onPreview={(file) => {
            if (file.content) {
              onPreview(file.name, JSON.parse(file.content).steps);
            }
          }}
        />
        <ActionsEditor actions={[]} />
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
        scriptTitle={recording.title}
        setScriptTitle={(title) => {
          setRecording((r) => ({ ...r, title }));
        }}
        onPreview={(title, steps) => {
          onPreview(title, steps);
        }}
        onClose={() => {
          setRecording((r) => ({ ...r, state: RecordingState.Fresh }));
        }}
      />
    );
  };

  const getView = () => {
    if (preview.isRunning) {
      return getPreviewView();
    }
    switch (recording.state) {
      case RecordingState.Fresh:
        return getFreshView();
      case RecordingState.Recording:
        return getRecordingView();
      case RecordingState.Finished:
        return getRecordOverView();
    }
  };

  const state = recording.state;
  return (
    <Flex.Col className={Css.height("calc(100vh - 80px)")}>
      {getView()}
    </Flex.Col>
  );
}
