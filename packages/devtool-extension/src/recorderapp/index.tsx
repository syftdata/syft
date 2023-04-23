import { useState, useEffect } from "react";
import { cx } from "@emotion/css";

import { usePreferredLibrary, usePreferredBarPosition } from "../common/hooks";

import { Action, MessageType } from "../types";
import { ScriptType } from "../types";

import { endRecording } from "../common/endRecording";
import { Css } from "../common/styles/common.styles";
import { RecordDoneHeader, RecordingHeader } from "./ControlBarHeaders";
import RecordScriptView from "./RecordScriptView";
import Card from "../common/core/Card";

export default function RecorderApp({ actions }: { actions: Action[] }) {
  const [_scriptType, setScriptType] = usePreferredLibrary();
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const onEndRecording = () => {
    // TODO: Fire an event.
  };

  const onInsertEvent = () => {
    // show UI to select an event and its props.
    // assume that it happened.
  };

  const scriptType = _scriptType ?? ScriptType.Playwright;

  return (
    <>
      <Card
        gap={8}
        className={cx(
          Css.position("fixed!important"),
          Css.zIndex(2147483647),
          Css.width(650),
          Css.margin("auto"),
          Css.left(0),
          Css.right(0),
          Css.padding(10)
        )}
      >
        {isFinished ? (
          <RecordDoneHeader />
        ) : (
          <RecordingHeader
            onEndRecording={onEndRecording}
            onInsertEvent={onInsertEvent}
          />
        )}
        <RecordScriptView
          actions={actions}
          scriptType={scriptType}
          setScriptType={setScriptType}
        />
      </Card>
    </>
  );
}
