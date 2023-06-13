import { css } from "@emotion/css";
import type { Size } from "../../../constants/types";

export const getInputSize = (size: Size, padding?: string) => {
  switch (size) {
    case "xSmall":
      return css({
        fontSize: 10,
        padding: padding ?? "2px 4px",
      });
    case "small":
      return css({
        fontSize: 12,
        padding: padding ?? "4px 8px",
      });
    case "medium":
      return css({
        fontSize: 14,
        padding: padding ?? "6px 10px",
      });
    case "large":
      return css({
        fontSize: 18,
        padding: padding ?? "10px 26px",
      });
  }
};
