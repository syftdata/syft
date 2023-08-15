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

  if (mode === VisualMode.SELECTED) {
    // in selected mode, the page is interactable. so, keep highlighters disabled.
    committed = false;
    defined = false;
    className += " disabled";
  } else if (mode === VisualMode.INSPECT) {
    committed = false;
    defined = false;
    bgClassName += " visibleOnHover";
  }

  const borderColor = selected
    ? Colors.Branding.V5
    : committed
    ? Colors.Secondary.Green
    : defined
    ? Colors.Secondary.Yellow
    : Colors.Branding.V3;
  const backgroundColor = selected
    ? Colors.Branding.V5
    : committed
    ? Colors.Secondary.Green
    : defined
    ? Colors.Secondary.Yellow
    : Colors.Branding.V3;

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
        style={{
          border: borderColor ? `1px solid ${borderColor}` : undefined,
          backgroundColor: backgroundColor
            ? rectBackgroundColor(backgroundColor)
            : undefined,
        }}
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
