import Tree, { TreeProps } from "antd/es/tree";
import { ReactElement } from "../types";
import { EventSchema } from "@syftdata/common/lib/types";
import { getPropDataNodes } from "./datanodes";

export interface ReactPropsViewProps {
  element: ReactElement;

  schema?: EventSchema;
  onAddField?: (key: string) => void;

  expandAll?: boolean;
  filterNulls: boolean;
  className?: string;
}

export default function ReactPropsView({
  element,
  schema,
  onAddField,

  expandAll,
  filterNulls,
  className,
}: ReactPropsViewProps) {
  // const fields = schema.fields.map((f) => [f.rename ?? f.name, f]);
  // const fieldKeyToFieldMap = new Map(
  //   schema.fields.map((f) => [f.rename ?? f.name, f])
  // );
  const checkedKeys = schema
    ? schema.fields.map((f) => f.rename ?? f.name)
    : [];
  const treeData = getPropDataNodes(element.reactSource, filterNulls);
  // now pass fieldkeys as selected ones.
  const onCheck: TreeProps["onCheck"] = (checkedKeys, info) => {
    if (!onAddField) {
      return;
    }
    //const existingCheckedKeys = new Set(fieldKeyToFieldMap.keys());
    console.log("onCheck", checkedKeys, info);
    if (info.checked) {
      onAddField(info.node.key as string);
    }
  };

  return (
    <Tree
      checkable={onAddField != undefined}
      autoExpandParent={true}
      defaultExpandParent={true}
      defaultExpandAll={expandAll}
      showLine={true}
      onCheck={onCheck}
      defaultCheckedKeys={checkedKeys}
      treeData={treeData}
      className={className}
    />
  );
}
