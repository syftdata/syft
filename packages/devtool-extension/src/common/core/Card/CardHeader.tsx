import React from "react";
import { css } from "@emotion/css";
import { Colors } from "../../styles/colors";
import { Css, Flex } from "../../styles/common.styles";
import { Heading, Subheading } from "../../styles/fonts";

export interface CardHeaderProps {
  title?: string;
  subTitle?: string;
  rightItem?: React.ReactNode;
  className?: string;
}
const CardHeader = ({
  title,
  subTitle,
  rightItem,
  className,
}: CardHeaderProps) => {
  return (
    <Flex.Row
      className={css(
        Css.padding(10),
        Css.background(Colors.Branding.V1),
        className
      )}
      justifyContent="space-between"
    >
      <Flex.Col gap={2}>
        <Heading.H14 color={Colors.Branding.DarkBlue}>{title}</Heading.H14>
        {subTitle && (
          <Subheading.SH12 color={Colors.Gray.V5}>{subTitle}</Subheading.SH12>
        )}
      </Flex.Col>
      {rightItem}
    </Flex.Row>
  );
};

export default CardHeader;
