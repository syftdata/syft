import React from "react";
import { css } from "@emotion/css";
import { Css, Flex } from "../../../styles/common.styles";

interface PageBodyProps {
  children?: React.ReactNode;
  className?: string;
}
const PageBody = ({ children, className }: PageBodyProps) => {
  return (
    <div className={css(Css.padding("12px 30px"), Flex.grow(1), className)}>
      {children}
    </div>
  );
};

export default PageBody;
