import Tree, { DataNode, TreeProps } from "antd/es/tree";
import { ReactElement } from "../types";
import {
  MyDataNode,
  getDefaultExpandedKeys,
  getPropDataNodes,
  getPropDataNodesV2,
} from "./datanodes";
import { useMemo, useState } from "react";
import Search from "antd/es/input/Search";
import { Flex } from "../common/styles/common.styles";

export interface PropSelectionViewProps {
  element: ReactElement;
  defaultSearchValue?: string;
  onAddField: (key: string) => void;

  filterNulls: boolean;
  className?: string;
}

export default function PropSelectionView({
  element,
  defaultSearchValue,
  onAddField,

  filterNulls,
  className,
}: PropSelectionViewProps) {
  const [searchValue, setSearchValue] = useState(defaultSearchValue ?? "");

  // const { root } = getPropDataNodesV2(element, filterNulls);
  // const treeData = root ? root.children : [];

  const defaultData = getPropDataNodes(element, filterNulls);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const treeData = useMemo(() => {
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

  // now pass fieldkeys as selected ones.
  const onCheck: TreeProps["onCheck"] = (checkedKeys, info) => {
    if (info.checked) {
      onAddField(info.node.key as string);
    }
  };

  const onSelect: TreeProps["onSelect"] = (selectedKeys, info) => {
    if (info.selected) {
      onAddField(info.node.key as string);
    }
  };

  const elementKeys = getDefaultExpandedKeys(treeData);
  return (
    <Flex.Col gap={8}>
      <Search
        placeholder="Search"
        onChange={onSearchChange}
        defaultValue={defaultSearchValue}
      />
      <Tree
        checkable={true}
        autoExpandParent={true}
        defaultExpandParent={true}
        defaultExpandedKeys={elementKeys}
        showLine={true}
        onCheck={onCheck}
        onSelect={onSelect}
        treeData={treeData}
        className={className}
      />
    </Flex.Col>
  );
}
