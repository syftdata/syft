// this react component renders a list of items of type T.
// gives a method to render each component.

import React, { useState } from "react";
import { Css, Flex } from "../../../styles/common.styles";
import { css } from "@emotion/css";
import Icon from "../Icon/Icon";
import { Colors } from "../../../styles/colors";

export interface SearchProps {
  searchPlaceHolder: string;
  search: string;
  setSearch: (val: string) => void;
}

export interface ExpandableProps<T> {
  renderItem: (item: T) => React.ReactNode;
}

export interface ListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  search?: SearchProps;
  expandable?: ExpandableProps<T>;
}

interface ListItemProps<T> {
  expandable?: ExpandableProps<T>;
  renderItem: (item: T) => React.ReactNode;
  item: T;
}

function ListItem<T>({ item, renderItem, expandable }: ListItemProps<T>) {
  const [expanded, setExpanded] = useState(false);
  if (!expandable) {
    return <>{renderItem(item)}</>;
  }
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  return (
    <Flex.Col>
      <Flex.Row onClick={toggleExpanded} gap={4} alignItems="center">
        <Icon icon={expanded ? "chevron-down" : "chevron-right"} />
        {renderItem(item)}
      </Flex.Row>
      <Flex.Row className={expanded ? "" : Css.display("none !important")}>
        {expandable.renderItem(item)}
      </Flex.Row>
    </Flex.Col>
  );
}

function List<T>({
  data,
  expandable,
  renderItem,
  className,
  search,
}: ListProps<T>) {
  const TypedListItem = ListItem<T>;
  return (
    <Flex.Col className={className}>
      {search && (
        <Flex.Row gap={8} className={Css.padding(4)} alignItems="center">
          <Icon icon="search" />
          <input
            type="text"
            className={"text-md w-[150px] font-medium text-[#1c1e27]"}
            placeholder={search.searchPlaceHolder}
            value={search.search}
            onChange={(e) => search.setSearch(e.target.value)}
          />
        </Flex.Row>
      )}
      {data.map((item, index) => {
        return (
          <Flex.Row
            key={index}
            className={css(
              Css.border(`1px solid ${Colors.Gray.V1}`),
              Css.padding("2px 6px")
            )}
          >
            <TypedListItem
              item={item}
              renderItem={renderItem}
              expandable={expandable}
            />
          </Flex.Row>
        );
      })}
    </Flex.Col>
  );
}

export default List;
