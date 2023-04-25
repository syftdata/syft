import React from "react";
import { css } from "@emotion/css";
import { Colors } from "../../../styles/colors";
import { Flex } from "../../../styles/common.styles";
import { Label } from "../../../styles/fonts";

interface LabelledTileProps {
  label: string;
  children?: React.ReactNode;
  className?: string;
}
const LabelledTile = ({ label, children, className }: LabelledTileProps) => {
  return (
    <Flex.Col gap={10} className={css(Flex.grow(1), className)}>
      <Label.L12 color={Colors.Gray.V5}>{label}</Label.L12>
      {children}
    </Flex.Col>
  );
};

export default LabelledTile;
