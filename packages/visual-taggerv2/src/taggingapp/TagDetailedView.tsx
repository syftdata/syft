import { EventTag } from "../types";
import { EventSchema } from "@syftdata/common/lib/types";
import ReactElementView from "./ReactElementView";
import TagHandlerList from "./TagTriggerList";
import { useState } from "react";
import AttachEventModal from "./AttachEventModal";
import { EventsView } from "./EventsView";

export interface TagDetailedViewProps {
  tag: EventTag;
  onUpdateTag: (action?: EventTag) => void;
  schemas: EventSchema[];
}

export default function TagDetailedView({
  tag,
  onUpdateTag,
  schemas,
}: TagDetailedViewProps) {
  const handlers = [...Object.keys(tag.handlerToEvents)].sort();
  const [selectedHandler, setSelectedHandler] = useState<string>(
    handlers[0] ?? "onClick"
  );
  const [showActionModal, setShowActionModal] = useState(false);

  return (
    <>
      <TagHandlerList
        tag={tag}
        handlers={handlers}
        selectedHandler={selectedHandler}
        onSelect={setSelectedHandler}
      />
      <EventsView
        tag={tag}
        handler={selectedHandler}
        onEdit={() => setShowActionModal(true)}
        setEvents={(handler, events) => {
          onUpdateTag({
            ...tag,
            handlerToEvents: {
              ...tag.handlerToEvents,
              [handler]: events,
            },
          });
        }}
        schemas={schemas}
      />
      <ReactElementView element={tag} />
      <AttachEventModal
        key={`${tag.reactSource.name}:${selectedHandler}`}
        open={showActionModal}
        schemas={schemas}
        tag={tag}
        handler={selectedHandler}
        setEvents={(handler, events) => {
          onUpdateTag({
            ...tag,
            handlerToEvents: {
              ...tag.handlerToEvents,
              [handler]: events,
            },
          });
          setShowActionModal(false);
        }}
        onCancel={() => setShowActionModal(false)}
      />
    </>
  );
}
