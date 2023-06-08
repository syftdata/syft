import { Action } from "../types";
import { ActionText } from "./ActionText";
import { Css, Flex } from "../common/styles/common.styles";
import List from "../common/components/core/List";
import { Mono } from "../common/styles/fonts";
import { Colors, backgroundCss } from "../common/styles/colors";
import { css } from "@emotion/css";

export interface ActionListProps {
  actions: Action[];
  selectedIndex: number;
  onSelect?: (index: number) => void;
  className?: string;
}
export default function ActionList({
  actions,
  selectedIndex,
  onSelect,
  className,
}: ActionListProps) {
  const _actions = actions;
  return (
    <List<Action>
      data={_actions}
      emptyMessage="Start interacting with your application to see actions here."
      renderItem={(action, index) => {
        const eventCount = action.events?.length ?? 0;
        return (
          <Flex.Row
            gap={4}
            alignItems="center"
            className={css(
              Flex.grow(1),
              Css.padding("4px 0px"),
              selectedIndex === index && backgroundCss(Colors.Branding.V1)
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
          </Flex.Row>
        );
      }}
      className={className}
    />
  );
}
