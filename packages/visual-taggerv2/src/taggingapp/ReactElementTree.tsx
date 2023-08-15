import { ReactElement } from "../types";
import { Css } from "../common/styles/common.styles";
import { css } from "@emotion/css";
import Section from "../common/components/core/Section";
import { useEffect, useMemo, useState } from "react";
import Tree from "antd/es/tree/Tree";
import { ROOT_TREE_KEY, getReactElementDataNodes } from "./datanodes";
import { getUniqueKey } from "./merge";

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
    setAutoExpandParent(true);
  }, [path]);

  return (
    <Section title="Elements" expandable={true} defaultExpanded={true}>
      <Tree
        selectable={true}
        showLine={true}
        treeData={[data.root]}
        autoExpandParent={autoExpandParent}
        expandedKeys={expandedKeys}
        selectedKeys={[path]}
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
        className={css(Css.height(300), Css.overflow("scroll"))}
      />
    </Section>
  );
}
