import Tree, { TreeProps } from "antd/es/tree";
import { ReactElement } from "../types";
import { EventSchema } from "@syftdata/common/lib/types";
import { getDataNodes } from "./datanodes";

export interface EventPropsViewProps {
  element: ReactElement;
  schema: EventSchema;
  onEdit: (schema: EventSchema) => void;
  filterNulls: boolean;
  className: string;
}

export default function EventPropsView({
  element,
  schema,
  onEdit,
  filterNulls,
  className,
}: EventPropsViewProps) {
  // const fields = schema.fields.map((f) => [f.rename ?? f.name, f]);
  // const fieldKeyToFieldMap = new Map(
  //   schema.fields.map((f) => [f.rename ?? f.name, f])
  // );
  const checkedKeys = schema.fields.map((f) => f.rename ?? f.name);
  const treeData = getDataNodes(element.reactSource, filterNulls);
  console.log(">>> checked keys are ", checkedKeys, treeData);
  // now pass fieldkeys as selected ones.

  const onCheck: TreeProps["onCheck"] = (checkedKeys, info) => {
    //const existingCheckedKeys = new Set(fieldKeyToFieldMap.keys());
    console.log("onCheck", checkedKeys, info);
    onEdit(schema);
  };

  return (
    <Tree
      checkable
      selectable={false}
      autoExpandParent={true}
      defaultExpandParent={true}
      showLine={true}
      onCheck={onCheck}
      defaultCheckedKeys={checkedKeys}
      treeData={treeData}
      className={className}
    />
  );
}
