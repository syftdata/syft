import { Action } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import { useState } from "react";
import Section from "../common/components/core/Section";
import SchemaSelector, { SelectedSchemaView } from "../schemaapp/selector";
import { useGitInfoContext } from "../cloud/state/gitinfo";
import ActionList from "./ActionList";

export interface ActionsEditorProps {
  actions: Action[];
  title: string;
  onUpdateAction?: (index: number, action?: Action) => void;
}

export default function ActionsEditor({
  actions,
  title,
  onUpdateAction,
}: ActionsEditorProps) {
  // select the last action by default.
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(-1);
  const { gitInfoState } = useGitInfoContext();

  const selectedAction =
    selectedActionIndex > -1 ? actions[selectedActionIndex] : null;
  const gitInfo = gitInfoState.info;

  const schemas = gitInfo?.eventSchema?.events ?? [];
  return (
    <Flex.Col className={Flex.grow(1)}>
      <Section title={title} className={Flex.grow(1)}>
        <ActionList
          actions={actions}
          selectedIndex={selectedActionIndex}
          onSelect={(index) => {
            if (index === selectedActionIndex) {
              setSelectedActionIndex(-1);
            } else {
              setSelectedActionIndex(index);
            }
          }}
          onEdit={(index) => {
            setSelectedActionIndex(index);
          }}
          onDelete={(index) => {
            onUpdateAction && onUpdateAction(index);
          }}
          className={Flex.grow(1)}
        />
      </Section>
      {selectedAction && (
        <>
          {selectedAction.events && selectedAction.events.length > 0 && (
            <Section title="Attached Events">
              <SelectedSchemaView
                key={selectedActionIndex}
                action={selectedAction}
                setEvents={(events) => {
                  onUpdateAction &&
                    onUpdateAction(selectedActionIndex, {
                      ...selectedAction,
                      events,
                    });
                }}
                schemas={schemas}
              />
            </Section>
          )}
          <Section title="Event Models">
            <SchemaSelector
              key={selectedActionIndex}
              action={selectedAction}
              setEvents={(events) => {
                onUpdateAction &&
                  onUpdateAction(selectedActionIndex, {
                    ...selectedAction,
                    events,
                  });
              }}
              schemas={schemas}
              className={Css.maxHeight(300)}
            />
          </Section>
        </>
      )}
    </Flex.Col>
  );
}
