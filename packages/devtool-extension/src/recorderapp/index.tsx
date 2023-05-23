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
import { genPuppeteerSteps } from "../builders";
import { useGitInfo } from "../cloud/state/gitinfo";
import { Subheading } from "../common/styles/fonts";
import { css } from "@emotion/css";
import Spinner from "../common/components/core/Spinner/Spinner";

export interface RecorderAppProps {
  actions: Action[];
  startRecording: () => void;
  endRecording: () => void;
  onUpdateAction: (index: number, action?: Action) => void;
}

enum RecordingState {
  Stopped,
  Recording,
  Editing,
}

export default function RecorderApp({
  startRecording,
  endRecording,
  onUpdateAction,
  actions,
}: RecorderAppProps) {
  const [userSession] = useUserSession();
  const [gitInfo] = useGitInfo();
  const [recording, setRecording] = useState({
    title: "",
    script: "",
    sha: undefined as string | undefined,
    state: RecordingState.Stopped,
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

  if (!gitInfo) {
    return (
      <Flex.Col
        gap={24}
        alignItems="center"
        className={css(Css.padding("24px 10px"), Flex.grow(1))}
      >
        <Subheading.SH12>
          Connecting to your Syft Studio workspace..
        </Subheading.SH12>
        <Flex.Row>
          <Spinner />
        </Flex.Row>
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
    setRecording((r) => ({
      ...r,
      script: JSON.stringify(genPuppeteerSteps(actions), null, 2),
      state: RecordingState.Editing,
    }));
  };

  const onPreview = (title: string, steps: Step[]) => {
    setPreview((p) => ({ ...p, title, steps, isRunning: true }));
  };

  const onStopPreview = () => {
    setPreview((p) => ({ ...p, isRunning: false }));
  };

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

  const getHomeView = () => {
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
          onEdit={(efile) => {
            if (efile.content != null) {
              setRecording((r) => ({
                ...r,
                title: efile.name,
                sha: efile.sha,
                script: JSON.stringify(
                  JSON.parse(efile.content!).steps,
                  null,
                  2
                ),
                state: RecordingState.Editing,
              }));
            }
          }}
        />
        <ActionsEditor actions={[]} />
      </>
    );
  };

  const getRecordEditorView = () => {
    return (
      <RecordScriptView
        script={recording.script}
        sha={recording.sha}
        setScript={(script) => {
          setRecording((r) => ({ ...r, script }));
        }}
        userSession={userSession!}
        scriptTitle={recording.title}
        setScriptTitle={(title) => {
          setRecording((r) => ({ ...r, title }));
        }}
        onPreview={() => {
          onPreview(recording.title, JSON.parse(recording.script));
        }}
        onClose={() => {
          setRecording((r) => ({ ...r, state: RecordingState.Stopped }));
        }}
      />
    );
  };

  const getView = () => {
    if (preview.isRunning) {
      return getPreviewView();
    }
    switch (recording.state) {
      case RecordingState.Stopped:
        return getHomeView();
      case RecordingState.Recording:
        return getRecordingView();
      case RecordingState.Editing:
        return getRecordEditorView();
    }
  };

  const state = recording.state;
  return (
    <Flex.Col className={Css.height("calc(100vh - 80px)")}>
      {getView()}
    </Flex.Col>
  );
}
