import React from "react";
import { css } from "@emotion/css";
import { Colors } from "../../../styles/colors";
import { Css, Flex } from "../../../styles/common.styles";
import { Label, Mono, Paragraph, Subheading } from "../../../styles/fonts";

type TableCellType = "default" | "mono" | "enum" | "header" | "custom";
export interface DoubleRowCellValue {
  title: string;
  subTitle: string;
}

interface TableCellProps {
  value?: string;
  type?: TableCellType;
  className?: string;
  textClassName?: string;
  justifyContent?: string;
  children?: React.ReactNode;
}
const TableCell = ({
  value,
  type,
  className,
  textClassName,
  justifyContent = "start",
  children,
}: TableCellProps) => {
  let text = <Paragraph.P12 className={textClassName}>{value}</Paragraph.P12>;
  if (type === "mono") {
    text = <Mono.M10 className={textClassName}>{value}</Mono.M10>;
  }
  if (type === "enum") {
    text = (
      <Label.L10 className={textClassName} color={Colors.Branding.DarkBlue}>
        {value}
      </Label.L10>
    );
  }
  if (type === "header") {
    text = <Subheading.SH10 color={Colors.Gray.V9}>{value}</Subheading.SH10>;
  }
  return (
    <Flex.Row
      justifyContent={justifyContent}
      className={css(Css.padding("6px 0"), className)}
    >
      {type === "custom" ? children : text}
    </Flex.Row>
  );
};

export default TableCell;
