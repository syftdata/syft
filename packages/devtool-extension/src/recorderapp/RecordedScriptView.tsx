import { useState } from "react";
import { Css, Flex } from "../common/styles/common.styles";
import { Action, ActionsMode, ScriptType } from "../types";
import CodeGen from "./CodeGen";
import ActionList from "./ActionList";
import { Input } from "../common/components/core/Form/input";
import { Label, Mono, Paragraph, Subheading } from "../common/styles/fonts";
import Section from "../common/components/core/Section";
import { css } from "@emotion/css";

interface RecordScriptViewProps {
  actions: Action[];
  scriptType: ScriptType;
  setScriptType: (scriptType: ScriptType) => void;
  scriptTitle: string;
  setScriptTitle: (title: string) => void;
  className?: string;
}

export default function RecordScriptView({
  actions,
  scriptType,
  setScriptType,
  scriptTitle,
  setScriptTitle,
  className,
}: RecordScriptViewProps) {
  const [actionsMode, setActionsMode] = useState<ActionsMode>(ActionsMode.Code);

  return (
    <Flex.Col className={className}>
      <Section title="Test Details">
        <Flex.Col gap={8} className={Css.padding("8px 8px")}>
          <Flex.Row gap={4} alignItems="center" justifyContent="space-between">
            <Subheading.SH12>Title</Subheading.SH12>
            <Input.L12
              type="text"
              placeholder="recording title"
              value={scriptTitle}
              onChange={(e) => setScriptTitle(e.target.value)}
            />
          </Flex.Row>
        </Flex.Col>
      </Section>
      <Section title="Recorded Script">
        <Flex.Col
          className={css(
            Css.overflow("scroll"),
            Css.maxHeight("calc(100vh - 200px)")
          )}
        >
          {actionsMode === ActionsMode.Code && (
            <CodeGen actions={actions} library={scriptType} />
          )}
          {actionsMode === ActionsMode.Actions && (
            <ActionList actions={actions} />
          )}
        </Flex.Col>
      </Section>
    </Flex.Col>
  );
}
