import { css } from "@emotion/css";
import { Colors } from "../common/styles/colors";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import { EventField, Event, SyftEvent } from "../types";
import Input from "../common/components/core/Input/Input";

export interface SchemaAndEvents {
  schema: Event;
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
      className={css(Flex.grow(1), Css.padding("0px 36px"))}
      alignItems="center"
    >
      <Flex.Col gap={4} className={Flex.grow(1)}>
        <Mono.M14 color={Colors.Branding.DarkBlue}>{field.name}</Mono.M14>
        <Mono.M10>{field.description}..</Mono.M10>
      </Flex.Col>
      <Input value={val} onChange={(e) => setVal(e.target.value)} />
    </Flex.Row>
  );
};

const FieldRenderer = ({ field }: { field: EventField }) => {
  return (
    <Flex.Col gap={4} className={Css.padding("0px 36px")}>
      <Mono.M14 color={Colors.Branding.DarkBlue}>{field.name}</Mono.M14>
      <Mono.M10>{field.description}</Mono.M10>
    </Flex.Col>
  );
};

const SchemaPropsRenderer = ({
  data,
  onUpdate,
}: {
  data: SchemaAndEvents;
  onUpdate?: (data: SchemaAndEvents) => void;
}) => {
  const event = data.event;
  return (
    <Flex.Col gap={4} className={Flex.grow(1)}>
      {data.schema.fields.map((field, index) =>
        event && onUpdate ? (
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
