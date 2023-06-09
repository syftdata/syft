import { Colors } from "../common/styles/colors";

export type HighlighterProps = {
  rect: DOMRect;
  label?: string;
  tagIndex?: number;

  clicked?: boolean;
  defined?: boolean;
  committed?: boolean;
};

export const rectBackgroundColor = (backgroundColor: string) =>
  `${backgroundColor}55`;

export default function Highlighter({
  label,
  tagIndex,
  rect,

  clicked,
  defined,
  committed,
}: HighlighterProps) {
  return (
    <>
      <div
        className="Syft-Highlighter-outline"
        data-tag-index={tagIndex}
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: clicked ? `1px solid ${Colors.Branding.V5}` : undefined,
          backgroundColor: rectBackgroundColor(
            clicked
              ? Colors.Branding.V3
              : committed
              ? Colors.Secondary.Green
              : defined
              ? Colors.Secondary.Orange
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
