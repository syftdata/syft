import { EventTag } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import List from "../common/components/core/List";
import { Mono } from "../common/styles/fonts";
import { Colors, backgroundCss } from "../common/styles/colors";
import { css } from "@emotion/css";
import Section from "../common/components/core/Section";

export interface TagHandlerListProps {
  tag: EventTag;
  handlers: string[];
  selectedHandler: string;
  onSelect: (handler: string) => void;
}
export default function TagHandlerList({
  tag,
  handlers,
  selectedHandler,
  onSelect,
}: TagHandlerListProps) {
  return (
    <Section title="Triggers">
      <List<string>
        data={handlers}
        renderItem={(handler) => {
          const eventCount = tag.handlerToEvents[handler]?.length;
          return (
            <Flex.Row
              gap={4}
              alignItems="center"
              className={css(
                Flex.grow(1),
                Css.padding("4px 8px"),
                selectedHandler === handler &&
                  backgroundCss(Colors.Branding.V1),
                selectedHandler === handler &&
                  Css.border(`1px solid ${Colors.Branding.V5} !important`)
              )}
              justifyContent="space-between"
              onClick={() => {
                onSelect(handler);
              }}
            >
              <Mono.M12>{handler}</Mono.M12>
              {eventCount != null && eventCount > 0 && (
                <Mono.M10>{eventCount} Events</Mono.M10>
              )}
            </Flex.Row>
          );
        }}
      />
    </Section>
  );
}
