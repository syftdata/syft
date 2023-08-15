import { Colors } from "../common/styles/colors";
import { VisualMode } from "../types";

export type HighlighterProps = {
  rect: DOMRect;
  mode: VisualMode;
  label?: string;

  selected?: boolean;
  defined?: boolean;
  committed?: boolean;

  onClick?: () => void;
};

export const rectBackgroundColor = (backgroundColor: string) =>
  `${backgroundColor}55`;

export default function Highlighter({
  rect,
  mode,
  label,

  selected,
  defined,
  committed,

  onClick,
}: HighlighterProps) {
  let className = "Syft-Highlighter-outline";
  let bgClassName = "Syft-Highlighter-bg";
  let eleColor: string | undefined;
  if (mode === VisualMode.SELECTED) {
    // in selected mode, the page is interactable. so, keep highlighters disabled.
    className += " disabled";
  } else if (mode === VisualMode.INSPECT) {
    eleColor = Colors.Branding.V3;
    bgClassName += " visibleOnHover";
  } else if (mode === VisualMode.ALL) {
    eleColor = Colors.Branding.V1; // light color.
  }

  if (selected) {
    eleColor = Colors.Branding.V5;
  } else if (committed) {
    eleColor = Colors.Secondary.Green;
  } else if (defined) {
    eleColor = Colors.Secondary.Yellow;
  }

  return (
    <div
      className={className}
      syft-highlight="true"
      onClick={() => {
        if (onClick) onClick();
      }}
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }}
    >
      <div
        className={bgClassName}
        syft-highlight="true"
        style={
          eleColor
            ? {
                border: `1px solid ${eleColor}`,
                backgroundColor: rectBackgroundColor(eleColor),
              }
            : undefined
        }
      >
        {label && (
          <div
            className="Syft-Highlighter-label"
            style={{
              backgroundColor: Colors.Gray.V5,
              color: Colors.White,
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
