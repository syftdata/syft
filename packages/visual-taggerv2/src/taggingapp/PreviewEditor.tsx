import { Action, EventTag } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import { useCallback, useEffect, useState } from "react";
import Section from "../common/components/core/Section";
import ActionList from "./ActionList";
import TagList from "./TagList";
import TagDetailedView from "./TagDetailedView";
import { EventSchema } from "@syftdata/common/lib/types";
import AttachEventModal from "./AttachEventModal";
import { shallowEqual } from "../common/utils";

export interface PreviewEditorProps {
  actions: Action[];
  tags: EventTag[];
  schemas: EventSchema[];

  previewAction?: Action;
  previewActionMatchedTagIndex?: number;

  onSelectTag: (index: number) => void;
  onUpdateTag: (index: number, tag?: EventTag) => void;
}

export default function PreviewEditor({
  tags,
  actions,
  schemas,
  previewAction,
  previewActionMatchedTagIndex,
  onUpdateTag,
  onSelectTag,
}: PreviewEditorProps) {
  // select the last action by default.
  const [selectedTagIndex, setSelectedTagIndex] = useState(-1);
  const [selectedAction, setSelectedAction] = useState<Action | undefined>();

  const selectedTag =
    selectedTagIndex > -1 ? tags[selectedTagIndex] : undefined;

  const selectTag = useCallback((index: number) => {
    onSelectTag(index);
    setSelectedTagIndex(index);
  }, []);

  useEffect(() => {
    if (previewAction) {
      if (
        previewActionMatchedTagIndex !== undefined &&
        previewActionMatchedTagIndex > -1
      ) {
        setSelectedTagIndex(previewActionMatchedTagIndex);
      } else {
        setShowActionModal(true);
        setSelectedAction(previewAction);
      }
    }
  }, [previewAction]);

  const [showActionModal, setShowActionModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);

  const onActionModalSave = (action: Action) => {
    setShowActionModal(false);
    // update the tag event screenshot.
    chrome.tabs.captureVisibleTab().then((screenshot) => {
      action.events?.forEach((event) => {
        if (event.screenshot === undefined) event.screenshot = screenshot;
      });
      onUpdateTag(tags.length, {
        ...action,
        committed: false,
        instrumented: false,
      });
    });
  };

  const onActionModalClose = () => {
    setShowActionModal(false);
  };

  const onTagModalSave = (action: Action) => {
    setShowTagModal(false);
    onUpdateTag(selectedTagIndex, action);
  };

  const onTagModalClose = () => {
    setShowTagModal(false);
  };

  return (
    <Flex.Col className={Flex.grow(1)} gap={1}>
      {actions && (
        <Section title="Interactions" expandable={true} defaultExpanded={false}>
          <ActionList
            actions={actions.slice(-3)}
            startAttachFlow={(action) => {
              const tag = tags.find((tag) =>
                shallowEqual(tag.selectors, action.selectors)
              );
              if (tag) {
                setShowTagModal(true);
                selectTag(tags.indexOf(tag));
              } else {
                setShowActionModal(true);
                setSelectedAction(action);
              }
            }}
          />
        </Section>
      )}
      {tags && (
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
            onDelete={onUpdateTag}
            className={Flex.grow(1)}
          />
        </Section>
      )}
      <TagDetailedView
        tag={selectedTag}
        schemas={schemas}
        startEditTagFlow={() => {
          setShowTagModal(true);
        }}
        onUpdateTag={(action) => {
          onUpdateTag(selectedTagIndex, action);
        }}
      />
      {selectedAction && (
        <AttachEventModal
          open={showActionModal}
          schemas={schemas}
          action={selectedAction}
          onUpdateAction={onActionModalSave}
          onCancel={onActionModalClose}
        />
      )}
      {selectedTag && (
        <AttachEventModal
          key={selectedTagIndex}
          open={showTagModal}
          schemas={schemas}
          action={selectedTag}
          onUpdateAction={onTagModalSave}
          onCancel={onTagModalClose}
        />
      )}
    </Flex.Col>
  );
}
