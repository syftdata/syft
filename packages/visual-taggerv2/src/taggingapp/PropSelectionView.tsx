import Tree, { DataNode, TreeProps } from "antd/es/tree";
import { ReactElement } from "../types";
import {
  MyDataNode,
  getDefaultExpandedKeys,
  getPropDataNodes,
  getPropDataNodesV2,
} from "./datanodes";
import { forwardRef, useMemo } from "react";
import type RcTree from "rc-tree";

export interface PropSelectionViewProps {
  element: ReactElement;
  searchValue?: string;
  checkedKey?: string;
  filterNulls: boolean;
  className?: string;
}

const PropSelectionView = forwardRef<RcTree, PropSelectionViewProps>(
  ({ element, checkedKey, searchValue, filterNulls, className }, ref) => {
    // const { root } = getPropDataNodesV2(element, filterNulls);
    // const treeData = root ? root.children : [];

    const defaultData = getPropDataNodes(element, filterNulls);

    const treeData = useMemo(() => {
      if (searchValue == null || searchValue === "") {
        return defaultData;
      }
      const query = searchValue.toLowerCase();
      const loop = (data: MyDataNode[]): MyDataNode[] => {
        return data
          .map((item) => {
            if (item.children) {
              const matchedChildren = loop(item.children);
              if (matchedChildren.length > 0) {
                return { ...item, children: matchedChildren };
              }
            }
            const key = (item.key as string).toLowerCase();
            if (checkedKey && checkedKey === key) {
              return item;
            }
            if (key.includes(query)) {
              return item;
            }
            // search for value as well.
            if (
              item.value &&
              item.value.toString().toLowerCase().includes(query)
            ) {
              return item;
            }
          })
          .filter((a) => a != null) as DataNode[];
      };
      return loop(defaultData ?? []);
    }, [searchValue, defaultData]);

    const elementKeys = getDefaultExpandedKeys(treeData);
    return (
      <Tree
        ref={ref}
        checkable={true}
        autoExpandParent={true}
        defaultExpandParent={true}
        defaultExpandedKeys={elementKeys}
        defaultCheckedKeys={checkedKey ? [checkedKey] : []}
        showLine={true}
        treeData={treeData}
        className={className}
        height={300}
      />
    );
  }
);
export default PropSelectionView;
