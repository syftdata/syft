import { ReactElement } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import List from "../common/components/core/List";
import { css } from "@emotion/css";
import { Mono, Paragraph, Subheading } from "../common/styles/fonts";
import Section from "../common/components/core/Section";
import { Colors, backgroundCss } from "../common/styles/colors";

export interface ReactElementListProps {
  elements: ReactElement[];
  selectedIndex: number;
  onClick: (index: number, element: ReactElement) => void;
}
export default function ReactElementList({
  elements,
  selectedIndex,
  onClick,
}: ReactElementListProps) {
  return (
    <Section title="Elements" expandable={true} defaultExpanded={false}>
      <List<ReactElement>
        data={elements}
        emptyMessage="React elements are not found. Please install React Devtools!"
        renderItem={(element, idx) => {
          return (
            <Flex.Row
              gap={8}
              alignItems="center"
              onClick={() => onClick(idx, element)}
              className={css(
                Flex.grow(1),
                Css.padding("4px 8px"),
                selectedIndex === idx && backgroundCss(Colors.Branding.V1),
                selectedIndex === idx &&
                  Css.border(`1px solid ${Colors.Branding.V5} !important`)
              )}
            >
              <Paragraph.P12>
                {(element.selectors.text ?? "").substring(0, 25)}
              </Paragraph.P12>
              <Mono.M10>{element.reactSource.name}</Mono.M10>
            </Flex.Row>
          );
        }}
        className={css(Css.height(200), Css.overflow("scroll"))}
      />
    </Section>
  );
}
