import React from "react";
import { css } from "@emotion/css";
import { Colors } from "../../../styles/colors";
import { Css, Flex } from "../../../styles/common.styles";
import { Heading, Subheading } from "../../../styles/fonts";

interface PageHeaderProps {
  title?: string;
  subTitle?: string;
  rightItem?: React.ReactNode;
  className?: string;
}
const PageHeader = ({
  title,
  subTitle,
  rightItem,
  className,
}: PageHeaderProps) => {
  return (
    <Flex.Row
      className={css(
        Css.position("sticky"),
        Css.top(0),
        Css.right(0),
        Css.padding("22px 30px 12px"),
        Css.background(Colors.Gray.Background),
        Css.zIndex(10),
        className
      )}
      alignItems="center"
      justifyContent="space-between"
    >
      <Flex.Col gap={2}>
        <Heading.H14>{title}</Heading.H14>
        <Subheading.SH12 color={Colors.Gray.V5}>{subTitle}</Subheading.SH12>
      </Flex.Col>
      {rightItem}
    </Flex.Row>
  );
};

export default PageHeader;
