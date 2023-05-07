import { useState } from "react";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import { Action, ActionsMode, ScriptType, UserSession } from "../types";
import CodeGen from "./CodeGen";
import ActionList from "./ActionList";
import Input from "../common/components/core/Input/Input";
import { Label } from "../common/styles/fonts";
import Section from "../common/components/core/Section";
import { css } from "@emotion/css";
import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { genJson } from "../builders";
import { createTestSpec } from "../cloud/api/git";

interface RecordScriptViewProps {
  userSession: UserSession;
  actions: Action[];
  scriptType: ScriptType;
  setScriptType: (scriptType: ScriptType) => void;
  scriptTitle: string;
  setScriptTitle: (title: string) => void;
  onClose: () => void;
  className?: string;
}

export default function RecordScriptView({
  userSession,
  actions,
  scriptType,
  setScriptType,
  scriptTitle,
  setScriptTitle,
  onClose,
  className,
}: RecordScriptViewProps) {
  const [actionsMode, setActionsMode] = useState<ActionsMode>(ActionsMode.Code);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const code = genJson(scriptTitle, actions);
    createTestSpec(`${scriptTitle}.json`, code, userSession)
      .then(() => onClose())
      .catch((err) => {
        alert("Failed to save script");
        console.log(err);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <Flex.Col className={className}>
      <FlexExtra.RowWithDivider gap={4} alignItems="center">
        <Flex.Col gap={8} className={css(Flex.grow(1), Css.padding("8px 8px"))}>
          <Flex.Row gap={8} alignItems="center">
            <Label.L12>Title</Label.L12>
            <Input
              placeholder="recording title"
              value={scriptTitle}
              onChange={(e) => setScriptTitle(e.target.value)}
            />
          </Flex.Row>
        </Flex.Col>
        <PrimaryIconButton
          onClick={save}
          disabled={saving}
          icon={saving ? "spinner" : "floppy-disc"}
          label="Save"
        />
        <IconButton onClick={onClose} icon="close" />
      </FlexExtra.RowWithDivider>
      <Section title="Recorded Script">
        <Flex.Col
          className={css(
            Css.overflow("scroll"),
            Css.maxHeight("calc(100vh - 170px)")
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
