import { useState } from "react";
import { Css, Flex } from "../common/styles/common.styles";
import { Action, ActionsMode, ScriptType } from "../types";
import ScriptTypeSelect from "../common/ScriptTypeSelect";
import CopyToClipboard from "react-copy-to-clipboard";
import CodeGen from "./CodeGen";
import ActionList from "./ActionList";
import { cx } from "@emotion/css";
import { genCode } from "../builders";
import { IconButton } from "../common/core/Button";
import { Colors } from "../common/styles/colors";
import Card from "../common/core/Card";
interface RecordScriptViewProps {
  actions: Action[];
  scriptType: ScriptType;
  setScriptType: (scriptType: ScriptType) => void;
  header?: React.ReactNode;
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
  header,
  scriptType,
  setScriptType,
  className,
}: RecordScriptViewProps) {
  const [actionsMode, setActionsMode] = useState<ActionsMode>(ActionsMode.Code);
  const [copyCodeConfirm, setCopyCodeConfirm] = useState<boolean>(false);

  return (
    <Flex.Col className={className}>
      {header}
      <Flex.Row justifyContent="space-between" alignItems="center">
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
        {actionsMode === ActionsMode.Code && (
          <Flex.Row justifyContent="end" gap={6}>
            <ScriptTypeSelect
              value={scriptType}
              onChange={setScriptType}
              shortDescription={true}
            />
            <CopyToClipboard
              text={genCode(actions, true, scriptType)}
              onCopy={() => {
                setCopyCodeConfirm(true);
                setTimeout(() => {
                  setCopyCodeConfirm(false);
                }, 2000);
              }}
            >
              <IconButton
                className={
                  copyCodeConfirm ? Css.color(Colors.Secondary.Green) : ""
                }
                label="Copy Code"
                icon={copyCodeConfirm ? "check" : "folder"}
                reverseIcon={true}
              />
            </CopyToClipboard>
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
      <Flex.Col className={cx(Css.height(240), Css.overflow("scroll"))}>
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
