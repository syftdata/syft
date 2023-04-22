import React from "react";
import { css } from "@emotion/css";
import { Css, Flex, FlexProps } from "../../styles/common.styles";
import { Colors } from "../../styles/colors";

interface CardProps extends FlexProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}
const Card = ({ children, className, id }: CardProps) => {
  return (
    <Flex.Col
      id={id}
      className={css(
        Css.margin("4px"),
        Css.background(Colors.Branding.V1),
        Css.boxShadow("0px 2px 4px rgba(0, 0, 0, 0.1)"),
        Css.borderRadius(4),
        className
      )}
    >
      {children}
    </Flex.Col>
  );
};

export default Card;
