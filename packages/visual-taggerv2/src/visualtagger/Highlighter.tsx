import { Colors } from "../common/styles/colors";

export type HighlighterProps = {
  rect: DOMRect;
  label?: string;

  selected?: boolean;
  defined?: boolean;
  committed?: boolean;

  onClick?: () => void;
};

export const rectBackgroundColor = (backgroundColor: string) =>
  `${backgroundColor}55`;

export default function Highlighter({
  label,
  rect,

  selected,
  defined,
  committed,

  onClick,
}: HighlighterProps) {
  return (
    <>
      <div
        className="Syft-Highlighter-outline"
        syft-highlight={true}
        onClick={onClick}
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: selected ? `1px solid ${Colors.Branding.V5}` : undefined,
          backgroundColor: rectBackgroundColor(
            selected
              ? Colors.Branding.V5
              : committed
              ? Colors.Secondary.Green
              : defined
              ? Colors.Secondary.Yellow
              : Colors.Branding.V1
          ),
        }}
      />
      {label && (
        <div
          className="Syft-Highlighter-label"
          style={{
            backgroundColor: Colors.Gray.V9,
            color: Colors.White,
            top: rect.top - 6,
            left: rect.left - 6,
          }}
        >
          {label}
        </div>
      )}
    </>
  );
}
