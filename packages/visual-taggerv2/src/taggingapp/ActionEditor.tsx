import { Action, ActionType, ScriptType } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import Section from "../common/components/core/Section";
import { SelectedSchemaView } from "../schemaapp/selector";
import { useGitInfoContext } from "../cloud/state/gitinfo";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import { getBestSelectorForAction } from "../builders/selector";
import { useEffect, useState } from "react";
import AttachEventModal from "./AttachEventModal";

export interface ActionEditorProps {
  action: Action;
  onUpdateAction?: (action?: Action) => void;
  forceShowEditModal?: boolean;
}

export default function ActionEditor({
  action,
  onUpdateAction,
  forceShowEditModal,
}: ActionEditorProps) {
  const { gitInfoState } = useGitInfoContext();
  const gitInfo = gitInfoState.modifiedInfo ?? gitInfoState.info;
  const schemas = gitInfo?.eventSchema?.events ?? [];
  const [showAttachModal, setShowAttachModal] = useState(false);

  useEffect(() => {
    if (forceShowEditModal) {
      setShowAttachModal(true);
    }
  }, [forceShowEditModal]);

  const onAttachModalSave = (action: Action) => {
    setShowAttachModal(false);
    onUpdateAction && onUpdateAction(action);
  };

  const onAttachModalClose = () => {
    setShowAttachModal(false);
  };

  return (
    <>
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
      {action.type !== ActionType.Load && (
        <Section title="More Details">
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
      )}
    </>
  );
}
