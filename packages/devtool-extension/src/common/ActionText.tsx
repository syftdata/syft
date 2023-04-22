import { getBestSelectorForAction } from "../builders/selector";
import { Action, ActionType, ScriptType } from "../types";
import { Flex } from "./styles/common.styles";
import { Mono } from "./styles/fonts";
import { Paragraph } from "./styles/fonts";

export function ActionText2({ action }: { action: Action }) {
  return (
    <Flex.Row gap={4} alignItems="center" justifyContent="start">
      {action.type === ActionType.Click ? (
        <>
          <Paragraph.P14>Click</Paragraph.P14>
          <Paragraph.P12>on</Paragraph.P12>
          <Mono.M14>
            {action.tagName === "A" ? "link" : action.tagName.toLowerCase()}
          </Mono.M14>
          {(action.selectors.text?.length ?? -1) > 0 &&
          (action.selectors.text?.length ?? -1) < 75 ? (
            <Paragraph.P12>"{action.selectors.text}"</Paragraph.P12>
          ) : (
            <Mono.M14>
              {getBestSelectorForAction(action, ScriptType.Playwright)}
            </Mono.M14>
          )}
        </>
      ) : action.type === ActionType.Hover ? (
        <>
          <Paragraph.P14>Hover</Paragraph.P14> over
          <Mono.M14>
            {action.tagName === "A" ? "link" : action.tagName.toLowerCase()}
          </Mono.M14>
          {(action.selectors.text?.length ?? -1) > 0 &&
          (action.selectors.text?.length ?? -1) < 75 ? (
            <Paragraph.P12>"{action.selectors.text}"</Paragraph.P12>
          ) : (
            <Mono.M14>
              {getBestSelectorForAction(action, ScriptType.Playwright)}
            </Mono.M14>
          )}
        </>
      ) : action.type === ActionType.Load ? (
        <>
          <Paragraph.P14>Load</Paragraph.P14>
          <Mono.M14>"{action.url}"</Mono.M14>
        </>
      ) : action.type === ActionType.Input ? (
        <>
          <Paragraph.P14>Fill</Paragraph.P14>
          <Mono.M14>
            "
            {action.isPassword
              ? "*".repeat(action?.value?.length ?? 0)
              : action.value}
            "
          </Mono.M14>
          <Paragraph.P12>on</Paragraph.P12>
          <Mono.M14>
            {getBestSelectorForAction(action, ScriptType.Playwright)}
          </Mono.M14>
        </>
      ) : action.type === ActionType.Keydown ? (
        <>
          <Paragraph.P14>Press</Paragraph.P14>
          <Mono.M14>"{action.key}"</Mono.M14>
          <Paragraph.P12>on</Paragraph.P12>
          <Mono.M14>
            {getBestSelectorForAction(action, ScriptType.Playwright)}
          </Mono.M14>
        </>
      ) : action.type === ActionType.Resize ? (
        <>
          <Paragraph.P14>Resize</Paragraph.P14>
          <Paragraph.P12>window to</Paragraph.P12>
          <Mono.M14>
            {action.width} x {action.height}
          </Mono.M14>
        </>
      ) : action.type === ActionType.Wheel ? (
        <>
          <Paragraph.P14>Scroll wheel by</Paragraph.P14>
          <Mono.M14>
            X:{action.deltaX}, Y:{action.deltaY}
          </Mono.M14>
        </>
      ) : action.type === ActionType.FullScreenshot ? (
        <>
          <Paragraph.P14>Take page screenshot</Paragraph.P14>
        </>
      ) : action.type === ActionType.AwaitText ? (
        <>
          <Paragraph.P14>Wait for text</Paragraph.P14>
          <Paragraph.P12>"{action.text}"</Paragraph.P12>
        </>
      ) : action.type === ActionType.DragAndDrop ? (
        <>
          <Paragraph.P14>Drag n Drop</Paragraph.P14>
          <Paragraph.P12>from</Paragraph.P12>
          <Mono.M14>
            ({action.sourceX}, {action.sourceY})
          </Mono.M14>
          <Paragraph.P12>to</Paragraph.P12>
          <Mono.M14>
            ({action.targetX}, {action.targetY})
          </Mono.M14>
        </>
      ) : action.type === ActionType.SyftEvent ? (
        <>
          <Paragraph.P14>Expect Syft</Paragraph.P14>
          <Mono.M14>{action.name}</Mono.M14>
          <Paragraph.P12>with</Paragraph.P12>
          <Mono.M14>({JSON.stringify(action.data)})</Mono.M14>
        </>
      ) : (
        <></>
      )}
    </Flex.Row>
  );
}
