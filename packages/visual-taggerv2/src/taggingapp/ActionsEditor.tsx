import { Action } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import { useState } from "react";
import Section from "../common/components/core/Section";
import SchemaSelector, { SelectedSchemaView } from "../schemaapp/selector";
import { useGitInfoContext } from "../cloud/state/gitinfo";
import ActionList from "./ActionList";
import TagList from "./TagList";
import ActionEditor from "./ActionEditor";

export interface ActionsEditorProps {
  actions: Action[];
  tags: Action[];
  onUpdateAction?: (index: number, action?: Action) => void;
  onUpdateTag?: (index: number, action?: Action) => void;
}

export default function ActionsEditor({
  tags,
  actions,
  onUpdateAction,
  onUpdateTag,
}: ActionsEditorProps) {
  // select the last action by default.
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(-1);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number>(-1);
  const { gitInfoState } = useGitInfoContext();

  const selectedAction =
    selectedActionIndex > -1 ? actions[selectedActionIndex] : null;
  const selectedTag = selectedTagIndex > -1 ? tags[selectedTagIndex] : null;

  const gitInfo = gitInfoState.info;

  const schemas = gitInfo?.eventSchema?.events ?? [];
  return (
    <Flex.Col className={Flex.grow(1)}>
      <Section title="Tags">
        <TagList
          tags={tags}
          selectedIndex={selectedTagIndex}
          onSelect={(index) => {
            if (index === selectedTagIndex) {
              setSelectedTagIndex(-1);
            } else {
              setSelectedActionIndex(-1);
              setSelectedTagIndex(index);
            }
          }}
          onEdit={(index) => {
            setSelectedActionIndex(-1);
            setSelectedTagIndex(index);
          }}
          onDelete={(index) => {
            onUpdateTag && onUpdateTag(index);
          }}
        />
      </Section>
      {selectedTag && (
        <ActionEditor
          action={selectedTag}
          onUpdateAction={(action) => {
            onUpdateTag && onUpdateTag(selectedTagIndex, action);
          }}
        />
      )}
      {actions.length > 0 && (
        <Section title="Actions" className={Flex.grow(1)}>
          <ActionList
            actions={actions}
            selectedIndex={selectedActionIndex}
            onSelect={(index) => {
              if (index === selectedActionIndex) {
                setSelectedActionIndex(-1);
              } else {
                setSelectedTagIndex(-1);
                setSelectedActionIndex(index);
              }
            }}
            className={Flex.grow(1)}
          />
        </Section>
      )}
      {selectedAction && (
        <ActionEditor
          action={selectedAction}
          onUpdateAction={(action) => {
            onUpdateAction && onUpdateAction(selectedActionIndex, action);
          }}
        />
      )}
    </Flex.Col>
  );
}
