import { EventTag } from "../types";
import { Flex } from "../common/styles/common.styles";
import ReactElementList from "./ReactElementList";
import TagDetailedView from "./TagDetailedView";
import { EventSchema } from "@syftdata/common/lib/types";
import { shallowEqual } from "../common/utils";

export interface EventTagsEditorProps {
  tags: EventTag[];
  schemas: EventSchema[];

  selectedIndex: number;

  onSelectTag: (index: number, tag: EventTag) => void;
  onUpdateTag: (index: number, tag?: EventTag) => void;
}

export default function EventTagsEditor({
  tags,
  schemas,
  selectedIndex,
  onUpdateTag,
  onSelectTag,
}: EventTagsEditorProps) {
  const selectedTag = tags[selectedIndex];
  return (
    <Flex.Col className={Flex.grow(1)} gap={1}>
      <ReactElementList
        elements={tags}
        selectedIndex={selectedIndex}
        onClick={(idx, tag) => {
          onSelectTag(idx, tag);
        }}
      />
      {selectedTag && (
        <TagDetailedView
          tag={selectedTag}
          schemas={schemas}
          onUpdateTag={(action) => {
            onUpdateTag(selectedIndex, action);
          }}
        />
      )}
    </Flex.Col>
  );
}
