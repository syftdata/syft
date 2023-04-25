import { useState } from "react";
import { Css, Flex } from "../common/styles/common.styles";
import { Action, ActionsMode, ScriptType } from "../types";
import ScriptTypeSelect from "../common/ScriptTypeSelect";
import CodeGen from "./CodeGen";
import ActionList from "./ActionList";
import { cx } from "@emotion/css";
import { genCode } from "../builders";
import { IconButton } from "../common/components/core/Button";

interface RecordScriptViewProps {
  actions: Action[];
  scriptType: ScriptType;
  setScriptType: (scriptType: ScriptType) => void;
  className?: string;
}

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

export default function RecordScriptView({
  actions,
  scriptType,
  setScriptType,
  className,
}: RecordScriptViewProps) {
  const [actionsMode, setActionsMode] = useState<ActionsMode>(ActionsMode.Code);

  return (
    <Flex.Col className={cx(Css.width("100%"), className)}>
      <Flex.Row alignItems="center">
        <Flex.Row className={Flex.grow(1)}>
          {actionsMode === ActionsMode.Actions ? (
            <IconButton
              onClick={() => setActionsMode(ActionsMode.Code)}
              label="Show Code"
            />
          ) : (
            <IconButton
              onClick={() => setActionsMode(ActionsMode.Actions)}
              label="Show Actions"
            />
          )}
        </Flex.Row>
        {actionsMode === ActionsMode.Code && (
          <Flex.Row justifyContent="end" gap={6}>
            <ScriptTypeSelect
              value={scriptType}
              onChange={setScriptType}
              shortDescription={true}
            />
            <IconButton
              onClick={() => {
                downloadScript(actions, scriptType);
              }}
              label="Download"
              icon="arrow-down"
              reverseIcon={true}
            />
          </Flex.Row>
        )}
      </Flex.Row>
      <Flex.Col
        className={cx(
          Css.minHeight(240),
          Css.height("50vh"),
          Css.overflow("scroll")
        )}
      >
        {actionsMode === ActionsMode.Code && (
          <CodeGen actions={actions} library={scriptType} />
        )}
        {actionsMode === ActionsMode.Actions && (
          <ActionList actions={actions} />
        )}
      </Flex.Col>
    </Flex.Col>
  );
}
