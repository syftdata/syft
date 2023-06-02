import { useState } from "react";
import { Action, Event } from "../types";

import RecordScriptView from "./RecordScriptView";
import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import LoginView from "../cloud/views/LoginView";
import { useUserSession } from "../cloud/state/usersession";
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
  const onMagicWand = () => {
    // TODO: create schemas and generate actions with events.
    const schemas: Event[] = [
      {
        id: "TodoAdded",
        name: "TodoAdded",
        description: "Wow",
        fields: [],
      },
    ];
  };

  const getRecordingView = () => {
    return (
      <>
        <FlexExtra.RowWithDivider>
          <PrimaryIconButton icon="highlighter" onClick={onStopRecording} />
        </FlexExtra.RowWithDivider>
        <ActionsEditor actions={actions} onUpdateAction={onUpdateAction} />
      </>
    );
  };

  const getHomeView = () => {
    return (
      <>
        <FlexExtra.RowWithDivider gap={8}>
          <IconButton icon="highlighter" onClick={onStartRecording} />
          <IconButton icon="magic-wand" onClick={onMagicWand} />
        </FlexExtra.RowWithDivider>
        <ActionsEditor actions={actions} />
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
        onClose={() => {
          setRecording((r) => ({ ...r, state: RecordingState.Stopped }));
        }}
      />
    );
  };

  const getView = () => {
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
