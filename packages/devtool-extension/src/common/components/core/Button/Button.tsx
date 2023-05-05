import { css } from "@emotion/css";
//import Link from "next/link";
import type { Size } from "../../../constants/types";
import { Colors } from "../../../styles/colors";
import { buttonStyles, getButtonSize } from "./button.styles";
import ShellButton from "./ShellButton";

type ButtonType = "Primary" | "Secondary" | "Clear";

export interface ButtonProps {
  to?: any;
  onClick?: (e: any) => void;
  newTab?: boolean;
  children?: React.ReactNode;
  type?: ButtonType;
  size?: Size;
  padding?: string;
  className?: string;

  linkClass?: any;
}

const AnchorLink = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a {...props} />
);

const Button = (props: ButtonProps) => {
  const {
    to,
    onClick,
    newTab = false,
    children,
    padding,
    type = "Secondary",
    size = "small",
    className,
    linkClass,
  } = props;
  const onButtonClick = (e: any) => {
    // TODO: add tracking
    onClick?.(e);
  };
  if (!to) {
    return <ShellButton {...props} />;
  }

  const LinkClass = linkClass ?? AnchorLink;
  if (type === "Primary") {
    return (
      <LinkClass
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
      </LinkClass>
    );
  }
  if (type === "Clear") {
    return (
      <LinkClass
        href={to ?? ""}
        onClick={onButtonClick}
        className={css(
          getButtonSize(size, padding),
          buttonStyles.button(),
          buttonStyles.clear,
          className
        )}
      >
        {children}
      </LinkClass>
    );
  }
  return (
    <LinkClass
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
    </LinkClass>
  );
};

export default Button;
