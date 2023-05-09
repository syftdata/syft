import { css } from "@emotion/css";
import type { Size } from "../../../constants/types";
import { Transition } from "../../../styles/animations";
import { Colors } from "../../../styles/colors";

export const buttonStyles = {
  button: (background?: string) =>
    css({
      background,
      borderRadius: 5,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "none !important",
      transition: Transition.V2,
      color: Colors.White,
      cursor: "pointer",
    }),
  primary: css({
    ">*": {
      color: `${Colors.White} !important`,
    },
  }),
};

export const getButtonSize = (size: Size, padding?: string) => {
  switch (size) {
    case "xSmall":
      return css({
        height: 24,
        padding: padding ?? "10px 12px",
      });
    case "small":
      return css({
        height: 28,
        padding: padding ?? "10px 16px",
      });
    case "medium":
      return css({
        height: 32,
        padding: padding ?? "10px 26px",
      });
    case "large":
      return css({
        height: 40,
        padding: padding ?? "10px 38px",
      });
  }
};
