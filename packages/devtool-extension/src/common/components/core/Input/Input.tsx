import { css } from "@emotion/css";
import AntdInput, { type InputProps as AntdInputProps } from "antd/lib/input";
import { Colors } from "../../../styles/colors";
import { Css, Flex } from "../../../styles/common.styles";
import { Subheading } from "../../../styles/fonts";

interface InputProps extends AntdInputProps {
  label?: string;
}
const Input = ({ label, ...otherInputProps }: InputProps) => {
  return (
    <Flex.Col gap={4}>
      <Subheading.SH12 color={Colors.Gray.V7}>{label}</Subheading.SH12>
      <AntdInput
        {...otherInputProps}
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
