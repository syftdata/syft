import { Colors } from "../common/styles/colors";

export type HighlighterProps = {
  rect: DOMRect;
  label?: string;
  defined?: boolean;
  committed?: boolean;
};

export const rectBackgroundColor = (backgroundColor: string) =>
  `${backgroundColor}55`;

export default function Highlighter({
  label,
  rect,
  defined,
  committed,
}: HighlighterProps) {
  return (
    <>
      <div
        className="Syft-Highlighter-outline"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: `1px solid ${Colors.Branding.V5}`,
          backgroundColor: rectBackgroundColor(
            committed
              ? Colors.Secondary.Green
              : defined
              ? Colors.Secondary.Orange
              : Colors.Branding.V3
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
