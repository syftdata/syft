import Tree from "antd/es/tree";
import { ReactElement } from "../types";
import { getDataNodesFromObj, getDefaultExpandedKeys } from "./datanodes";
import { Paragraph } from "../common/styles/fonts";

export interface ReactPropsViewProps {
  element: ReactElement;
  filterNulls: boolean;
  className?: string;
}

export default function ReactPropsView({
  element,
  filterNulls,
  className,
}: ReactPropsViewProps) {
  const treeData = getDataNodesFromObj(element.reactSource.props, filterNulls);
  const elementKeys = getDefaultExpandedKeys(treeData);
  if (treeData == null || treeData.length === 0) {
    return <Paragraph.P10>No props available</Paragraph.P10>;
  }
  return (
    <Tree
      key={element.reactSource.name}
      showLine={true}
      treeData={treeData}
      autoExpandParent={true}
      defaultExpandedKeys={elementKeys}
      className={className}
    />
  );
}
