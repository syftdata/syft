import { getBestSelectorForAction } from "../builders/selector";
import { Action, ActionType, ScriptType } from "../types";
import { Flex } from "./styles/common.styles";
import { Mono } from "./styles/fonts";
import { Paragraph } from "./styles/fonts";

export function ActionText2({ action }: { action: Action }) {
  return (
    <Flex.Row gap={2} alignItems="center">
      {action.type === ActionType.Click ? (
        <>
          <Paragraph.P12>Click</Paragraph.P12> on
          <Mono.M12>
            {action.tagName === "A" ? "link" : action.tagName.toLowerCase()}
          </Mono.M12>
          {(action.selectors.text?.length ?? -1) > 0 &&
          (action.selectors.text?.length ?? -1) < 75 ? (
            <span>"{action.selectors.text}"</span>
          ) : (
            <Mono.M12>
              {getBestSelectorForAction(action, ScriptType.Playwright)}
            </Mono.M12>
          )}
        </>
      ) : action.type === ActionType.Hover ? (
        <>
          <Paragraph.P12>Hover</Paragraph.P12> over
          <Mono.M12>
            {action.tagName === "A" ? "link" : action.tagName.toLowerCase()}
          </Mono.M12>
          {(action.selectors.text?.length ?? -1) > 0 &&
          (action.selectors.text?.length ?? -1) < 75 ? (
            <span>"{action.selectors.text}"</span>
          ) : (
            <Mono.M12>
              {getBestSelectorForAction(action, ScriptType.Playwright)}
            </Mono.M12>
          )}
        </>
      ) : action.type === ActionType.Load ? (
        <>
          <Paragraph.P12>Load</Paragraph.P12>
          <Mono.M12>"{action.url}"</Mono.M12>
        </>
      ) : action.type === ActionType.Input ? (
        <>
          <Paragraph.P12>Fill</Paragraph.P12>
          <Mono.M12>
            "
            {action.isPassword
              ? "*".repeat(action?.value?.length ?? 0)
              : action.value}
            "
          </Mono.M12>
          <span>on</span>
          <Mono.M12>
            {getBestSelectorForAction(action, ScriptType.Playwright)}
          </Mono.M12>
        </>
      ) : action.type === ActionType.Keydown ? (
        <>
          <Paragraph.P12>Press</Paragraph.P12>
          <Mono.M12>"{action.key}"</Mono.M12>
          <span>on</span>
          <Mono.M12>
            {getBestSelectorForAction(action, ScriptType.Playwright)}
          </Mono.M12>
        </>
      ) : action.type === ActionType.Resize ? (
        <>
          <Paragraph.P12>Resize</Paragraph.P12>
          <span>window to</span>
          <Mono.M12>
            {action.width} x {action.height}
          </Mono.M12>
        </>
      ) : action.type === ActionType.Wheel ? (
        <>
          <Paragraph.P12>Scroll wheel by </Paragraph.P12>
          <Mono.M12>
            X: {action.deltaX}, Y: {action.deltaY}
          </Mono.M12>
        </>
      ) : action.type === ActionType.FullScreenshot ? (
        <>
          <Paragraph.P12>Take page screenshot</Paragraph.P12>
        </>
      ) : action.type === ActionType.AwaitText ? (
        <>
          <Paragraph.P12>Wait for text</Paragraph.P12>
          <span>"{action.text}"</span>
        </>
      ) : action.type === ActionType.DragAndDrop ? (
        <>
          <Paragraph.P12>Drag n Drop</Paragraph.P12>
          <span>from</span>
          <Mono.M12>
            ({action.sourceX}, {action.sourceY})
          </Mono.M12>
          <span>to</span>
          <Mono.M12>
            ({action.targetX}, {action.targetY})
          </Mono.M12>
        </>
      ) : action.type === ActionType.SyftEvent ? (
        <>
          <Paragraph.P12>Expect Syft</Paragraph.P12>
          <Mono.M12>({action.name})</Mono.M12>
          <span>with</span>
          <Mono.M12>({JSON.stringify(action.data)})</Mono.M12>
        </>
      ) : (
        <></>
      )}
    </Flex.Row>
  );
}
