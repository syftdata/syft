import { css } from "@emotion/css";
import { Colors } from "../common/styles/colors";
import { Css, Flex } from "../common/styles/common.styles";
import { Label, Paragraph } from "../common/styles/fonts";
import { EventTag, ReactElement } from "../types";
import { Field, EventSchema } from "@syftdata/common/lib/types";
import { IconButton } from "../common/components/core/Button/IconButton";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import PropSelectorModal from "./PropSelectorModal";
import { useState } from "react";
import Button from "../common/components/core/Button/Button";

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

const getValueFromSource = (fields: string[], element: ReactElement): any => {
  if (fields.length === 0) {
    return undefined;
  }
  if (fields[0] !== "parent") {
    return getValue(fields, element.reactSource.props);
  } else if (element.parent != null) {
    return getValueFromSource(fields.slice(1), element.parent);
  }
};

const __getValueFromSource = (
  schema: EventSchema,
  fieldName: string,
  fields: string[],
  element: ReactElement
): any => {
  const val = getValueFromSource(fields, element);
  if (val === undefined) {
    switch (schema.name) {
      case "ProductListViewed":
        switch (fieldName) {
          case "list_id":
            return element.reactSource.name === "InfiniteProducts"
              ? "store"
              : "product";
          case "category":
            return "default";
          default:
            return;
        }
      case "ProductClicked":
        switch (fieldName) {
          case "category":
            return "default";
          case "position":
            return 0;
          default:
            return;
        }
      case "ProductViewed":
        switch (fieldName) {
          case "category":
            return "default";
          default:
            return;
        }
      case "ProductAdded":
        switch (fieldName) {
          case "category":
            return "default";
          default:
            return;
        }
      default:
        return;
    }
  } else {
    if (fieldName === "url") {
      if (!(val as string).startsWith("http")) {
        return `http://localhost:8000/products/${val}`;
      }
    }
  }
  return val;
};

const FieldRenderer = ({
  data,
  field,
  onUpdate,
  onDelete,
}: {
  data: SchemaAndElement;
  field: Field;
  onUpdate: (field: Field, oldField: Field) => void;
  onDelete: (field: Field) => void;
}) => {
  const sourceField = field.rename ?? field.name;
  const value = __getValueFromSource(
    data.schema,
    field.name,
    sourceField.split("."),
    data.tag
  );
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
      <LabelledValue label="Name" onClick={onChangeAttempt}>
        <Paragraph.P10>{field.name}</Paragraph.P10>
      </LabelledValue>
      {field.rename && (
        <LabelledValue label="Source" onClick={onChangeAttempt}>
          <Paragraph.P10>{field.rename}</Paragraph.P10>
        </LabelledValue>
      )}
      <Paragraph.P10
        color={Colors.Secondary.Orange}
        className={Css.textEllipsisCss}
      >
        {value !== undefined ? value.toString().substring(0, 20) : "N/A"}
      </Paragraph.P10>
      <Flex.Row className={Flex.grow(1)}></Flex.Row>
      <IconButton icon="edit" onClick={onChangeAttempt} />
      <IconButton icon="trash" onClick={() => onDelete(field)} />
      <PropSelectorModal
        open={showActionModal}
        tag={data.tag}
        field={field}
        updateField={(newField) => {
          onUpdate(newField, field);
        }}
        onClose={() => setShowActionModal(false)}
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
  const [showActionModal, setShowActionModal] = useState(false);
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
          onUpdate={(newField, oldField) => {
            const schema = {
              ...data.schema,
              fields: data.schema.fields.map((f) =>
                f === oldField ? newField : f
              ),
            };
            onUpdate({
              schema,
              tag: data.tag,
            });
          }}
          onDelete={(field) => {
            const schema = {
              ...data.schema,
              fields: data.schema.fields.filter((f) => f !== field),
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
            setShowActionModal(true);
          }}
          type="Clear"
          size="small"
          className={Css.padding(0)}
        >
          <Label.L10 color={Colors.Branding.Blue}>+Add Field</Label.L10>
        </Button>
      </Flex.Col>
      <PropSelectorModal
        open={showActionModal}
        tag={data.tag}
        updateField={(newField) => {
          const schema = {
            ...data.schema,
            fields: [...data.schema.fields, newField],
          };
          onUpdate({
            schema,
            tag: data.tag,
          });
        }}
        onClose={() => setShowActionModal(false)}
      />
    </Flex.Col>
  );
};
export default EventPropsView;
