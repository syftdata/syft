import { useState } from "react";
import { Css, Flex } from "../common/styles/common.styles";
import { Action, ActionsMode, ScriptType } from "../types";
import ScriptTypeSelect from "../common/ScriptTypeSelect";
import CodeGen from "./CodeGen";
import ActionList from "./ActionList";
import { cx } from "@emotion/css";
import { genCode } from "../builders";
import { IconButton, PrimaryIconButton } from "../common/components/core/Button";

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
      {/* <Flex.Row alignItems="center">
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
            <PrimaryIconButton
              onClick={() => {
                downloadScript(actions, scriptType);
              }}
              label="Download"
              icon="arrow-down"
            />
          </Flex.Row>
        )}
      </Flex.Row> */}
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
