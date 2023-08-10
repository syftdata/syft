import { useState, useEffect, useCallback, useMemo } from "react";
import throttle from "lodash.throttle";
import Highlighter from "./Highlighter";

import HighlighterStyle from "./Highlighter.css";
import { ReactElement, VisualMode } from "../types";
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

  const handleScroll = useCallback(
    throttle((event: Event) => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    }, 20),
    []
  );

  const eatUpEvent = (event: Event) => {
    if (mode !== VisualMode.ALL) {
      return;
    }
    const target = event.target;
    if (target instanceof HTMLDivElement) {
      const divTarget = target;
      if (divTarget.hasAttribute("syft-highlight")) return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  };

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
    document.addEventListener("scroll", handleScroll, true);
    document.addEventListener("click", eatUpEvent, true);
    document.addEventListener("keyup", eatUpEvent, true);
    document.addEventListener("keydown", eatUpEvent, true);
    return () => {
      document.removeEventListener("scroll", handleScroll, true);
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
        return def.eles.map((ele, elementIdx) => {
          if (selectedElement !== def.element) {
            if (mode === VisualMode.SELECTED) {
              return <></>;
            } else if (mode === VisualMode.ALL) {
              // not updated yet to show only which are instrumented.
            }
          }
          return (
            <Highlighter
              key={`${idx}-${elementIdx}`}
              rect={ele.getBoundingClientRect()}
              defined={true}
              selected={selectedElement === def.element}
              committed={def.element.committed}
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
