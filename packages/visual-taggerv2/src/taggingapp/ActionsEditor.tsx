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
  previewAction?: Action;
  previewActionMatchedTagIndex?: number;

  onUpdateTag?: (index: number, action?: Action) => void;
  previewMode: boolean;
}

export default function ActionsEditor({
  tags: _tags,
  actions,
  previewAction,
  previewActionMatchedTagIndex,
  onUpdateTag,
  previewMode,
}: ActionsEditorProps) {
  // select the last action by default.
  const [selectedActionIndex, setSelectedActionIndex] = useState(-1);
  const [selectedTagIndex, setSelectedTagIndex] = useState(-1);
  const [forceShowEditModal, setForceShowEditModal] = useState(false);
  const [tags, setTags] = useState<Action[]>([]);

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
    setForceShowEditModal(false);
    if (previewAction) {
      if (
        previewActionMatchedTagIndex !== undefined &&
        previewActionMatchedTagIndex > -1
      ) {
        selectTag(previewActionMatchedTagIndex);
      } else {
        setTags([..._tags, previewAction]);
        selectTag(_tags.length);
        setForceShowEditModal(true);
      }
    } else {
      setTags(_tags);
    }
  }, [_tags, previewAction]);

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
        <Section title="Interactions">
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
          forceShowEditModal={forceShowEditModal}
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
