import { useState, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import Highlighter from "./Highlighter";

import { ComputedEventTag, EventTag } from "./types";

import HighlighterStyle from "./Highlighter.css";
import { ScriptType } from "../types";
import { getBestSelectorsForAction } from "../builders/selector";

export interface HighlightersProps {
  actions: EventTag[];
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

export default function Highlighters({ actions }: HighlightersProps) {
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
        (ele) => ele instanceof HTMLElement && ele.id !== "syft-visual-tagger"
      ) as HTMLElement;

      if (elementMouseIsOver != null) {
        const { parentElement } = elementMouseIsOver;
        // Match the logic in recorder.ts for link clicks
        const element =
          parentElement?.tagName === "A" ? parentElement : elementMouseIsOver;
        setHoveredElement(element);
      }
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
    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true);
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
