import Tree, { TreeProps } from "antd/es/tree";
import { ReactElement } from "../types";
import {
  getDefaultExpandedKeys,
  getPropDataNodes,
  getPropDataNodesV2,
} from "./datanodes";
import { Paragraph } from "../common/styles/fonts";

export interface PropSelectionViewProps {
  element: ReactElement;

  onAddField: (key: string) => void;

  filterNulls: boolean;
  className?: string;
}

export default function PropSelectionView({
  element,
  onAddField,

  filterNulls,
  className,
}: PropSelectionViewProps) {
  // const { root } = getPropDataNodesV2(element, filterNulls);
  // const treeData = root ? root.children : [];

  const treeData = getPropDataNodes(element, filterNulls);
  const elementKeys = getDefaultExpandedKeys(treeData);

  if (treeData == null || treeData.length === 0) {
    return <Paragraph.P10>No props available</Paragraph.P10>;
  }

  // now pass fieldkeys as selected ones.
  const onCheck: TreeProps["onCheck"] = (checkedKeys, info) => {
    if (info.checked) {
      onAddField(info.node.key as string);
    }
  };

  return (
    <Tree
      checkable={true}
      autoExpandParent={true}
      defaultExpandParent={true}
      defaultExpandedKeys={elementKeys}
      showLine={true}
      onCheck={onCheck}
      treeData={treeData}
      className={className}
    />
  );
}
