import { SyftEventType } from "@syftdata/common/lib/client_types";
import { useState } from "react";
import Button from "../common/components/core/Button/Button";
import { IconButton } from "../common/components/core/Button/IconButton";
import Input from "../common/components/core/Input/Input";
import Select from "../common/components/core/Input/Select";
import Modal from "../common/components/core/Modal/Modal";
import LabelledTile from "../common/components/core/Tile/LabelledTile";
import {
  type Field as ApiField,
  type EventSchema as ApiEventSchema,
} from "@syftdata/common/lib/types";
import { FieldType } from "../types/schema";
import { Colors } from "../common/styles/colors";
import { Flex } from "../common/styles/common.styles";
import { Label } from "../common/styles/fonts";

const EventTypeOptions = Object.values(SyftEventType)
  .filter((key) => isNaN(Number(key)))
  .map((v) => ({
    label: v,
    value: v,
  }));

const FieldTypeOptions = Object.values(FieldType).map((v) => ({
  label: v,
  value: v,
}));

const createAnEmptyField = (): ApiField => ({
  name: "",
  type: {
    name: "string",
    zodType: "z.string()",
  },
  isOptional: false,
});

const updateFieldType = (field: ApiField, type: FieldType) => {
  if (type === FieldType.NUMBER) {
    return {
      ...field,
      type: { name: "number", zodType: "z.number()" },
    };
  } else if (type === FieldType.STRING) {
    return {
      ...field,
      type: { name: "string", zodType: "z.string()" },
    };
  } else if (type === FieldType.BOOLEAN) {
    return {
      ...field,
      type: { name: "boolean", zodType: "z.boolean()" },
    };
  } else if (type === FieldType.DATE) {
    return {
      ...field,
      type: { name: "Date", zodType: "z.date()" },
    };
  } else if (type === FieldType.UUID) {
    return {
      ...field,
      type: { name: "string", syfttype: "UUID", zodType: "z.string().uuid()" },
    };
  } else if (type === FieldType.EMAIL) {
    return {
      ...field,
      type: {
        name: "string",
        syfttype: "Email",
        zodType: "z.string().email()",
      },
    };
  } else if (type === FieldType.URL) {
    return {
      ...field,
      type: { name: "string", syfttype: "Url", zodType: "z.string().url()" },
    };
  } else if (type === FieldType.ANY) {
    return {
      ...field,
      type: { name: "any", zodType: "z.any()" },
    };
  }
  return field;
};

interface FieldEditorProps {
  field: ApiField;
  onUpdateField(field: ApiField): void;
  onDeleteField(): void;
}
const FieldEditor = ({
  field,
  onUpdateField,
  onDeleteField,
}: FieldEditorProps) => {
  const onChangeName = (name: string) => {
    onUpdateField({ ...field, name });
  };
  const onChangeDocumentation = (documentation: string) => {
    onUpdateField({ ...field, documentation });
  };
  const onChangeType = (type: FieldType) => {
    onUpdateField(updateFieldType(field, type));
  };
  return (
    <Flex.Col gap={4}>
      <Flex.Row gap={8} alignItems="center" justifyContent="space-between">
        <Input
          label="Field Name"
          placeholder="Field Name"
          value={field.name}
          onChange={(e) => onChangeName(e.target.value)}
        />
        <Flex.Row className={Flex.grow(1)}>
          <Select
            label="Field Type"
            value={
              field.type.syfttype != null
                ? field.type.syfttype.toUpperCase()
                : field.type.name.toUpperCase()
            }
            options={FieldTypeOptions}
            onChange={(v) => onChangeType(v as FieldType)}
          />
        </Flex.Row>
        <IconButton icon="trash" onClick={onDeleteField} />
      </Flex.Row>
      <Input
        label="Description"
        placeholder="Add documentation"
        value={field.documentation}
        onChange={(e) => onChangeDocumentation(e.target.value)}
      />
    </Flex.Col>
  );
};

export interface EditEventViewProps {
  title: string;
  okText: string;
  event: ApiEventSchema;
  open: boolean;
  onSaveEvent(newEvent: ApiEventSchema, oldEvent: ApiEventSchema): void;
  onCancel(): void;
}
const EditEventView = ({
  title,
  okText,
  open,
  event,
  onSaveEvent,
  onCancel,
}: EditEventViewProps) => {
  const [name, setName] = useState(event.name);
  const [documentation, setDocumentation] = useState(event.documentation);
  const [eventType, setEventType] = useState(
    event.eventType ?? SyftEventType.TRACK
  );
  const [fields, setFields] = useState<ApiField[]>(event.fields);

  const saveEventModel = () => {
    onSaveEvent(
      {
        name,
        documentation,
        eventType,
        fields,
        traits: [],
        zodType: "z.any()",
      },
      event
    );
  };

  const deleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: ApiField) => {
    setFields(fields.map((f, i) => (i === index ? field : f)));
  };

  return (
    <Modal
      title={title}
      open={open}
      okText={okText}
      onOk={saveEventModel}
      onCancel={onCancel}
    >
      <Flex.Col gap={20}>
        <LabelledTile label="Event Details">
          <Flex.Col gap={8}>
            <Input
              label="Event Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 'UserCreated'"
            />
            <Select
              label="Event Type"
              value={SyftEventType[eventType]}
              options={EventTypeOptions}
              onChange={(e) =>
                setEventType(SyftEventType[e as keyof typeof SyftEventType])
              }
            />
            <Input
              label="Description"
              value={documentation}
              onChange={(e) => setDocumentation(e.target.value)}
              placeholder="A detailed description about the event and when to fire it."
            />
          </Flex.Col>
        </LabelledTile>
        <LabelledTile label="Event Fields">
          <Flex.Col gap={16}>
            {fields.map((field, key) => (
              <FieldEditor
                key={key}
                field={field}
                onDeleteField={() => deleteField(key)}
                onUpdateField={(field) => updateField(key, field)}
              />
            ))}
            <Button
              onClick={() => {
                setFields([...fields, createAnEmptyField()]);
              }}
              type="Clear"
              size="small"
            >
              <Label.L10 color={Colors.Branding.Blue}>
                + Add New Field
              </Label.L10>
            </Button>
          </Flex.Col>
        </LabelledTile>
      </Flex.Col>
    </Modal>
  );
};

export interface AddEventModalProps {
  open: boolean;
  onAddEvent(event: ApiEventSchema): void;
  onCancel(): void;
}

const AddEventModal = ({ open, onAddEvent, onCancel }: AddEventModalProps) => {
  const event = {
    name: "",
    description: "",
    fields: [createAnEmptyField()],
    eventType: SyftEventType.TRACK,
    zodType: "z.any()",
    traits: [],
    exported: true,
  };
  return (
    <EditEventView
      title="Add New Event"
      open={open}
      okText="Add"
      event={event}
      onSaveEvent={onAddEvent}
      onCancel={onCancel}
    />
  );
};
export default AddEventModal;

export interface EditEventModalProps {
  open: boolean;
  event: ApiEventSchema;
  onEditEvent(newEvent: ApiEventSchema, oldEvent: ApiEventSchema): void;
  onCancel(): void;
}

export const EditEventModal = ({
  event,
  open,
  onEditEvent,
  onCancel,
}: EditEventModalProps) => {
  return (
    <EditEventView
      title={`Edit ${event.name}`}
      open={open}
      okText="Save"
      event={event}
      onSaveEvent={onEditEvent}
      onCancel={onCancel}
    />
  );
};
