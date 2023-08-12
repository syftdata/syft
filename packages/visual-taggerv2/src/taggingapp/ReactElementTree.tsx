import { ReactElement } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import { css } from "@emotion/css";
import Section from "../common/components/core/Section";
import { useMemo, useState } from "react";
import Tree from "antd/es/tree/Tree";
import { ROOT_TREE_KEY, getReactElementDataNodes } from "./datanodes";
import { getUniqueKey } from "./merge";

export interface ReactElementTreeProps {
  element: ReactElement;
  selectedElement: ReactElement;
  onClick: (element: ReactElement) => void;
}

// calculate datanodes for the tree
export default function ReactElementTree({
  element,
  selectedElement,
  onClick,
}: ReactElementTreeProps) {
  const data = useMemo(() => {
    return getReactElementDataNodes(element);
  }, [element]);
  const key = getUniqueKey(selectedElement);
  const path = data.uniqueKeyToPathMap.get(key) ?? ROOT_TREE_KEY;
  return (
    <Section title="Elements" expandable={true} defaultExpanded={true}>
      <Tree
        selectable={true}
        showLine={true}
        treeData={[data.root]}
        autoExpandParent={true}
        defaultExpandedKeys={[ROOT_TREE_KEY]}
        selectedKeys={[path]}
        onSelect={(selectedKeys) => {
          const key = (selectedKeys[0] as string) ?? ROOT_TREE_KEY;
          onClick(data.elementMap.get(key) ?? element);
        }}
        className={css(Css.height(300), Css.overflow("scroll"))}
      />
    </Section>
  );
}
