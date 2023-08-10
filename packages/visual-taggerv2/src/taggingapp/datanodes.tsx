import { DataNode } from "antd/es/tree";
import { ReactSource } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import { Paragraph } from "../common/styles/fonts";
import { Colors } from "../common/styles/colors";

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
        const valueSubstring = `${value}`.substring(0, 10);
        title = (
          <Flex.Row gap={8}>
            <Paragraph.P12 color={Colors.Branding.DarkBlue}>
              {key}
            </Paragraph.P12>
            <Paragraph.P10
              color={Colors.Secondary.Orange}
              className={Css.textOverflow("elipsis")}
            >
              {valueSubstring}
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

export function getDataNodes(
  source: ReactSource,
  filterNulls: boolean,
  dataKey?: string
): DataNode[] | undefined {
  const reactProps = source.props ?? {};
  let nodes = getDataNodesFromObj(reactProps, filterNulls, dataKey);
  if (source.parent) {
    const parentKey = getKey(dataKey, "parent");
    const children = getDataNodes(source.parent, filterNulls, parentKey);
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
