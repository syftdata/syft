import { css } from "@emotion/css";
import { Colors } from "../common/styles/colors";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import { SyftEvent } from "../types";
import { Field, EventSchema } from "@syftdata/common/lib/types";
import Input from "../common/components/core/Input/Input";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import Screenshots from "../taggingapp/Screenshots";

export interface SchemaAndEvents {
  schema: EventSchema;
  event?: SyftEvent;
}

const EditableFieldRenderer = ({
  field,
  val,
  setVal,
}: {
  field: Field;
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
        <Mono.M10>{field.documentation}..</Mono.M10>
      </Flex.Col>
      <Input value={val} onChange={(e) => setVal(e.target.value)} />
    </Flex.Row>
  );
};

const FieldRenderer = ({ field }: { field: Field }) => {
  return (
    <Flex.Col gap={4} className={Css.padding("0px 36px")}>
      <Mono.M14 color={Colors.Branding.DarkBlue}>{field.name}</Mono.M14>
      <Mono.M10>{field.documentation}</Mono.M10>
    </Flex.Col>
  );
};

const SchemaPropsRenderer = ({
  data,
  onUpdate,
  showScreenshot = true,
}: {
  data: SchemaAndEvents;
  showScreenshot?: boolean;
  onUpdate?: (data: SchemaAndEvents) => void;
}) => {
  const event = data.event;
  const screenshot = event?.screenshot;
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
      {
        // show screenshot.
        showScreenshot && screenshot && (
          <Flex.Row className={Css.margin("8px 36px")}>
            <LabelledValue
              label="Screenshot"
              children={<Screenshots screenshot={screenshot} />}
            />
          </Flex.Row>
        )
      }
    </Flex.Col>
  );
};
export default SchemaPropsRenderer;
