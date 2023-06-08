import { Action } from "../types";
import { Flex } from "../common/styles/common.styles";
import { useEffect, useState } from "react";
import Section from "../common/components/core/Section";
import ActionList from "./ActionList";
import TagList from "./TagList";
import ActionEditor from "./ActionEditor";
import { shallowEqual } from "../common/utils";

export interface ActionsEditorProps {
  actions: Action[];
  tags: Action[];
  onUpdateTag?: (index: number, action?: Action) => void;
  previewMode: boolean;
}

export default function ActionsEditor({
  tags,
  actions,
  onUpdateTag,
  previewMode,
}: ActionsEditorProps) {
  // select the last action by default.
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(-1);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number>(-1);

  const selectedAction =
    selectedActionIndex > -1 ? actions[selectedActionIndex] : null;
  const selectedTag = selectedTagIndex > -1 ? tags[selectedTagIndex] : null;

  const selectTag = (index: number) => {
    setSelectedTagIndex(index);
    setSelectedActionIndex(-1);
  };
  const selectAction = (index: number) => {
    setSelectedActionIndex(index);
    setSelectedTagIndex(-1);
  };

  useEffect(() => {
    const lastAction = actions[actions.length - 1];
    if (lastAction) {
      const selector = lastAction.selectors;
      const tag = tags.find((tag, idx) => {
        if (shallowEqual(tag.selectors, selector)) {
          selectTag(idx);
          return true;
        }
        return false;
      });
      if (!tag) {
        selectAction(actions.length - 1);
      }
    }
  }, [actions]);

  return (
    <Flex.Col className={Flex.grow(1)}>
      {previewMode && tags && (
        <Section title="Event Triggers" className={Flex.grow(1)}>
          <TagList
            tags={tags}
            selectedIndex={selectedTagIndex}
            onSelect={(index) => {
              if (index === selectedTagIndex) {
                selectTag(-1);
              } else {
                selectTag(index);
              }
            }}
            onEdit={(index) => {
              selectTag(index);
            }}
            onDelete={(index) => {
              onUpdateTag && onUpdateTag(index);
            }}
            className={Flex.grow(1)}
          />
        </Section>
      )}
      {actions && (
        <Section title="Recent Triggers">
          <ActionList
            actions={actions}
            selectedIndex={selectedActionIndex}
            onSelect={(index) => {
              if (index === selectedActionIndex) {
                selectAction(-1);
              } else {
                selectAction(index);
              }
            }}
          />
        </Section>
      )}
      {selectedTag && (
        <ActionEditor
          key={selectedTagIndex}
          action={selectedTag}
          onUpdateAction={(action) => {
            onUpdateTag && onUpdateTag(selectedTagIndex, action);
          }}
        />
      )}
      {selectedAction && (
        <ActionEditor
          key={selectedActionIndex}
          action={selectedAction}
          onUpdateAction={(action) => {
            if (action?.events && action.events.length > 0) {
              onUpdateTag && onUpdateTag(tags.length, action);
            }
          }}
        />
      )}
    </Flex.Col>
  );
}
