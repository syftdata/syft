import {
  getBestSelectorForAction,
  getBestSelectorsForAction,
} from "../builders/selector";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import Section from "../common/components/core/Section";
import { Css, Flex } from "../common/styles/common.styles";
import { ReactElement } from "../types";
import ReactPropsView from "./ReactPropsView";
import Screenshots from "./Screenshots";

export interface ReactElementViewProps {
  element: ReactElement;
}

export default function ReactElementView({ element }: ReactElementViewProps) {
  //const screenshots = element.events?.map((e) => e.screenshot);
  const source = element.reactSource;
  const selectors = getBestSelectorsForAction(element);
  return (
    <Section title="Element Details" expandable={true} defaultExpanded={false}>
      <Flex.Col gap={8} className={Css.padding(8)}>
        <LabelledValue
          label="Component"
          value={`${source.name} - ${element.tagName}`}
        />
        <LabelledValue
          label="Source"
          value={`${source.source} L${source.line}`}
        />
        {selectors.map(
          (selector) =>
            selector && <LabelledValue label="CSS Selector" value={selector} />
        )}
        <LabelledValue label="Available Props">
          <ReactPropsView element={element} filterNulls={true} />
        </LabelledValue>
        {/* {screenshots && screenshots.length > 0 && (
          <LabelledValue
            label="Screenshot"
            children={<Screenshots screenshot={screenshots[0]!} />}
          />
        )} */}
      </Flex.Col>
    </Section>
  );
}
