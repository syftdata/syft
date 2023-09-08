import { useState, useEffect, useMemo } from "react";
import throttle from "lodash.throttle";
import Highlighter from "./Highlighter";

import HighlighterStyle from "./Highlighter.css";
import { ReactElement, TagName, VisualMode } from "../types";
import { getBestSelectorsForAction } from "../builders/selector";

export interface HighlightersProps {
  elements: ReactElement[];
  selectedIndex?: number;
  mode: VisualMode;
  onClick?: (index: number, element: ReactElement) => void;
}

type ComputedEventTag = {
  element: ReactElement;
  eles: HTMLElement[];
};

function getElementsFromSelectors(element: ReactElement) {
  const selectors = getBestSelectorsForAction(element).filter(
    (s) => s != null
  ) as string[];
  for (let i = 0; i < selectors.length; i++) {
    try {
      const htmlEles = document.querySelectorAll(selectors[i]);
      if (htmlEles != null) {
        return htmlEles;
      }
    } catch (e) {}
  }
  return [];
}

export default function Highlighters({
  elements,
  selectedIndex,
  mode,
  onClick,
}: HighlightersProps) {
  const [scrollPosition, setScrollPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const cTags = useMemo(() => {
    // remove the old data-tag-index
    return elements.map((element) => {
      const eles = getElementsFromSelectors(element);
      return {
        element,
        eles: [...eles.values()],
      } as ComputedEventTag;
    });
  }, [elements]);

  useEffect(() => {
    const handleScroll = throttle((event: Event) => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    }, 20);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  useEffect(() => {
    const eatUpEvent = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLDivElement) {
        const divTarget = target;
        if (divTarget.hasAttribute("syft-highlight")) return;
      }
      if (mode === VisualMode.SELECTED) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
    };
    document.addEventListener("click", eatUpEvent, true);
    document.addEventListener("keyup", eatUpEvent, true);
    document.addEventListener("keydown", eatUpEvent, true);
    return () => {
      document.removeEventListener("click", eatUpEvent, true);
      document.removeEventListener("keyup", eatUpEvent, true);
      document.removeEventListener("keydown", eatUpEvent, true);
    };
  }, [mode]);

  const selectedElement =
    selectedIndex != null ? elements[selectedIndex] : undefined;

  return (
    <>
      <style>{HighlighterStyle}</style>
      {cTags.flatMap((def, idx) => {
        if (def.element.tagName === TagName.Body) {
          return;
        }
        const events = [
          ...new Set(
            Object.values(def.element.handlerToEvents).flatMap((e) => e)
          ),
        ];
        // if (definedEvents > 0) {
        //   label = `${label} (${definedEvents})`;
        // }
        // const label = def.element.reactSource.name ?? def.element.tagName;
        const label =
          events.length > 0 ? events.join(", ") : def.element.reactSource.name;
        const selected = selectedElement === def.element;
        const committed = def.element.committed;
        const defined = events.length > 0;
        if (!selected) {
          if (mode === VisualMode.SELECTED) {
            return;
          } else if (mode === VisualMode.ALL) {
            if (def.element.reactSource.handlers.length === 0) {
              return;
            }
          }
        }
        return def.eles.map((ele, elementIdx) => {
          return (
            <Highlighter
              key={`${idx}-${elementIdx}`}
              rect={ele.getBoundingClientRect()}
              mode={mode}
              defined={defined}
              selected={selectedElement === def.element}
              committed={committed}
              label={label}
              onClick={() => {
                if (onClick) onClick(idx, def.element);
              }}
            />
          );
        });
      })}
    </>
  );
}
