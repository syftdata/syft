import Tree from "antd/es/tree";
import { ReactElement } from "../types";
import { getDataNodes } from "./datanodes";

export interface ReactPropsViewProps {
  element: ReactElement;
  filterNulls: boolean;
}

export default function ReactPropsView({
  element,
  filterNulls,
}: ReactPropsViewProps) {
  const treeData = getDataNodes(element.reactSource, filterNulls);
  return (
    <Tree
      selectable={false}
      showLine={true}
      treeData={treeData}
      autoExpandParent={true}
      defaultExpandParent={true}
    />
  );
}
