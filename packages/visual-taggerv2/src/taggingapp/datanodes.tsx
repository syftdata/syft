import { DataNode } from "antd/es/tree";
import { ReactElement, ReactSource } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import { Paragraph } from "../common/styles/fonts";
import { Colors } from "../common/styles/colors";

export const ROOT_TREE_KEY = "";
function getKey(parentKey: string | undefined, fieldName: string): string {
  if (parentKey == null) return fieldName;
  return `${parentKey}.${fieldName}`;
}

function getDataNodesFromObj(
  obj: Record<string, any> | Array<any> | undefined,
  filterNulls: boolean,
  datakey?: string
): DataNode[] | undefined {
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
        checkable = false;
        isLeaf = false;
        title = <Paragraph.P12>{key}</Paragraph.P12>;
      } else {
        title = (
          <Flex.Row gap={8}>
            <Paragraph.P12 color={Colors.Branding.DarkBlue}>
              {key}
            </Paragraph.P12>
            <Paragraph.P10
              color={Colors.Secondary.Orange}
              className={Css.textOverflow("elipsis")}
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
      };
    })
    .filter((node) => node != null) as DataNode[];

  if (nodes.length === 0 && filterNulls) return undefined;
  return nodes;
}

export function getPropDataNodes(
  source: ReactSource,
  filterNulls: boolean,
  dataKey?: string
): DataNode[] | undefined {
  const reactProps = source.props ?? {};
  let nodes = getDataNodesFromObj(reactProps, filterNulls, dataKey);
  if (source.parent) {
    const parentKey = getKey(dataKey, "parent");
    const children = getPropDataNodes(source.parent, filterNulls, parentKey);
    if (children != null && children.length > 0) {
      nodes = nodes ?? [];
      nodes.push({
        title: <Paragraph.P12>Parent</Paragraph.P12>,
        key: parentKey,
        children,
        checkable: false,
      });
    }
  }
  return nodes;
}

export function getReactElementDataNodes(element: ReactElement) {
  const elementMap = new Map<string, ReactElement>();
  const traverse = (element: ReactElement, key: string) => {
    if (element == null) {
      return null;
    }
    const text = element.reactSource.name ?? element.tagName;
    const subText = element.selectors.text;
    const eventCount = Object.values(element.handlerToEvents).reduce(
      (val, events) => val + events.length,
      0
    );

    const node: DataNode = {
      title: (
        <Flex.Row gap={8}>
          <Paragraph.P12>{text}</Paragraph.P12>
          <Paragraph.P10 color={Colors.Secondary.Orange}>
            {subText && subText.length <= 30 ? subText : ""}
          </Paragraph.P10>
          {eventCount > 0 && (
            <Paragraph.P10 color={Colors.Secondary.Green}>
              {eventCount} Events
            </Paragraph.P10>
          )}
        </Flex.Row>
      ),
      key,
    };
    elementMap.set(key, element);
    if (element.children) {
      node.children = element.children
        .map((child, idx) => traverse(child, getKey(key, `${idx}`)))
        .filter((n) => n != null) as DataNode[];
    }
    return node;
  };
  return {
    root: traverse(element, ROOT_TREE_KEY) ?? {
      title: "None",
      key: ROOT_TREE_KEY,
    },
    map: elementMap,
  };
}
