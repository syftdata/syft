import { Css, Flex } from "../common/styles/common.styles";
import List from "../common/components/core/List";
import { Colors, backgroundCss } from "../common/styles/colors";
import { css } from "@emotion/css";
import { Step } from "@puppeteer/replay";
import { PuppeteerStepText } from "./PuppeteerStepText";

export interface PuppeteerStepListProps {
  steps: Step[];
  playingIndex: number;
  failedIndex: number;
  className?: string;
}
export default function PuppeteerStepList({
  steps,
  playingIndex,
  failedIndex,
  className,
}: PuppeteerStepListProps) {
  return (
    <List<Step>
      data={steps}
      renderItem={(step, index) => {
        return (
          <Flex.Row
            gap={4}
            alignItems="center"
            className={css(
              Flex.grow(1),
              playingIndex === index && backgroundCss(Colors.Secondary.Green),
              failedIndex === index && backgroundCss(Colors.Secondary.Orange)
            )}
          >
            <PuppeteerStepText step={step} className={Css.margin("6px 6px")} />
          </Flex.Row>
        );
      }}
      className={className}
    />
  );
}
