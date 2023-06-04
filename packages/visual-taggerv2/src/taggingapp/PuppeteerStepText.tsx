import { css, cx } from "@emotion/css";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import { Step, StepType, StepWithSelectors } from "@puppeteer/replay";
import Icon from "../common/components/core/Icon/Icon";

function getBestSelectorForStep(step: StepWithSelectors) {
  return step.selectors[0];
}

const LongTextCss = css(
  Css.whiteSpace("normal"),
  Css.wordBreak("break-all"),
  Flex.grow(1)
);
const svg = <Icon icon="arrow-right" size="xSmall" />;
export function PuppeteerStepText({
  step,
  className,
}: {
  step: Step;
  className?: string;
}) {
  return (
    <Flex.Row
      gap={8}
      alignItems="center"
      justifyContent="start"
      className={cx(Css.whiteSpace("nowrap"), className)}
    >
      {step.type === StepType.Click ? (
        <>
          <Mono.M12>Click</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>
            {getBestSelectorForStep(step)}
          </Mono.M12>
        </>
      ) : step.type === StepType.Hover ? (
        <>
          <Mono.M12>Hover</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>
            {getBestSelectorForStep(step)}
          </Mono.M12>
        </>
      ) : step.type === StepType.CustomStep && step.name === "syft" ? (
        <>
          <Mono.M12>Expect Events</Mono.M12>
        </>
      ) : step.type === StepType.Change ? (
        <>
          <Mono.M12>Fill</Mono.M12>
          <Mono.M12>{step.value}</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>
            {getBestSelectorForStep(step)}
          </Mono.M12>
        </>
      ) : step.type === StepType.KeyDown ? (
        <>
          <Mono.M12>Key down</Mono.M12>
          <Mono.M12>{step.key}</Mono.M12>
        </>
      ) : step.type === StepType.KeyUp ? (
        <>
          <Mono.M12>Key up</Mono.M12>
          <Mono.M12>{step.key}</Mono.M12>
        </>
      ) : step.type === StepType.SetViewport ? (
        <>
          <Mono.M12>Resize Window</Mono.M12>
          {svg}
          <Mono.M12>
            {step.width} x {step.height}
          </Mono.M12>
        </>
      ) : step.type === StepType.Scroll ? (
        <>
          <Mono.M12>Scroll wheel</Mono.M12>
          {svg}
          <Mono.M12>
            X:{step.x}, Y:{step.y}
          </Mono.M12>
        </>
      ) : step.type === StepType.WaitForExpression ? (
        <>
          <Mono.M12>Wait for</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>{step.expression}</Mono.M12>
        </>
      ) : step.type === StepType.Navigate ? (
        <>
          <Mono.M12>Open URL</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>{step.url}</Mono.M12>
        </>
      ) : (
        <></>
      )}
    </Flex.Row>
  );
}
