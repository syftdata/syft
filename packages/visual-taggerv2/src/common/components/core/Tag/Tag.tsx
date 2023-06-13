import { css } from "@emotion/css";
import { Colors } from "../../../styles/colors";
import { Css, Flex } from "../../../styles/common.styles";
import { Label } from "../../../styles/fonts";

interface TagProps {
  label: string;
  color?: string;
}
const Tag = ({ label, color }: TagProps) => {
  return (
    <Flex.Row
      className={css(
        Css.background(color ?? Colors.Branding.V1),
        Css.padding("4px 8px"),
        Css.borderRadius(4)
      )}
    >
      <Label.L10>{label}</Label.L10>
    </Flex.Row>
  );
};

export default Tag;
