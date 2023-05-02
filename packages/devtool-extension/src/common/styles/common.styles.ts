import { css } from "@emotion/css";
import styled from "styled-components";
import { Colors } from "./colors";

export interface FlexProps {
  gap?: number;
  justifyContent?: string;
  alignItems?: string;
}

export const Flex = {
  Col: styled.div<FlexProps>`
    display: flex;
    flex-direction: column;
    gap: ${({ gap }) => gap && `${gap}px`};
    justify-content: ${({ justifyContent }) => justifyContent};
    align-items: ${({ alignItems }) => alignItems};
  `,
  Row: styled.div<FlexProps>`
    display: flex;
    flex-direction: row;
    gap: ${({ gap }) => gap && `${gap}px`};
    justify-content: ${({ justifyContent }) => justifyContent};
    align-items: ${({ alignItems }) => alignItems};
  `,
  RowWithDivider: styled.div<FlexProps>`
    display: flex;
    flex-direction: row;
    gap: ${({ gap }) => gap && `${gap}px`};
    justify-content: ${({ justifyContent }) => justifyContent};
    align-items: ${({ alignItems }) => alignItems};
    border-bottom: 1px solid ${Colors.Gray.V3};
  `,
  gap: (gap: number) =>
    css({
      gap,
    }),
  justifyContent: (justifyContent: string) =>
    css({
      justifyContent,
    }),
  alignItems: (alignItems: string) =>
    css({
      alignItems,
    }),
  wrap: (flexWrap: any) =>
    css({
      flexWrap,
    }),
  grow: (flexGrow: string | number) =>
    css({
      flexGrow,
    }),
  shrink: (flexShrink: string | number) =>
    css({
      flexShrink,
    }),
  direction: (direction: any) =>
    css({
      flexDirection: direction,
    }),
};

export const Css = {
  width: (width?: number | string) =>
    css({
      width,
    }),
  height: (height?: number | string) =>
    css({
      height,
    }),
  maxWidth: (maxWidth?: number | string) =>
    css({
      maxWidth,
    }),
  maxHeight: (maxHeight?: number | string) =>
    css({
      maxHeight,
    }),
  minWidth: (minWidth?: number | string) =>
    css({
      minWidth,
    }),
  minHeight: (minHeight?: number | string) =>
    css({
      minHeight,
    }),
  padding: (padding?: number | string) =>
    css({
      padding,
    }),
  margin: (margin?: number | string) =>
    css({
      margin,
    }),
  borderRadius: (borderRadius?: number | string) =>
    css({
      borderRadius,
    }),
  border: (border: string) =>
    css({
      border,
    }),
  outline: (outline: string) =>
    css({
      outline,
    }),
  overflow: (overflow: string) =>
    css({
      overflow,
    }),
  display: (display: string) =>
    css({
      display,
    }),
  flexDirection: (flexDirection?: any) =>
    css({
      flexDirection,
    }),
  scale: (scale?: number) =>
    css({
      scale,
    }),
  position: (position?: any) =>
    css({
      position,
    }),
  boxShadow: (boxShadow: string) =>
    css({
      boxShadow,
    }),
  textOverflow: (textOverflow: string) =>
    css({
      textOverflow,
    }),
  cursor: (cursor: string) =>
    css({
      cursor,
    }),
  background: (background: string) =>
    css({
      background,
    }),
  textAlign: (textAlign: any) =>
    css({
      textAlign,
    }),
  transition: (transition: string) =>
    css({
      transition,
    }),
  pointerEvents: (pointerEvents: any) =>
    css({
      pointerEvents,
    }),
  zIndex: (zIndex: number) =>
    css({
      zIndex,
    }),
  top: (top: number) =>
    css({
      top,
    }),
  left: (left: number) =>
    css({
      left,
    }),
  bottom: (bottom: number) =>
    css({
      bottom,
    }),
  right: (right: number) =>
    css({
      right,
    }),
  fontSize: (fontSize: number) =>
    css({
      fontSize,
    }),
  color: (color: string) =>
    css({
      color,
    }),
  textTruncate: (lines?: number) =>
    css({
      "-webkit-box-orient": "vertical",
      display: "-webkit-box",
      "-webkit-line-clamp": `${lines ?? 1}`,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "normal",
    }),
  imgCoverFitCss: css({
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }),
  centerCss: css({
    position: "relative",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  }),
  textEllipsisCss: css({
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  }),
  wordBreak: (wordBreak: any) => css({ wordBreak }),
  whiteSpace: (whiteSpace: any) => css({ whiteSpace }),
};
