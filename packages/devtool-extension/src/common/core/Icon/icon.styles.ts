import { css } from "@emotion/css";
import type { Size } from "../../constants/types";
import { Transition } from "../../styles/animations";

const getIconSize = (size: Size) => {
  switch (size) {
    case "xSmall":
      return 15;
    case "small":
      return 20;
    case "medium":
      return 25;
    case "large":
      return 30;
  }
};

export const iconStyles = {
  icon: (color: string, size: Size) =>
    css({
      color,
      height: getIconSize(size),
      width: getIconSize(size),
      transition: Transition.V1,
      display: "flex",
      alignItems: "center",
      svg: {
        height: "100%",
        width: "100%",
        color: color,
      },
    }),
};
