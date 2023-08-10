import { useState } from "react";
import Modal from "../common/components/core/Modal/Modal";
import SchemaSelector from "../schemaapp/selector";
import { ReactElement } from "../types";
import { EventSchema } from "@syftdata/common/lib/types";
import ReactElementView from "./ReactElementView";

export interface AttachEventModalProps {
  tag: ReactElement;
  handler: string;
  open: boolean;
  schemas: EventSchema[];
  setEvents(handler: string, events: string[]): void;
  onCancel(): void;
}
const AttachEventModal = ({
  open,
  tag,
  handler,
  schemas,
  setEvents,
  onCancel,
}: AttachEventModalProps) => {
  const [localAction, setLocalAction] = useState(tag);
  const saveEventModel = () => {
    setEvents(handler, localAction.handlerToEvents[handler] ?? []);
  };

  return (
    <Modal
      title="Trigger Events for"
      open={open}
      okText="Save"
      onOk={saveEventModel}
      onCancel={onCancel}
    >
      <ReactElementView element={localAction} />
      <SchemaSelector
        action={localAction}
        handler={handler}
        setEvents={(handler, events) => {
          setLocalAction({
            ...tag,
            handlerToEvents: {
              ...tag.handlerToEvents,
              [handler]: events,
            },
          });
        }}
        schemas={schemas}
      />
    </Modal>
  );
};
export default AttachEventModal;
