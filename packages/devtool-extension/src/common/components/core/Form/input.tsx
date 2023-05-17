import styled from "styled-components";
import { Colors } from "../../../styles/colors";

export interface InputProps {
  background?: string;
  noBorder?: boolean;
  placeholder?: string;
}

const BaseInput = styled.input<InputProps>`
  background: ${({ background }) => background ?? Colors.White};
  border: ${({ noBorder }) =>
    !noBorder ? `1px solid ${Colors.Gray.V3}` : "none"};
  border-radius: 4px;
  placeholder: ${({ placeholder }) => placeholder};
  &:focus {
    outline: none;
  }
  padding: 4px 4px;
`;

export const Input = {
  L10: styled(BaseInput)`
    font-size: 10px;
  `,
  L12: styled(BaseInput)`
    font-size: 12px;
  `,
  L14: styled(BaseInput)`
    font-size: 14px;
  `,
};
