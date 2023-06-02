// this react component renders a list of items of type T.
// gives a method to render each component.

import React, { useState } from "react";
import { Css, Flex, FlexExtra } from "../../../styles/common.styles";
import { css } from "@emotion/css";
import Icon from "../Icon/Icon";
import { Colors } from "../../../styles/colors";
import { IconButton } from "../Button/IconButton";
import { Input } from "../Form/input";
import { Mono } from "../../../styles/fonts";

export interface SearchProps {
  searchPlaceHolder: string;
  search: string;
  setSearch: (val: string) => void;
  actions?: React.ReactNode[];
}

export interface ExpandableProps<T> {
  isExpanded?: (item: T) => boolean;
  renderItem: (item: T) => React.ReactNode;
}

export interface ListProps<T> {
  data: T[];
  emptyMessage?: string | React.ReactNode;
  renderItem: (item: T, index: number) => React.ReactNode;
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
  const [expanded, setExpanded] = useState(expandable?.isExpanded?.(item));
  if (!expandable) {
    return <>{renderItem(item)}</>;
  }
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  return (
    <Flex.Col className={Flex.grow(1)} gap={8}>
      <Flex.Row gap={4} alignItems="center">
        <IconButton
          onClick={toggleExpanded}
          icon={expanded ? "chevron-down" : "chevron-right"}
        />
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
  emptyMessage,
}: ListProps<T>) {
  const TypedListItem = ListItem<T>;
  const showSearch = search && (data.length > 1 || search.search !== "");
  return (
    <Flex.Col className={className}>
      {showSearch && (
        <FlexExtra.RowWithDivider
          gap={8}
          className={css(Css.padding(4), Css.background(Colors.Gray.V1))}
          alignItems="center"
        >
          <Icon icon="search" />
          <Input.L12
            type="text"
            noBorder={true}
            background={Colors.Gray.V1}
            className={Flex.grow(1)}
            placeholder={search.searchPlaceHolder}
            value={search.search}
            onChange={(e) => search.setSearch(e.target.value)}
          />
          {search.actions?.map((action, index) => (
            <React.Fragment key={index}>{action}</React.Fragment>
          ))}
        </FlexExtra.RowWithDivider>
      )}
      {data.length > 0
        ? data.map((item, index) => {
            return (
              <Flex.Row
                key={index}
                className={css(
                  Flex.grow(1),
                  Css.border(`1px solid ${Colors.Gray.V1}`)
                )}
              >
                <TypedListItem
                  item={item}
                  renderItem={(item) => renderItem(item, index)}
                  expandable={expandable}
                />
              </Flex.Row>
            );
          })
        : emptyMessage && (
            <Flex.Col alignItems="center" className={Css.margin("4px 4px")}>
              <Mono.M14>{emptyMessage}</Mono.M14>
            </Flex.Col>
          )}
    </Flex.Col>
  );
}

export default List;
