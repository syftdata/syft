import { useState, useEffect, useRef } from 'react'
import throttle from 'lodash.throttle'
import { cx } from '@emotion/css'

import Recorder from './recorder'
import Highlighter from './Highlighter'
import genSelectors, { getBestSelectorForAction } from '../builders/selector'
import { usePreferredLibrary, usePreferredBarPosition } from '../common/hooks'

import type { Action } from '../types'
import { ActionType, ScriptType, TagName, BarPosition } from '../types'

import { endRecording } from '../common/endRecording'
import { Css, Flex } from '../common/styles/common.styles'
import { RecordDoneHeader, RecordingHeader } from './ControlBarHeaders'
import RecordScriptView from './RecordScriptView'
import Card from '../common/core/Card'

function isElementFromOverlay(element: HTMLElement) {
  if (element == null) return false
  return element.closest('#overlay-controls') != null
}

export default function ControlBar({ onExit }: { onExit: () => void }) {
  const [barPosition, setBarPosition] = usePreferredBarPosition(BarPosition.Bottom)

  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const [hoveredElementSelectors, setHoveredElementSelectors] = useState<any>({})

  const [lastAction, setLastAction] = useState<Action | null>(null)
  const [actions, setActions] = useState<Action[]>([])
  const [_scriptType, setScriptType] = usePreferredLibrary()
  const [showAllActions, setShowAllActions] = useState<boolean>(false)
  const [isFinished, setIsFinished] = useState<boolean>(false)

  const [isOpen, setIsOpen] = useState<boolean>(true)

  const handleMouseMoveRef = useRef((_: MouseEvent) => {})
  const recorderRef = useRef<Recorder | null>(null)

  const onEndRecording = () => {
    setIsFinished(true)

    // Show Code
    setShowAllActions(true)

    // Clear out highlighter
    document.removeEventListener('mousemove', handleMouseMoveRef.current, true)
    setHoveredElement(null)

    // Turn off recorder
    recorderRef.current?.deregister()
    endRecording()
  }

  const onInsertEvent = () => {
    setShowAllActions(true)
    setScriptType(ScriptType.Playwright)
  }

  const onClose = () => {
    setIsOpen(false)
    onExit()
  }

  useEffect(() => {
    handleMouseMoveRef.current = throttle((event: MouseEvent) => {
      const x = event.clientX,
        y = event.clientY,
        elementMouseIsOver = document.elementFromPoint(x, y) as HTMLElement

      if (!isElementFromOverlay(elementMouseIsOver) && elementMouseIsOver != null) {
        const { parentElement } = elementMouseIsOver
        // Match the logic in recorder.ts for link clicks
        const element = parentElement?.tagName === 'A' ? parentElement : elementMouseIsOver
        setHoveredElement(element || null)
        setHoveredElementSelectors(genSelectors(element))
      }
    }, 100)

    document.addEventListener('mousemove', handleMouseMoveRef.current, true)

    recorderRef.current = new Recorder({
      onAction: (action: Action, actions: Action[]) => {
        setLastAction(action)
        setActions(actions)
      },
      onInitialized: (lastAction: Action, recording: Action[]) => {
        setLastAction(
          recording.reduceRight<Action | null>(
            (p, v) => (p == null && v.type != 'navigate' ? v : p),
            null,
          ),
        )
        setActions(recording)
      },
    })

    // Set recording to be finished if somewhere else (ex. popup) the state has been set to be finished
    chrome.storage.onChanged.addListener((changes) => {
      if (
        changes.recordingState != null &&
        changes.recordingState.newValue === 'finished' &&
        // Firefox will fire change events even if the values are not changed
        changes.recordingState.newValue !== changes.recordingState.oldValue
      ) {
        if (!isFinished) {
          onEndRecording()
        }
      }
    })
  }, [])

  const scriptType = _scriptType ?? ScriptType.Playwright

  const rect = hoveredElement?.getBoundingClientRect()
  const displayedSelector = getBestSelectorForAction(
    {
      type: ActionType.Click,
      tagName: (hoveredElement?.tagName ?? '') as TagName,
      inputType: undefined,
      value: undefined,
      selectors: hoveredElementSelectors || {},
      timestamp: 0,
      isPassword: false,
      hasOnlyText: hoveredElement?.children?.length === 0 && hoveredElement?.innerText?.length > 0,
    },
    scriptType,
  )

  if (isOpen === false) {
    return <></>
  }

  return (
    <>
      {rect != null && rect.top != null && (
        <Highlighter rect={rect} displayedSelector={displayedSelector ?? ''} />
      )}
      <Card
        id="overlay-controls"
        gap={8}
        className={cx(
          Css.position('fixed!important'),
          Css.zIndex(2147483647),
          showAllActions && Css.height(320),
          barPosition === BarPosition.Bottom ? Css.bottom(35) : Css.top(35),
          Css.width(650),
          Css.margin('auto'),
          Css.left(0),
          Css.right(0),
          Css.padding(10),
        )}
      >
        {isFinished ? (
          <RecordDoneHeader
            onClose={onClose}
            showActions={showAllActions}
            toggleShowActions={() => setShowAllActions(!showAllActions)}
          />
        ) : (
          <RecordingHeader
            onEndRecording={onEndRecording}
            onInsertEvent={onInsertEvent}
            showActions={showAllActions}
            toggleShowActions={() => setShowAllActions(!showAllActions)}
            barPosition={barPosition}
            setBarPosition={setBarPosition}
            lastAction={lastAction}
          />
        )}
        {showAllActions && (
          <RecordScriptView
            actions={actions}
            scriptType={scriptType}
            setScriptType={setScriptType}
          />
        )}
      </Card>
    </>
  )
}
