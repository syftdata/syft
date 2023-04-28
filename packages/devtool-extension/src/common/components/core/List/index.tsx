// this react component renders a list of items of type T.
// gives a method to render each component.

import React, { useState } from "react";
import { Css, Flex } from "../../../styles/common.styles";
import { css } from "@emotion/css";
import Icon from "../Icon/Icon";
import { Colors } from "../../../styles/colors";
import { IconButton } from "../Button";
import { Input } from '../Form/input';

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
}: ListProps<T>) {
  const TypedListItem = ListItem<T>;
  return (
    <Flex.Col className={className}>
      {search && (
        <Flex.Row
          gap={8}
          className={css(Css.padding(4), Css.background(Colors.Gray.V1))}
          alignItems="center"
        >
          <Icon icon="search" />
          <Input.L12
            type="text"
            className={css(
              Css.background(Colors.Gray.V1),
              Css.border("none"),
              Flex.grow(1)
            )}
            placeholder={search.searchPlaceHolder}
            value={search.search}
            onChange={(e) => search.setSearch(e.target.value)}
          />
          {search.actions?.map((action, index) => (
            <React.Fragment key={index}>{action}</React.Fragment>
          ))}
        </Flex.Row>
      )}
      {data.map((item, index) => {
        return (
          <Flex.Row
            key={index}
            className={css(
              Flex.grow(1),
              Css.border(`1px solid ${Colors.Gray.V1}`),
            )}
          >
            <TypedListItem
              item={item}
              renderItem={(item) => renderItem(item, index)}
              expandable={expandable}
            />
          </Flex.Row>
        );
      })}
    </Flex.Col>
  );
}

export default List;
