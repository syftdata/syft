import { css } from "@emotion/css";
import { Input as AntdInput } from "antd";
import { Colors } from "../../../styles/colors";
import { Css, Flex } from "../../../styles/common.styles";
import { Subheading } from "../../../styles/fonts";

interface InputProps {
  label?: string;
  placeholder?: string;
}
const Input = ({ label, placeholder }: InputProps) => {
  return (
    <Flex.Col gap={4}>
      <Subheading.SH12 color={Colors.Gray.V7}>{label}</Subheading.SH12>
      <AntdInput
        placeholder={placeholder}
        className={css(
          Css.border(`1px solid ${Colors.Gray.V1}`),
          Css.borderRadius(4),
          Css.brandingFont,
          Css.fontSize(12),
          Css.padding("6px 10px")
        )}
      />
    </Flex.Col>
  );
};

export default Input;
