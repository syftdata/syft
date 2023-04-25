import React from "react";
import { css } from "@emotion/css";
import { Colors } from "../../../styles/colors";
import { Css } from "../../../styles/common.styles";

interface TileBodyProps {
  children?: React.ReactNode;
  className?: string;
}
const TileBody = ({ children, className }: TileBodyProps) => {
  return (
    <div
      className={css(
        Css.background(Colors.White),
        Css.border(`1px solid ${Colors.Gray.V1}`),
        Css.padding("12px 16px"),
        Css.overflow("scroll"),
        className
      )}
    >
      {children}
    </div>
  );
};

export default TileBody;
