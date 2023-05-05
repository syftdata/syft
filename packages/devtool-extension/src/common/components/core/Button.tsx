import Icon, { IconName } from "./Icon/Icon";
import { Css, Flex } from "../../styles/common.styles";
import { cx } from "@emotion/css";
import { Colors } from "../../styles/colors";
import { Label, Paragraph } from "../../styles/fonts";

function getLabel(size: "small" | "medium" | "large"): any {
  switch (size) {
    case "small":
      return Label.L10;
    case "medium":
      return Label.L14;
    case "large":
      return Paragraph.P18; // for large buttons, show regular text.
  }
}

export interface IconButtonProps {
  onClick?: () => void;
  label?: String; // label or icon is required.
  icon?: IconName;
  size?: "small" | "medium" | "large";
  reverseIcon?: boolean; // puts icon at the end.
  className?: string;
  color?: string;
  backgroundColor?: string;
}

export const PrimaryIconButton = (iconProps: IconButtonProps) => (
  <IconButton
    {...iconProps}
    backgroundColor={Colors.Branding.DarkBlue}
    color={Colors.White}
  />
);

export const IconButton = ({
  onClick,
  icon,
  label,
  size,
  reverseIcon,
  className,
  color,
  backgroundColor,
}: IconButtonProps) => {
  const defaultSize = size ?? "small";
  const defaultColor = color ?? Colors.Gray.V7;
  const defaultBackgroundColor = backgroundColor ?? Colors.Transparent.Light.V1;
  const Comp = getLabel(defaultSize);
  return (
    <Flex.Row
      gap={2}
      className={cx(
        Css.background(defaultBackgroundColor),
        Css.padding(4),
        className,
        Css.cursor("pointer"),
        Css.flexDirection(reverseIcon ? "row-reverse!important" : "row")
      )}
      onClick={onClick}
      alignItems="center"
    >
      {icon ? <Icon icon={icon} size={size} color={defaultColor} /> : <></>}
      {label ? <Comp color={defaultColor}>{label}</Comp> : <></>}
    </Flex.Row>
  );
};
