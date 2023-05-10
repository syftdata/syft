import { useState } from "react";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import { Action, ScriptType, UserSession } from "../types";
import CodeGen from "./CodeGen";
import Input from "../common/components/core/Input/Input";
import { Label } from "../common/styles/fonts";
import Section from "../common/components/core/Section";
import { css } from "@emotion/css";
import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { genPuppeteerSteps } from "../builders";
import { createTestSpec } from "../cloud/api/git";
import { Step } from "@puppeteer/replay";

interface RecordScriptViewProps {
  userSession: UserSession;
  actions: Action[];
  scriptType: ScriptType;
  setScriptType: (scriptType: ScriptType) => void;
  scriptTitle: string;
  setScriptTitle: (title: string) => void;
  onClose: () => void;
  onPreview: (title: string, steps: Step[]) => void;
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
  onPreview,
  className,
}: RecordScriptViewProps) {
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    const steps = genPuppeteerSteps(actions);
    createTestSpec(scriptTitle, steps, userSession)
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
        <IconButton
          onClick={() => onPreview(scriptTitle, genPuppeteerSteps(actions))}
          icon={"play"}
          label="Preview"
        />
        <PrimaryIconButton
          onClick={onSave}
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
            Css.maxHeight("calc(100vh - 180px)")
          )}
        >
          <CodeGen title={scriptTitle} actions={actions} library={scriptType} />
        </Flex.Col>
      </Section>
    </Flex.Col>
  );
}
