import { getBestSelectorForAction } from '../builders/selector'
import { Action, ActionType, ScriptType } from '../types'

export default function ActionText({ action }: { action: Action }) {
  return (
    <>
      {action.type === ActionType.Click
        ? `Click on ${action.tagName.toLowerCase()} ${getBestSelectorForAction(
            action,
            ScriptType.Playwright,
          )}`
        : action.type === ActionType.Hover
        ? `Hover over ${action.tagName.toLowerCase()} ${getBestSelectorForAction(
            action,
            ScriptType.Playwright,
          )}`
        : action.type === ActionType.Input
        ? `Fill "${
            action.isPassword ? '*'.repeat(action?.value?.length ?? 0) : action.value
          }" on ${action.tagName.toLowerCase()} ${getBestSelectorForAction(
            action,
            ScriptType.Playwright,
          )}`
        : action.type === ActionType.Keydown
        ? `Press ${action.key} on ${action.tagName.toLowerCase()}`
        : action.type === ActionType.Load
        ? `Load "${action.url}"`
        : action.type === ActionType.Resize
        ? `Resize window to ${action.width} x ${action.height}`
        : action.type === ActionType.Wheel
        ? `Scroll wheel by X:${action.deltaX}, Y:${action.deltaY}`
        : action.type === ActionType.FullScreenshot
        ? `Take full page screenshot`
        : action.type === ActionType.AwaitText
        ? `Wait for text "${action.text}"`
        : action.type === ActionType.DragAndDrop
        ? `Drag n Drop from (${action.sourceX}, ${action.sourceY}) to (${action.targetX}, ${action.targetY})`
        : ''}
    </>
  )
}
