import { getBestSelectorForAction } from "../builders/selector";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import { Css, Flex } from "../common/styles/common.styles";
import { Action, ScriptType } from "../types";
import Screenshots from "./Screenshots";

export interface ElementViewProps {
  action: Action;
}

export default function ElementView({ action }: ElementViewProps) {
  const screenshots = action.events?.map((e) => e.screenshot);
  return (
    <Flex.Col gap={8} className={Css.padding(8)}>
      <LabelledValue label="DOM Event" value={action.type} />
      <LabelledValue
        label="React Component"
        value={action.eventSource?.parent?.name}
      />
      <LabelledValue
        label="CSS Selector"
        value={getBestSelectorForAction(action, ScriptType.Playwright)}
      />
      {screenshots && screenshots.length > 0 && (
        <LabelledValue
          label="Screenshot"
          children={<Screenshots screenshot={screenshots[0]!} />}
        />
      )}
    </Flex.Col>
  );
}
