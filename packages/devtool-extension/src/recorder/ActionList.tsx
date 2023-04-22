import { Action, isSupportedActionType } from "../types";

import { Flex } from "../common/styles/common.styles";
import { Label } from "../common/styles/fonts";
import { ActionText2 } from "../common/ActionText";

function ActionListItem({
  action,
  stepNumber,
}: {
  action: Action;
  stepNumber: number;
}) {
  return (
    <Flex.Row alignItems="center" gap={4}>
      <Label.L12>{stepNumber}. </Label.L12>
      <ActionText2 action={action} />
    </Flex.Row>
  );
}

export default function ActionList({ actions }: { actions: Action[] }) {
  return (
    <Flex.Col className="ActionList">
      {actions
        .filter((action) => isSupportedActionType(action.type))
        .map((action, i) => (
          <ActionListItem
            key={`${action.type}-${i}`}
            action={action}
            stepNumber={i + 1}
          />
        ))}
    </Flex.Col>
  );
}
