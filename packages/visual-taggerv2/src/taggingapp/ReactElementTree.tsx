import { ReactElement } from "../types";
import Section from "../common/components/core/Section";
import { useEffect, useMemo, useRef, useState } from "react";
import Tree from "antd/es/tree/Tree";
import { ROOT_TREE_KEY, getReactElementDataNodes } from "./datanodes";
import { getUniqueKey } from "./merge";
import type RcTree from "rc-tree";

export interface ReactElementTreeProps {
  rootElement: ReactElement;
  elements: ReactElement[];
  selectedElement: ReactElement;
  onClick: (element?: ReactElement) => void;
}

// calculate datanodes for the tree
export default function ReactElementTree({
  rootElement,
  elements,
  selectedElement,
  onClick,
}: ReactElementTreeProps) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const treeRef = useRef<RcTree>(null);

  const data = useMemo(() => {
    return getReactElementDataNodes(rootElement, elements);
  }, [rootElement, elements]);

  const key = getUniqueKey(selectedElement);
  const path = data.uniqueKeyToPathMap.get(key) ?? ROOT_TREE_KEY;

  useEffect(() => {
    setExpandedKeys((expandedKeys) => {
      if (expandedKeys.includes(path)) {
        return expandedKeys;
      }
      return [...expandedKeys, path];
    });
    treeRef.current?.scrollTo({ key: path, align: "top" });
    setAutoExpandParent(true);
  }, [path]);

  return (
    <Section title="Elements" expandable={true} defaultExpanded={true}>
      <Tree
        ref={treeRef}
        selectable={true}
        showLine={true}
        treeData={[data.root]}
        autoExpandParent={autoExpandParent}
        expandedKeys={expandedKeys}
        selectedKeys={[path]}
        height={300}
        onExpand={(expandedKeys) => {
          setExpandedKeys(expandedKeys as string[]);
          setAutoExpandParent(false);
        }}
        onSelect={(selectedKeys, info) => {
          if (info.selected === false) {
            onClick();
          } else {
            const key = info.node.key as string;
            onClick(data.elementMap.get(key));
          }
        }}
      />
    </Section>
  );
}
