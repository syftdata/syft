import { css } from "@emotion/css";
import { Colors } from "../../../styles/colors";
import type { ButtonProps } from "./Button";
import { buttonStyles, getButtonSize } from "./button.styles";

const ShellButton = ({
  onClick,
  children,
  padding,
  type = "Secondary",
  size = "small",
  className,
}: ButtonProps) => {
  const onButtonClick = (e: any) => {
    // TODO: add tracking
    onClick?.(e);
  };

  if (type === "Primary") {
    return (
      <div
        onClick={onButtonClick}
        className={css(
          getButtonSize(size, padding),
          buttonStyles.button(Colors.Branding.Blue),
          buttonStyles.primary,
          className
        )}
      >
        {children}
      </div>
    );
  }
  if (type === "Clear") {
    return (
      <div
        onClick={onButtonClick}
        className={css(
          getButtonSize(size, padding),
          buttonStyles.button(),
          className
        )}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      onClick={onButtonClick}
      className={css(
        getButtonSize(size, padding),
        buttonStyles.button(Colors.Branding.V1),
        className
      )}
    >
      {children}
    </div>
  );
};

export default ShellButton;
