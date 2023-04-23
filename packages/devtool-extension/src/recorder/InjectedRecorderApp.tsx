import { useState, useEffect, useRef } from "react";
import throttle from "lodash.throttle";
import Recorder from "./recorder";
import Highlighter from "./Highlighter";
import genSelectors, { getBestSelectorForAction } from "../builders/selector";

import { Action, MessageType } from "../types";
import { ActionType, ScriptType, TagName } from "../types";

export default function InjectedRecorderApp() {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
    null
  );
  const [hoveredElementSelectors, setHoveredElementSelectors] = useState<any>(
    {}
  );
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const handleMouseMoveRef = useRef((_: MouseEvent) => {});
  const recorderRef = useRef<Recorder | null>(null);

  const onEndRecording = () => {
    setIsFinished(true);
    // Clear out highlighter
    document.removeEventListener("mousemove", handleMouseMoveRef.current, true);
    setHoveredElement(null);
    // Turn off recorder
    recorderRef.current?.deregister();
  };

  useEffect(() => {
    handleMouseMoveRef.current = throttle((event: MouseEvent) => {
      const x = event.clientX,
        y = event.clientY,
        elementMouseIsOver = document.elementFromPoint(x, y) as HTMLElement;

      if (elementMouseIsOver != null) {
        const { parentElement } = elementMouseIsOver;
        // Match the logic in recorder.ts for link clicks
        const element =
          parentElement?.tagName === "A" ? parentElement : elementMouseIsOver;
        setHoveredElement(element || null);
        setHoveredElementSelectors(genSelectors(element));
      }
    }, 100);

    document.addEventListener("mousemove", handleMouseMoveRef.current, true);

    recorderRef.current = new Recorder({
      onAction: (action: Action, actions: Action[]) => {
        chrome.runtime.sendMessage({
          type: MessageType.RecordedStep,
          data: actions,
        });
      },
      onInitialized: (lastAction: Action, recording: Action[]) => {
        chrome.runtime.sendMessage({
          type: MessageType.RecordedStep,
          data: recording,
        });
      },
    });

    // Set recording to be finished if somewhere else (ex. popup) the state has been set to be finished
    chrome.storage.onChanged.addListener((changes) => {
      if (
        changes.recordingState != null &&
        changes.recordingState.newValue === "finished" &&
        // Firefox will fire change events even if the values are not changed
        changes.recordingState.newValue !== changes.recordingState.oldValue
      ) {
        if (!isFinished) {
          onEndRecording();
        }
      }
    });
  }, []);

  const rect = hoveredElement?.getBoundingClientRect();
  const displayedSelector = getBestSelectorForAction(
    {
      type: ActionType.Click,
      tagName: (hoveredElement?.tagName ?? "") as TagName,
      inputType: undefined,
      value: undefined,
      selectors: hoveredElementSelectors || {},
      timestamp: 0,
      isPassword: false,
      hasOnlyText:
        hoveredElement?.children?.length === 0 &&
        hoveredElement?.innerText?.length > 0,
    },
    ScriptType.Playwright
  );

  if (isFinished) {
    return <></>;
  }

  return (
    <>
      {rect != null && rect.top != null && (
        <Highlighter rect={rect} displayedSelector={displayedSelector ?? ""} />
      )}
    </>
  );
}
