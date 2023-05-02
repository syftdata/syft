import { css, cx } from "@emotion/css";
import { getBestSelectorForAction } from "../builders/selector";
import { Action, ActionType, ScriptType } from "../types";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";

const LongTextCss = css(
  Css.whiteSpace("normal"),
  Css.wordBreak("break-all"),
  Flex.grow(1)
);
const svg = (
  <div className={Css.width(10)}>
    <svg
      width="7"
      height="7"
      viewBox="0 0 7 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 3.5L0.75 6.53109V0.468911L6 3.5Z" fill="#83848A" />
    </svg>
  </div>
);
export function ActionText({
  action,
  className,
}: {
  action: Action;
  className?: string;
}) {
  if (!action) {
    return <></>;
  }
  return (
    <Flex.Row
      gap={8}
      alignItems="center"
      justifyContent="start"
      className={cx(Css.whiteSpace("nowrap"), className)}
    >
      {action.type === ActionType.Click ? (
        <>
          <Mono.M12>Click</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>
            {getBestSelectorForAction(action, ScriptType.Playwright)}
          </Mono.M12>
        </>
      ) : action.type === ActionType.Hover ? (
        <>
          <Mono.M12>Hover</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>
            {getBestSelectorForAction(action, ScriptType.Playwright)}
          </Mono.M12>
        </>
      ) : action.type === ActionType.Load ? (
        <>
          <Mono.M12>Load</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>{action.url}</Mono.M12>
        </>
      ) : action.type === ActionType.Input ? (
        <>
          <Mono.M12>Fill</Mono.M12>
          <Mono.M12>
            {action.isPassword
              ? "*".repeat(action?.value?.length ?? 0)
              : action.value}
          </Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>
            {getBestSelectorForAction(action, ScriptType.Playwright)}
          </Mono.M12>
        </>
      ) : action.type === ActionType.Keydown ? (
        <>
          <Mono.M12>Press</Mono.M12>
          <Mono.M12>{action.key}</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>
            {getBestSelectorForAction(action, ScriptType.Playwright)}
          </Mono.M12>
        </>
      ) : action.type === ActionType.Resize ? (
        <>
          <Mono.M12>Resize Window</Mono.M12>
          {svg}
          <Mono.M12>
            {action.width} x {action.height}
          </Mono.M12>
        </>
      ) : action.type === ActionType.Wheel ? (
        <>
          <Mono.M12>Scroll wheel</Mono.M12>
          {svg}
          <Mono.M12>
            X:{action.deltaX}, Y:{action.deltaY}
          </Mono.M12>
        </>
      ) : action.type === ActionType.FullScreenshot ? (
        <>
          <Mono.M12>Take page screenshot</Mono.M12>
        </>
      ) : action.type === ActionType.AwaitText ? (
        <>
          <Mono.M12>Wait for</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>"{action.text}"</Mono.M12>
        </>
      ) : action.type === ActionType.DragAndDrop ? (
        <>
          <Mono.M12>Drag n Drop</Mono.M12>
          <Mono.M10>from</Mono.M10>
          <Mono.M12>
            ({action.sourceX}, {action.sourceY})
          </Mono.M12>
          <Mono.M10>to</Mono.M10>
          <Mono.M12>
            ({action.targetX}, {action.targetY})
          </Mono.M12>
        </>
      ) : action.type === ActionType.Navigate ? (
        <>
          <Mono.M12>Expect URL</Mono.M12>
          {svg}
          <Mono.M12 className={LongTextCss}>{action.url}</Mono.M12>
        </>
      ) : (
        <></>
      )}
    </Flex.Row>
  );
}
