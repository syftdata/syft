import { css } from "@emotion/css";
import Link from "next/link";
import type { Size } from "../../../constants/types";
import { Colors } from "../../../styles/colors";
import { buttonStyles, getButtonSize } from "./button.styles";
import ShellButton from "./ShellButton";

type ButtonType = "Primary" | "Secondary" | "Clear";

export interface ButtonProps {
  id?: string;
  to?: any;
  onClick?: () => void;
  newTab?: boolean;
  children?: React.ReactNode;
  type?: ButtonType;
  size?: Size;
  padding?: string;
  className?: string;
}

const Button = (props: ButtonProps) => {
  const {
    id,
    to,
    onClick,
    newTab = false,
    children,
    padding,
    type = "Secondary",
    size = "small",
    className,
  } = props;
  const onButtonClick = () => {
    // TODO: add tracking
    onClick?.();
  };
  if (!to) {
    return <ShellButton {...props} />;
  }
  if (type === "Primary") {
    return (
      <Link
        href={to ?? ""}
        onClick={onButtonClick}
        target={newTab ? "_blank" : undefined}
        className={css(
          getButtonSize(size, padding),
          buttonStyles.button(Colors.Branding.Blue),
          buttonStyles.primary,
          className
        )}
      >
        {children}
      </Link>
    );
  }
  if (type === "Clear") {
    return (
      <Link
        href={to ?? ""}
        onClick={onButtonClick}
        className={css(
          getButtonSize(size, padding),
          buttonStyles.button(),
          className
        )}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={to ?? ""}
      onClick={onButtonClick}
      target={newTab ? "_blank" : undefined}
      className={css(
        getButtonSize(size, padding),
        buttonStyles.button(Colors.Branding.V1),
        buttonStyles.primary,
        className
      )}
    >
      {children}
    </Link>
  );
};

export default Button;
