import { getBestSelectorForAction } from "../builders/selector";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import { Css, Flex } from "../common/styles/common.styles";
import { Action, ScriptType } from "../types";

export interface ElementViewProps {
  action: Action;
}

export default function ElementView({ action }: ElementViewProps) {
  return (
    <Flex.Col gap={8} className={Css.padding(8)}>
      <LabelledValue
        label="Component"
        value={action.eventSource?.parent?.name}
      />
      <LabelledValue
        label="Selector"
        value={getBestSelectorForAction(action, ScriptType.Playwright)}
      />
    </Flex.Col>
  );
}
