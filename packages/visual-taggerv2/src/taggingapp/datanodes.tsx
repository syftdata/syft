import { DataNode } from "antd/es/tree";
import { ReactElement } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono, Paragraph } from "../common/styles/fonts";
import { Colors } from "../common/styles/colors";
import { getUniqueKey } from "./merge";

export const ROOT_TREE_KEY = "";
function getKey(parentKey: string | undefined, fieldName: string): string {
  if (parentKey == null) return fieldName;
  return `${parentKey}.${fieldName}`;
}

export type MyDataNode = DataNode & {
  value?: any;
};

export function getDataNodesFromObj(
  obj: Record<string, any> | Array<any> | undefined,
  filterNulls: boolean,
  datakey?: string
): MyDataNode[] | undefined {
  let nodes = Object.entries(obj ?? {})
    .map(([key, value]) => {
      if (filterNulls && value == null) return;

      let children: DataNode[] | undefined;
      let title: React.ReactNode = key;
      let checkable = true;
      let isLeaf = true;
      const dataKey2 = getKey(datakey, key);

      if (typeof value === "object") {
        children = getDataNodesFromObj(value, filterNulls, dataKey2);
        if (children == null || children.length === 0) return;
        isLeaf = false;
        title = <Paragraph.P12>{key}</Paragraph.P12>;
      } else {
        title = (
          <Flex.Row gap={8} alignItems="center">
            <Paragraph.P12 color={Colors.Branding.DarkBlue}>
              {key}
            </Paragraph.P12>
            <Paragraph.P10
              color={Colors.Secondary.Orange}
              className={Css.textTruncate(1)}
            >
              {value}
            </Paragraph.P10>
          </Flex.Row>
        );
      }
      return {
        title,
        key: dataKey2,
        children,
        checkable,
        isLeaf,
        value,
      };
    })
    .filter((node) => node != null) as MyDataNode[];

  if (nodes.length === 0 && filterNulls) return undefined;
  return nodes;
}

export function getPropDataNodes(
  element: ReactElement,
  filterNulls: boolean,
  dataKey?: string
): MyDataNode[] | undefined {
  const reactProps = element.reactSource.props ?? {};
  let nodes = getDataNodesFromObj(reactProps, filterNulls, dataKey);
  if (element.parent) {
    const parentElement = element.parent;
    const parentKey = getKey(dataKey, "parent");
    const children = getPropDataNodes(parentElement, filterNulls, parentKey);
    if (children != null && children.length > 0) {
      nodes = nodes ?? [];
      nodes.push({
        title: (
          <Paragraph.P12>
            {parentElement.reactSource.name ?? parentElement.tagName} (parent)
          </Paragraph.P12>
        ),
        key: parentKey,
        children,
        checkable: true,
      });
    }
  }
  return nodes;
}

// Put parent prop at the first.
export function getPropDataNodesV2(
  element: ReactElement,
  filterNulls: boolean,
  dataKey: string = ""
): { root?: MyDataNode; current?: MyDataNode } {
  // element should return its parent if it has one, and put itself in parent's children nodes.
  const reactProps = element.reactSource.props ?? {};
  const childrenNodes =
    getDataNodesFromObj(reactProps, filterNulls, dataKey) ?? [];

  if (childrenNodes.length === 0 && filterNulls) {
    return {};
  }

  const current: MyDataNode = {
    title: (
      <Paragraph.P12>
        {element.reactSource.name ?? element.tagName}
      </Paragraph.P12>
    ),
    key: dataKey,
    children: childrenNodes,
    checkable: false,
  };

  if (element.parent) {
    const parentData = getPropDataNodesV2(
      element.parent,
      filterNulls,
      getKey(dataKey, "parent")
    );
    const { root, current: parentNode } = parentData;
    if (parentNode != null) {
      // create a node with children as parentNodes + current node.
      parentNode.children = [current, ...(parentNode.children ?? [])];
    }
    return { root, current };
  }
  return { root: current, current };
}

export function getReactElementDataNodes(
  element: ReactElement,
  enrichedElements: ReactElement[]
) {
  const elementMap = new Map<string, ReactElement>();
  const uniqueKeyToPathMap = new Map<string, string>();

  const _uniqueKeyToEnrichedhMap = new Map<string, ReactElement>();
  enrichedElements.forEach((e) => {
    _uniqueKeyToEnrichedhMap.set(getUniqueKey(e), e);
  });

  const traverse = (element: ReactElement, key: string) => {
    if (element == null) {
      return null;
    }
    const uniqueKey = getUniqueKey(element);
    uniqueKeyToPathMap.set(uniqueKey, key);
    const enrichedElement = _uniqueKeyToEnrichedhMap.get(uniqueKey) ?? element;
    elementMap.set(key, enrichedElement);

    const componentName = enrichedElement.reactSource.name;
    const text =
      componentName != null && componentName != ""
        ? componentName
        : enrichedElement.tagName;
    const subText = enrichedElement.selectors.text;
    const eventCount = Object.values(enrichedElement.handlerToEvents).reduce(
      (val, events) => val + events.length,
      0
    );

    const node: MyDataNode = {
      title: (
        <Flex.Row gap={8} alignItems="center">
          <Paragraph.P12>{text}</Paragraph.P12>
          <Paragraph.P10 color={Colors.Secondary.Orange}>
            {subText && subText.length <= 30 ? subText : ""}
          </Paragraph.P10>
          {eventCount > 0 && (
            <Mono.M10 color={Colors.Gray.V5}>{eventCount} Event(s)</Mono.M10>
          )}
        </Flex.Row>
      ),
      key,
    };
    if (element.children) {
      node.children = element.children
        .map((child, idx) => traverse(child, getKey(key, `${idx}`)))
        .filter((n) => n != null) as MyDataNode[];
    }
    return node;
  };
  return {
    root: traverse(element, ROOT_TREE_KEY) ?? {
      title: "None",
      key: ROOT_TREE_KEY,
    },
    elementMap,
    uniqueKeyToPathMap,
  };
}

export function getDefaultExpandedKeys(
  nodes: MyDataNode[] | undefined
): string[] {
  if (nodes == null || nodes.length === 0) {
    return [];
  }
  // if there is only one node, expand its children.
  if (nodes.length === 1 && nodes[0].children != null) {
    const childKeys = getDefaultExpandedKeys(nodes[0].children);
    if (childKeys.length > 0) {
      return childKeys;
    }
  }

  // always expand first level of nodes.
  return nodes.map((n) => n.key as string);
}
