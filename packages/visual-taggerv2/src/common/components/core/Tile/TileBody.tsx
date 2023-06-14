import React from "react";
import { css } from "@emotion/css";
import { Colors } from "../../../styles/colors";
import { Css } from "../../../styles/common.styles";

interface TileBodyProps {
  children?: React.ReactNode;
  className?: string;
  color?: string;
}
const TileBody = ({ children, className, color }: TileBodyProps) => {
  return (
    <div
      className={css(
        Css.background(color ?? Colors.White),
        Css.border(`1px solid ${Colors.Gray.V1}`),
        Css.padding("12px 16px"),
        Css.overflow("auto"),
        className
      )}
    >
      {children}
    </div>
  );
};

export default TileBody;
