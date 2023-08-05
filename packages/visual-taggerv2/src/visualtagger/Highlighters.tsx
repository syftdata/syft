import { useState, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import Highlighter from "./Highlighter";

import { ComputedEventTag } from "./types";

import HighlighterStyle from "./Highlighter.css";
import {
  Action,
  ActionType,
  ClickAction,
  EventTag,
  ScriptType,
} from "../types";
import { getBestSelectorsForAction } from "../builders/selector";
import { buildBaseAction, getTagIndexFromElement } from "./utils";

export interface HighlightersProps {
  actions: EventTag[];
  previewAction?: Action;
  onPreviewClick: (action: Action, tagIndex: number) => void;
}

function getElementsFromSelectors(eventTag: EventTag) {
  const selectors = getBestSelectorsForAction(
    eventTag,
    ScriptType.Playwright
  ).filter((s) => s != null) as string[];
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    if (selector == null) {
      continue;
    }
    try {
      const ele = document.querySelectorAll(selector);
      if (ele != null) {
        return ele;
      }
    } catch (e) {}
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
  previewAction,
  onPreviewClick,
}: HighlightersProps) {
  const [hoveredElement, setHoveredElement] = useState<
    HTMLElement | undefined
  >();
  const [clickedElement, setClickedElement] = useState<
    HTMLElement | undefined
  >();
  const [computedActions, setComputedActions] = useState<ComputedEventTag[]>(
    []
  );

  const [scrollPosition, setScrollPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useEffect(() => {
    if (previewAction) {
      const elements = getElementsFromSelectors(previewAction);
      let ele: HTMLElement | undefined;
      if (elements != null) {
        ele = [...elements.values()].find(
          (e) => e instanceof HTMLElement
        ) as HTMLElement;
      }
      setClickedElement(ele);
    } else {
      // hide the clicked element
      setClickedElement(undefined);
    }
  }, [previewAction]);

  const handleMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      const x = event.clientX,
        y = event.clientY,
        elementMouseIsOver = document.elementFromPoint(x, y);
      if (
        elementMouseIsOver != null &&
        elementMouseIsOver instanceof HTMLElement
      ) {
        const { parentElement } = elementMouseIsOver;
        // Match the logic in recorder.ts for link clicks
        const element =
          parentElement?.tagName === "A" ? parentElement : elementMouseIsOver;
        if (element instanceof HTMLHtmlElement) {
          setHoveredElement(undefined);
          return;
        }
        setHoveredElement(element);
      }
    }, 100),
    []
  );

  const handleScroll = useCallback(
    throttle((event: Event) => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    }, 100),
    []
  );

  const handleClick = useCallback(
    throttle((event: MouseEvent) => {
      const x = event.clientX,
        y = event.clientY,
        elementMouseIsOver = document.elementFromPoint(x, y);
      if (
        elementMouseIsOver != null &&
        elementMouseIsOver instanceof HTMLElement
      ) {
        const { parentElement } = elementMouseIsOver;
        // Match the logic in recorder.ts for link clicks
        const element =
          parentElement?.tagName === "A" ? parentElement : elementMouseIsOver;
        if (element instanceof HTMLHtmlElement) {
          setClickedElement(undefined);
          return;
        }
        const matchedIndex = getTagIndexFromElement(element);
        const action: ClickAction = {
          ...buildBaseAction(event, element),
          type: ActionType.Click,
          offsetX: event.offsetX,
          offsetY: event.offsetY,
        };
        setClickedElement(element);
        onPreviewClick(action, matchedIndex);
      }
      eatUpEvent(event);
    }, 5),
    []
  );

  useEffect(() => {
    // remove the old data-tag-index
    const elements = document.querySelectorAll("[data-tag-index]");
    elements.forEach((ele) => {
      ele.removeAttribute("data-tag-index");
    });
    const cActions = actions
      .map((action, idx) => {
        const eles = getElementsFromSelectors(action);
        if (eles == null || eles.length === 0) {
          return undefined;
        }

        eles.forEach((ele) => {
          ele.setAttribute("data-tag-index", idx.toString());
        });
        return {
          ...action,
          eles: [...eles.values()],
        };
      })
      .filter((action) => action != null) as ComputedEventTag[];
    setComputedActions(cActions);

    document.addEventListener("mousemove", handleMouseMove, true);
    document.addEventListener("scroll", handleScroll, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keyup", eatUpEvent, true);
    document.addEventListener("keydown", eatUpEvent, true);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keyup", eatUpEvent, true);
      document.removeEventListener("keydown", eatUpEvent, true);
    };
  }, [actions, handleMouseMove, handleScroll]);

  const tagIndex = getTagIndexFromElement(hoveredElement);

  return (
    <>
      <style>{HighlighterStyle}</style>
      {computedActions.flatMap((def, idx) => {
        return def.eles.map((ele, elementIdx) => {
          return (
            <Highlighter
              key={`${idx}-${elementIdx}`}
              tagIndex={idx}
              rect={ele.getBoundingClientRect()}
              defined={true}
              clicked={clickedElement === ele}
              committed={def.committed}
            />
          );
        });
      })}
      {hoveredElement != null && tagIndex === -1 && (
        <Highlighter rect={hoveredElement.getBoundingClientRect()} />
      )}
      {clickedElement != null && (
        <Highlighter
          rect={clickedElement.getBoundingClientRect()}
          clicked={true}
        />
      )}
    </>
  );
}
