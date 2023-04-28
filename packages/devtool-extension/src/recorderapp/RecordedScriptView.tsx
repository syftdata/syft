import { useState } from "react";
import { Css, Flex } from "../common/styles/common.styles";
import { Action, ActionsMode, ScriptType } from "../types";
import CodeGen from "./CodeGen";
import ActionList from "./ActionList";
import { cx } from "@emotion/css";

interface RecordScriptViewProps {
  actions: Action[];
  scriptType: ScriptType;
  setScriptType: (scriptType: ScriptType) => void;
  className?: string;
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
      <Flex.Col className={cx(Css.minHeight(240), Css.overflow("scroll"))}>
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
