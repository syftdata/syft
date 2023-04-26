import { Action, isSupportedActionType } from "../types";
import { ActionText } from "../common/ActionText";
import { css } from "@emotion/css";
import { Css, Flex } from "../common/styles/common.styles";
import { IconButton } from "../common/components/core/Button";
import { useState } from "react";

export default function ActionList({
  actions,
  onAddEvent,
}: {
  actions: Action[];
  onAddEvent?: (action: Action) => void;
}) {
  const [syftSelector, setSyftSelector] = useState<boolean>(false);
  const _actions = actions.filter((action) =>
    isSupportedActionType(action.type)
  );
  return (
    <Flex.Col className={Css.height("100%")}>
      <Flex.Col>
        {_actions.map((action) => (
          <Flex.Row
            className={css(
              Css.padding("2px 6px"),
              Css.border("1px solid #E7EAF6")
            )}
          >
            <ActionText action={action} className={Flex.grow(1)} />
            {onAddEvent && (
              <IconButton icon="edit" onClick={() => onAddEvent(action)} />
            )}
          </Flex.Row>
        ))}
      </Flex.Col>
      <Flex.Col></Flex.Col>
    </Flex.Col>
  );
}
