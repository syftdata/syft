import { EventSchema, Field } from "@syftdata/common/lib/types";
import SyftTable from "../../common/components/core/Table/SyftTable";
import { Label, Paragraph } from "../../common/styles/fonts";
import { __getValueFromSource } from "./utils";
import { Colors } from "../../common/styles/colors";
import { Css, Flex } from "../../common/styles/common.styles";
import { IconButton } from "../../common/components/core/Button/IconButton";
import { useState } from "react";
import PropSelectorModal from "./PropSelectorModal";
import { css } from "@emotion/css";
import Button from "../../common/components/core/Button/Button";
import { EventTag } from "../../types";

export interface SchemaAndElement {
  schema: EventSchema;
  tag: EventTag;
}

const Columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (value: string) => <Paragraph.P10>{value}</Paragraph.P10>,
  },
  {
    title: "Value",
    dataIndex: "value",
    key: "value",
    width: 100,
    render: (value: string) => (
      <Paragraph.P10
        color={Colors.Secondary.Orange}
        className={Css.textEllipsisCss}
      >
        {value !== undefined ? value.toString().substring(0, 20) : "N/A"}
      </Paragraph.P10>
    ),
  },
  {
    title: "Source",
    dataIndex: "source",
    key: "source",
    width: 150,
    render: (value: string) => <Paragraph.P10>{value}</Paragraph.P10>,
  },
  {
    dataIndex: "actions",
    key: "actions",
    render: (value: any, record: any) => (
      <Flex.Row gap={4}>
        <IconButton icon="edit" onClick={value.onEdit} />
        <IconButton icon="trash" onClick={value.onDelete} />
      </Flex.Row>
    ),
  },
];

const EventPropsViewV2 = ({
  data,
  onUpdate,
}: {
  data: SchemaAndElement;
  onUpdate: (data: SchemaAndElement) => void;
}) => {
  const [showActionModal, setShowActionModal] = useState(false);
  const [activeField, setActiveField] = useState<Field | undefined>(undefined);

  const columnData = data.schema.fields.map((field, index) => {
    const sourceField = field.rename ?? field.name;
    return {
      name: field.name,
      value: __getValueFromSource(
        data.schema,
        field.name,
        sourceField.split("."),
        data.tag
      ),
      source: field.rename,
      field: field,
      actions: {
        onEdit: () => {
          setActiveField(field);
          setShowActionModal(true);
        },
        onDelete: () => {
          const schema = {
            ...data.schema,
            fields: data.schema.fields.filter((f) => f !== field),
          };
          onUpdate({
            schema,
            tag: data.tag,
          });
        },
      },
    };
  });
  return (
    <Flex.Col
      gap={4}
      className={css(Flex.grow(1), Css.padding("0px 0px 0px 24px"))}
    >
      <SyftTable
        columns={Columns}
        data={columnData}
        showHeader={true}
        emptyMessage="No fields"
        className={css(
          {
            "& .ant-table-thead > tr > th": {
              fontSize: 8,
              color: Colors.Gray.V5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.08,
            },
          },
          Css.padding(0),
          Css.border("none !important")
        )}
      />
      <Flex.Col alignItems="center">
        <Button
          onClick={() => {
            setActiveField(undefined);
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
        key={activeField?.name}
        field={activeField}
        updateField={(newField, oldField) => {
          const newFields = oldField
            ? data.schema.fields.map((f) => (f === oldField ? newField : f))
            : [...data.schema.fields, newField];
          const schema = {
            ...data.schema,
            fields: newFields,
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
export default EventPropsViewV2;
