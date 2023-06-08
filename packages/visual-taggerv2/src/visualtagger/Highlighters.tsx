import { useState, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import Highlighter from "./Highlighter";

import { ComputedEventTag, EventTag } from "./types";

import HighlighterStyle from "./Highlighter.css";
import { Action, ActionType, ClickAction, ScriptType } from "../types";
import { getBestSelectorsForAction } from "../builders/selector";
import { buildBaseAction } from "./utils";

export interface HighlightersProps {
  actions: EventTag[];
  onPreviewClick: (action: Action) => void;
}

function getElementFromSelectors(eventTag: EventTag) {
  const selectors = getBestSelectorsForAction(
    eventTag,
    ScriptType.Playwright
  ).filter((s) => s != null) as string[];
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    if (selector == null) {
      continue;
    }
    const ele = document.querySelector(selector);
    if (ele != null) {
      return ele;
    }
  }
  return undefined;
}

const eatUpEvent = (event: Event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();
};

export default function Highlighters({
  actions,
  onPreviewClick,
}: HighlightersProps) {
  const [hoveredElement, setHoveredElement] = useState<
    HTMLElement | undefined
  >();

  const [computedActions, setComputedActions] = useState<ComputedEventTag[]>(
    []
  );

  const handleMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      const x = event.clientX,
        y = event.clientY,
        elementsMouseIsOver = document.elementsFromPoint(x, y);
      const elementMouseIsOver = elementsMouseIsOver.find(
        (ele) =>
          ele instanceof HTMLElement &&
          !ele.classList.contains("Syft-Highlighter-outline")
      ) as HTMLElement;

      if (elementMouseIsOver != null) {
        const { parentElement } = elementMouseIsOver;
        // Match the logic in recorder.ts for link clicks
        const element =
          parentElement?.tagName === "A" ? parentElement : elementMouseIsOver;
        if (element instanceof HTMLHtmlElement) {
          return;
        }
        setHoveredElement(element);
      }
    }, 100),
    []
  );

  const handleClick = useCallback(
    throttle((event: MouseEvent) => {
      const x = event.clientX,
        y = event.clientY,
        elementsMouseIsOver = document.elementsFromPoint(x, y);
      const elementMouseIsOver = elementsMouseIsOver.find(
        (ele) =>
          ele instanceof HTMLElement &&
          !ele.classList.contains("Syft-Highlighter-outline")
      ) as HTMLElement;
      if (elementMouseIsOver != null) {
        const action: ClickAction = {
          ...buildBaseAction(event, elementMouseIsOver),
          type: ActionType.Click,
          offsetX: event.offsetX,
          offsetY: event.offsetY,
        };
        onPreviewClick(action);
      }
      eatUpEvent(event);
    }, 100),
    []
  );

  useEffect(() => {
    const cActions = actions
      .map((action) => {
        const element = getElementFromSelectors(action);
        if (!element) {
          return undefined;
        }
        return {
          ...action,
          ele: element,
        };
      })
      .filter((event) => event != null) as ComputedEventTag[];
    setComputedActions(cActions);

    document.addEventListener("mousemove", handleMouseMove, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keyup", eatUpEvent, true);
    document.addEventListener("keydown", eatUpEvent, true);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keyup", eatUpEvent, true);
      document.removeEventListener("keydown", eatUpEvent, true);
    };
  }, [actions, handleMouseMove]);

  return (
    <>
      <style>{HighlighterStyle}</style>
      {computedActions.map((def, idx) => {
        return (
          <Highlighter
            key={idx}
            rect={def.ele.getBoundingClientRect()}
            defined={true}
            committed={true}
          />
        );
      })}
      {hoveredElement != null && (
        <Highlighter rect={hoveredElement.getBoundingClientRect()} />
      )}
    </>
  );
}
