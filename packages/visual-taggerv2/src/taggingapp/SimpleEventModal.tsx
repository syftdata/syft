import { useState } from "react";
import Modal from "../common/components/core/Modal/Modal";
import { ReactElement } from "../types";
import { EventSchema } from "@syftdata/common/lib/types";
import { Flex } from "../common/styles/common.styles";
import Input from "../common/components/core/Input/Input";
import { SyftEventType } from "@syftdata/common/lib/client_types";
import SchemaSelector from "../schemaapp/selector";

export interface SimpleEventModalProps {
  tag: ReactElement;
  schemas: EventSchema[];
  handler: string;
  open: boolean;
  addSchema(tag: ReactElement, schema?: EventSchema): void;
  onCancel(): void;
  onMagicWand(): void;
}
const SimpleEventModal = ({
  open,
  tag,
  schemas,
  handler,
  addSchema,
  onCancel,
  onMagicWand,
}: SimpleEventModalProps) => {
  const [localAction, setLocalAction] = useState(tag);
  const [name, setName] = useState<string | undefined>(undefined);
  const saveEventModel = () => {
    let schema: EventSchema | undefined;
    if (name != null && name !== "") {
      localAction.handlerToEvents[handler] =
        localAction.handlerToEvents[handler] ?? [];
      localAction.handlerToEvents[handler].push(name);
      schema = {
        name,
        fields: [],
        eventType: SyftEventType.TRACK,
        zodType: "",
      };
    }
    addSchema(localAction, schema);
  };

  return (
    <Modal
      title={`Trigger New Event for ${handler}`}
      open={open}
      okText="Save"
      onOk={saveEventModel}
      onCancel={onCancel}
    >
      <Flex.Col gap={8}>
        <Input
          label="Event Name"
          placeholder="Event Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <SchemaSelector
          action={localAction}
          handler={handler}
          onMagicWand={onMagicWand}
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
      </Flex.Col>
    </Modal>
  );
};
export default SimpleEventModal;
