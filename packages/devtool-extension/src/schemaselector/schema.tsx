import { css } from "@emotion/css";
import { Colors } from "../common/styles/colors";
import { Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import { EventField, EventSchema, SyftEvent } from "../types";
import { Input } from "../common/components/core/Form/input";

export interface SchemaAndEvents {
  schema: EventSchema;
  event?: SyftEvent;
}

const EditableFieldRenderer = ({
  field,
  val,
  setVal,
}: {
  field: EventField;
  val: string;
  setVal: (val: string) => void;
}) => {
  return (
    <Flex.Row
      gap={2}
      className={css`
        padding-left: 24px;
        padding-right: 10px;
      `}
      alignItems="center"
      justifyContent="space-between"
    >
      <Flex.Col gap={4}>
        <Mono.M14 color={Colors.Branding.DarkBlue}>{field.name}</Mono.M14>
        <Mono.M10>{field.documentation}</Mono.M10>
      </Flex.Col>
      <Input.L12
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
    </Flex.Row>
  );
};

const FieldRenderer = ({ field }: { field: EventField }) => {
  return (
    <Flex.Row
      gap={2}
      className={css`
        padding-left: 24px;
        padding-right: 10px;
      `}
      alignItems="center"
    >
      <Flex.Col gap={4}>
        <Mono.M14 color={Colors.Branding.DarkBlue}>{field.name}</Mono.M14>
        <Mono.M10>{field.documentation}</Mono.M10>
      </Flex.Col>
    </Flex.Row>
  );
};

const SchemaPropsRenderer = ({
  data,
  onUpdate,
}: {
  data: SchemaAndEvents;
  onUpdate: (data: SchemaAndEvents) => void;
}) => {
  const event = data.event;
  return (
    <Flex.Col gap={4}>
      {data.schema.fields.map((field, index) =>
        event ? (
          <EditableFieldRenderer
            key={index}
            field={field}
            val={event.props[field.name] ?? ""}
            setVal={(val) => {
              event.props[field.name] = val;
              onUpdate(data);
            }}
          />
        ) : (
          <FieldRenderer key={index} field={field} />
        )
      )}
    </Flex.Col>
  );
};
export default SchemaPropsRenderer;
