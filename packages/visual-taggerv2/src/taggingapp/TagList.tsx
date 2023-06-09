import { Action } from "../types";
import { ActionText } from "./ActionText";
import { Css, Flex } from "../common/styles/common.styles";
import { IconButton } from "../common/components/core/Button/IconButton";
import List from "../common/components/core/List";
import { Mono } from "../common/styles/fonts";
import { Colors, backgroundCss } from "../common/styles/colors";
import { css } from "@emotion/css";

export interface TagListProps {
  tags: Action[];
  selectedIndex: number;
  onSelect?: (index: number) => void;
  onDelete?: (index: number) => void;
  className?: string;
}
export default function TagList({
  tags,
  selectedIndex,
  onSelect,
  onDelete,
  className,
}: TagListProps) {
  return (
    <List<Action>
      data={tags}
      emptyMessage="Tags will show up when events are attached to actions."
      renderItem={(action, index) => {
        const eventCount = action.events?.length ?? 0;
        return (
          <Flex.Row
            gap={4}
            alignItems="center"
            className={css(
              Flex.grow(1),
              selectedIndex === index && backgroundCss(Colors.Branding.V1),
              selectedIndex === index &&
                Css.border(`1px solid ${Colors.Branding.V5} !important`)
            )}
          >
            <Flex.Row
              className={Flex.grow(1)}
              alignItems="center"
              justifyContent="space-between"
              onClick={() => {
                onSelect && onSelect(index);
              }}
            >
              <ActionText action={action} className={Css.margin("0px 6px")} />
              {eventCount > 0 && <Mono.M10>{eventCount} Events</Mono.M10>}
            </Flex.Row>
            {onDelete && (
              <IconButton
                icon="trash"
                onClick={() => {
                  onDelete(index);
                }}
              />
            )}
          </Flex.Row>
        );
      }}
      className={className}
    />
  );
}
