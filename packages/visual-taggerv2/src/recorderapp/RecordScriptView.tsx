import { useState } from "react";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import { UserSession } from "../types";
import Input from "../common/components/core/Input/Input";
import { Label } from "../common/styles/fonts";
import Section from "../common/components/core/Section";
import { css } from "@emotion/css";
import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { createTestSpec } from "../cloud/api/git";
import ScriptEditor from "./ScriptEditor";

interface RecordScriptViewProps {
  userSession: UserSession;
  script: string;
  setScript: (script: string) => void;
  sha?: string;
  scriptTitle: string;
  setScriptTitle: (title: string) => void;
  onClose: () => void;
  className?: string;
}

export default function RecordScriptView({
  userSession,
  script,
  setScript,
  sha,
  scriptTitle,
  setScriptTitle,

  onClose,

  className,
}: RecordScriptViewProps) {
  const [saving, setSaving] = useState(false);

  const onSave = () => {
    if (!script) {
      return;
    }
    setSaving(true);
    createTestSpec(scriptTitle, JSON.parse(script), sha, userSession)
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
              placeholder="Recording title"
              value={scriptTitle}
              onChange={(e) => setScriptTitle(e.target.value)}
            />
          </Flex.Row>
        </Flex.Col>
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
          <ScriptEditor script={script} onEdit={setScript} />
        </Flex.Col>
      </Section>
    </Flex.Col>
  );
}
