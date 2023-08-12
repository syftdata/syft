import { css } from "@emotion/css";
import { Colors } from "../common/styles/colors";
import { Css, Flex } from "../common/styles/common.styles";
import { Label, Paragraph } from "../common/styles/fonts";
import { EventTag, ReactSource } from "../types";
import { Field, EventSchema } from "@syftdata/common/lib/types";
import Input from "../common/components/core/Input/Input";
import { IconButton } from "../common/components/core/Button/IconButton";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import PropSelectorModal from "./PropSelectorModal";
import { useState } from "react";
import Button from "../common/components/core/Button/Button";
import { FieldType } from "../types/schema";

export interface SchemaAndElement {
  schema: EventSchema;
  tag: EventTag;
}

const getValue = (fields: string[], props: Record<string, any>): any => {
  const field = fields.shift()!;
  try {
    const value = props[field];
    if (fields.length > 0) {
      return getValue(fields, value);
    }
    return value;
  } catch (e) {}
};

const getValueFromSource = (fields: string[], source: ReactSource): any => {
  if (fields.length === 0) {
    return undefined;
  }
  if (fields[0] !== "parent") {
    return getValue(fields, source.props);
  } else if (source.parent != null) {
    return getValueFromSource(fields.slice(1), source.parent);
  }
};

const FieldRenderer = ({
  data,
  field,
  onUpdate,
}: {
  data: SchemaAndElement;
  field: Field;
  onUpdate: (field: Field) => void;
}) => {
  const reactSource = data.tag.reactSource;
  const sourceField = field.rename ?? field.name;
  const value = getValueFromSource(sourceField.split("."), reactSource);
  const [showActionModal, setShowActionModal] = useState(false);

  const onChangeAttempt = () => {
    setShowActionModal(true);
  };

  return (
    <Flex.Row
      gap={16}
      className={css(Flex.grow(1), Css.padding("0px 12px"))}
      alignItems="end"
    >
      <Input
        label="Name"
        value={field.name}
        onChange={(e) =>
          onUpdate({
            ...field,
            name: e.target.value,
          })
        }
      />
      {field.rename && (
        <LabelledValue label="Source" onClick={onChangeAttempt}>
          <Paragraph.P10>{field.rename}</Paragraph.P10>
        </LabelledValue>
      )}
      <Paragraph.P10
        color={Colors.Secondary.Orange}
        className={Css.textEllipsisCss}
      >
        {value ? value.toString().substring(0, 20) : "N/A"}
      </Paragraph.P10>
      <Flex.Row className={Flex.grow(1)}></Flex.Row>
      <IconButton icon="edit" onClick={onChangeAttempt} />
      <PropSelectorModal
        open={showActionModal}
        tag={data.tag}
        schema={data.schema}
        addProp={(prop) => {
          setShowActionModal(false);
        }}
        onCancel={() => setShowActionModal(false)}
      />
    </Flex.Row>
  );
};

const EventPropsView = ({
  data,
  onUpdate,
}: {
  data: SchemaAndElement;
  onUpdate: (data: SchemaAndElement) => void;
}) => {
  return (
    <Flex.Col
      gap={4}
      className={css(Flex.grow(1), Css.padding("0px 0px 0px 24px"))}
    >
      {data.schema.fields.map((field, index) => (
        <FieldRenderer
          key={index}
          data={data}
          field={field}
          onUpdate={(newField) => {
            const schema = {
              ...data.schema,
              fields: data.schema.fields.map((f) =>
                f.name === field.name ? newField : f
              ),
            };
            onUpdate({
              schema,
              tag: data.tag,
            });
          }}
        />
      ))}
      <Flex.Col alignItems="center">
        <Button
          onClick={() => {
            const newField: Field = {
              name: "",
              isOptional: false,
              type: {
                name: FieldType.STRING,
                zodType: "",
                isArray: false,
              },
            };
            const schema = {
              ...data.schema,
              fields: [...data.schema.fields, newField],
            };
            onUpdate({
              schema,
              tag: data.tag,
            });
          }}
          type="Clear"
          size="small"
          className={Css.padding(0)}
        >
          <Label.L10 color={Colors.Branding.Blue}>+Add Field</Label.L10>
        </Button>
      </Flex.Col>
    </Flex.Col>
  );
};
export default EventPropsView;
