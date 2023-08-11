import { ReactElement } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import { css } from "@emotion/css";
import Section from "../common/components/core/Section";
import { useMemo, useState } from "react";
import Tree from "antd/es/tree/Tree";
import { ROOT_TREE_KEY, getReactElementDataNodes } from "./datanodes";

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
  const [selectedPath, setSelectedPath] = useState(ROOT_TREE_KEY);

  const data = useMemo(() => {
    return getReactElementDataNodes(element);
  }, [element]);

  return (
    <Section title="Elements" expandable={true} defaultExpanded={true}>
      <Tree
        selectable={true}
        showLine={true}
        treeData={[data.root]}
        autoExpandParent={true}
        defaultExpandedKeys={[ROOT_TREE_KEY]}
        selectedKeys={[selectedPath]}
        onSelect={(selectedKeys) => {
          const key = (selectedKeys[0] as string) ?? ROOT_TREE_KEY;
          setSelectedPath(key);
          onClick(data.map.get(key) ?? element);
        }}
        className={css(Css.height(300), Css.overflow("scroll"))}
      />
    </Section>
  );
}
