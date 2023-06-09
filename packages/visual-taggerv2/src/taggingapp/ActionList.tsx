import { Action } from "../types";
import { ActionText } from "./ActionText";
import { Css, Flex } from "../common/styles/common.styles";
import List from "../common/components/core/List";
import { css } from "@emotion/css";
import { IconButton } from "../common/components/core/Button/IconButton";

export interface ActionListProps {
  actions: Action[];
  startAttachFlow?: (action: Action) => void;
  className?: string;
}
export default function ActionList({
  actions,
  startAttachFlow,
  className,
}: ActionListProps) {
  return (
    <List<Action>
      data={actions}
      emptyMessage="Start interacting with your application to see actions here."
      renderItem={(action) => {
        return (
          <Flex.Row
            gap={4}
            alignItems="center"
            className={css(Flex.grow(1), Css.padding("4px 0px"))}
          >
            <Flex.Row
              className={Flex.grow(1)}
              alignItems="center"
              justifyContent="space-between"
            >
              <ActionText action={action} className={Css.margin("0px 6px")} />
              {startAttachFlow && (
                <IconButton
                  icon="plus-circle"
                  onClick={() => {
                    startAttachFlow(action);
                  }}
                />
              )}
            </Flex.Row>
          </Flex.Row>
        );
      }}
      className={className}
    />
  );
}
