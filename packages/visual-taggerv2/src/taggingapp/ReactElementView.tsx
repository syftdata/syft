import {
  getBestSelectorForAction,
  getBestSelectorsForAction,
} from "../builders/selector";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import Section from "../common/components/core/Section";
import { Colors } from "../common/styles/colors";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono, Paragraph } from "../common/styles/fonts";
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
        <LabelledValue label="Component">
          <Flex.Row gap={8}>
            <Paragraph.P12>{source.name}</Paragraph.P12>
            <Mono.M10 color={Colors.Secondary.Orange}>
              {element.tagName}
            </Mono.M10>
          </Flex.Row>
        </LabelledValue>
        <LabelledValue label="Available Props">
          <ReactPropsView element={element} filterNulls={true} />
        </LabelledValue>
        <LabelledValue
          label="Source"
          value={`${source.source} L${source.line}`}
        />
        <LabelledValue label="CSS Selectors">
          {selectors.map(
            (selector) =>
              selector && (
                <Paragraph.P10 color={Colors.Gray.V5}>{selector}</Paragraph.P10>
              )
          )}
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
