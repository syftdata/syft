import styled from 'styled-components';
import { Colors } from '../../../styles/colors';

export interface InputProps {
  placeholder?: string;
}

export const Input = {
  L10: styled.input<InputProps>`
    background: ${Colors.Gray.V1};
    border: none;
    &:focus {
        outline: none;
    };
    placeholder: ${({ placeholder }) => placeholder};
    font-size: 10px;
    padding: "4px 8px";
  `,
  L12: styled.input<InputProps>`
    background: ${Colors.Gray.V1};
    border: none;
    &:focus {
        outline: none;
    };
    placeholder: ${({ placeholder }) => placeholder};
    font-size: 12px;
    padding: "4px 8px";
  `,
  L14: styled.input<InputProps>`
    background: ${Colors.Gray.V1};
    border: none;
    &:focus {
        outline: none;
    };
    placeholder: ${({ placeholder }) => placeholder};
    font-size: 14px;
    padding: "4px 8px";
  `  
}