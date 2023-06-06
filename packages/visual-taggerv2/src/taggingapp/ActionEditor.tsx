import { Action, ScriptType } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import Section from "../common/components/core/Section";
import { SelectedSchemaView } from "../schemaapp/selector";
import { useGitInfoContext } from "../cloud/state/gitinfo";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import { getBestSelectorForAction } from "../builders/selector";
import { useState } from "react";
import AttachEventModal from "./AttachEventModal";

export interface ActionEditorProps {
  action: Action;
  onUpdateAction?: (action?: Action) => void;
}

export default function ActionEditor({
  action,
  onUpdateAction,
}: ActionEditorProps) {
  const { gitInfoState } = useGitInfoContext();
  const gitInfo = gitInfoState.info;
  const schemas = gitInfo?.eventSchema?.events ?? [];
  const [showAttachModal, setShowAttachModal] = useState(false);

  const onAttachModalSave = (action: Action) => {
    setShowAttachModal(false);
    onUpdateAction && onUpdateAction(action);
  };

  const onAttachModalClose = () => {
    setShowAttachModal(false);
  };

  return (
    <>
      <Section title="Details">
        <Flex.Col gap={8} className={Css.padding(8)}>
          <LabelledValue
            label="Component"
            value={action.eventSource?.parent?.name}
          />
          <LabelledValue
            label="Selector"
            value={getBestSelectorForAction(action, ScriptType.Playwright)}
          />
        </Flex.Col>
      </Section>
      <SelectedSchemaView
        action={action}
        onEdit={() => setShowAttachModal(true)}
        setEvents={(events) => {
          onUpdateAction &&
            onUpdateAction({
              ...action,
              events,
            });
        }}
        schemas={schemas}
      />
      <AttachEventModal
        open={showAttachModal}
        schemas={schemas}
        action={action}
        onCancel={onAttachModalClose}
        onUpdateAction={onAttachModalSave}
      />
    </>
  );
}
