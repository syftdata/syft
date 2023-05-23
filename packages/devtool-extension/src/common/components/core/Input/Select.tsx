import { css } from "@emotion/css";
import AntdSelect, {
  type SelectProps as AntdSelectProps,
} from "antd/lib/select";
import { Colors } from "../../../styles/colors";
import { Css, Flex } from "../../../styles/common.styles";
import { Subheading } from "../../../styles/fonts";

interface SelectProps extends AntdSelectProps {
  label?: string;
  rowWise?: boolean;
  width?: number | string;
}

const InnerSelect = ({ label, width, ...otherSelectProps }: SelectProps) => {
  return (
    <>
      <Subheading.SH12 color={Colors.Gray.V7}>{label}</Subheading.SH12>
      <AntdSelect
        {...otherSelectProps}
        className={css(
          Css.borderRadius(4),
          Css.width(width),
          Css.brandingFont,
          Css.fontSize(12)
        )}
      />
    </>
  );
};

const Select = ({ rowWise, ...otherProps }: SelectProps) => {
  if (rowWise) {
    return (
      <Flex.Row gap={4} alignItems="center">
        <InnerSelect {...otherProps} />
      </Flex.Row>
    );
  }
  return (
    <Flex.Col gap={4}>
      <InnerSelect {...otherProps} />
    </Flex.Col>
  );
};

export const SelectOption = AntdSelect.Option;

export default Select;
