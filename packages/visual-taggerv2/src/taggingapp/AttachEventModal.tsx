import { useState } from "react";
import Modal from "../common/components/core/Modal/Modal";
import SchemaSelector from "../schemaapp/selector";
import { Action } from "../types";
import { EventSchema } from "@syftdata/common/lib/types";

export interface AttachEventModalProps {
  action: Action;
  open: boolean;
  schemas: EventSchema[];
  onUpdateAction(action: Action): void;
  onCancel(): void;
}
const AttachEventModal = ({
  open,
  action,
  schemas,
  onUpdateAction,
  onCancel,
}: AttachEventModalProps) => {
  const [localAction, setLocalAction] = useState(action);
  const saveEventModel = () => {
    onUpdateAction(localAction);
  };

  return (
    <Modal
      title="Attach Events"
      open={open}
      okText="Save"
      onOk={saveEventModel}
      onCancel={onCancel}
    >
      <SchemaSelector
        action={localAction}
        setEvents={(events) => {
          setLocalAction({
            ...action,
            events,
          });
        }}
        schemas={schemas}
      />
    </Modal>
  );
};
export default AttachEventModal;
