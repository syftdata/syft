import { useState } from "react";
import { Css, Flex } from "../common/styles/common.styles";
import { Action, ActionsMode, ScriptType } from "../types";
import CodeGen from "./CodeGen";
import ActionList from "./ActionList";
import { Input } from "../common/components/core/Form/input";
import { Label, Mono, Paragraph, Subheading } from "../common/styles/fonts";
import Section from "../common/components/core/Section";
import { css } from "@emotion/css";
import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { genJson } from "../builders";
import { saveFile } from "../common/utils";

interface RecordScriptViewProps {
  actions: Action[];
  scriptType: ScriptType;
  setScriptType: (scriptType: ScriptType) => void;
  scriptTitle: string;
  setScriptTitle: (title: string) => void;
  onClose: () => void;
  className?: string;
}

export default function RecordScriptView({
  actions,
  scriptType,
  setScriptType,
  scriptTitle,
  setScriptTitle,
  onClose,
  className,
}: RecordScriptViewProps) {
  const [actionsMode, setActionsMode] = useState<ActionsMode>(ActionsMode.Code);

  return (
    <Flex.Col className={className}>
      <Flex.RowWithDivider gap={4} alignItems="center">
        <Flex.Col gap={8} className={css(Flex.grow(1), Css.padding("8px 8px"))}>
          <Flex.Row gap={8} alignItems="center">
            <Label.L12>Title</Label.L12>
            <Input.L12
              type="text"
              placeholder="recording title"
              value={scriptTitle}
              onChange={(e) => setScriptTitle(e.target.value)}
            />
          </Flex.Row>
        </Flex.Col>
        <PrimaryIconButton
          onClick={async () => {
            const code = genJson(scriptTitle, actions);
            await saveFile(`${scriptTitle}.json`, code);
          }}
          icon="floppy-disc"
          label="Save"
        />
        <IconButton onClick={onClose} icon="close" />
      </Flex.RowWithDivider>
      <Section title="Recorded Script">
        <Flex.Col
          className={css(
            Css.overflow("scroll"),
            Css.maxHeight("calc(100vh - 130px)")
          )}
        >
          {actionsMode === ActionsMode.Code && (
            <CodeGen
              title={scriptTitle}
              actions={actions}
              library={scriptType}
            />
          )}
          {actionsMode === ActionsMode.Actions && (
            <ActionList actions={actions} />
          )}
        </Flex.Col>
      </Section>
    </Flex.Col>
  );
}
