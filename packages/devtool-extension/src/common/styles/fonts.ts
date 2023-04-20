
import styled from 'styled-components';
import { Colors } from './colors';

const headingFontWeight = 'font-weight: 700';

const Heading = {
  H38: styled.div`
    ${headingFontWeight};
    font-size: 38px;
    color: ${props => props.color || Colors.Black};
  `,
  H32: styled.div`
    ${headingFontWeight};
    font-size: 32px;
    color: ${props => props.color || Colors.Black};
  `,
  H26: styled.div`
    ${headingFontWeight};
    font-size: 26px;
    color: ${props => props.color || Colors.Black};
  `,
  H22: styled.div`
    ${headingFontWeight};
    font-size: 22px;
    color: ${props => props.color || Colors.Black};
  `,
  H18: styled.div`
    ${headingFontWeight};
    font-size: 18px;
    color: ${props => props.color || Colors.Black};
  `,
  H14: styled.div`
    ${headingFontWeight};
    font-size: 14px;
    color: ${props => props.color || Colors.Black};
  `,
  H12: styled.div`
    ${headingFontWeight};
    font-size: 12px;
    color: ${props => props.color || Colors.Black};
  `,
}

const labelFontWeight = 'font-weight: 700';

const Label = {
  L14: styled.div`
    ${labelFontWeight};
    font-size: 14px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${props => props.color || Colors.Black};
  `,
  L12: styled.div`
    ${labelFontWeight};
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${props => props.color || Colors.Black};
  `,
  L10: styled.div`
    ${labelFontWeight};
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${props => props.color || Colors.Black};
  `,
}


const subheadingFontWeight = 'font-weight: 600';

const Subheading = {
  SH22: styled.div`
    ${subheadingFontWeight};
    font-size: 22px;
    color: ${props => props.color || Colors.Black};
  `,
  SH18: styled.div`
    ${subheadingFontWeight};
    font-size: 18px;
    color: ${props => props.color || Colors.Black};
  `,
  SH14: styled.div`
    ${subheadingFontWeight};
    font-size: 14px;
    color: ${props => props.color || Colors.Black};
  `,
  SH12: styled.div`
    ${subheadingFontWeight};
    font-size: 12px;
    color: ${props => props.color || Colors.Black};
  `,
  SH10: styled.div`
    ${subheadingFontWeight};
    font-size: 10px;
    color: ${props => props.color || Colors.Black};
  `,

}

const paragraphFontWeight = 'font-weight: 500';

const Paragraph = {
  P22: styled.div`
    ${paragraphFontWeight};
    font-size: 22px;
     color: ${props => props.color || Colors.Black};
`,
  P18: styled.div`
    ${paragraphFontWeight};
    font-size: 18px;
    
    color: ${props => props.color || Colors.Black};
  `,
  P14: styled.div`
    ${paragraphFontWeight};
    font-size: 14px;
    color: ${props => props.color || Colors.Black};
  `,
  P12: styled.div`
    ${paragraphFontWeight};
    font-size: 12px;
    color: ${props => props.color || Colors.Black};
  `,
  P10: styled.div`
    ${paragraphFontWeight};
    font-size: 10px;
    color: ${props => props.color || Colors.Black};
  `,
}

const monoFontWeight = 'font-weight: 500';
const monoFontFamily = `'Azeret Mono', monospace`;

const Mono = {
  M14: styled.div`
    ${monoFontWeight};
    font-size: 14px;
    font-family: ${monoFontFamily};
    color: ${props => props.color || Colors.Black};
  `,
  M12: styled.div`
    ${monoFontWeight};
    font-size: 12px;
    font-family: ${monoFontFamily};

    color: ${props => props.color || Colors.Black};
  `,
  M10: styled.div`
    ${monoFontWeight};
    font-size: 10px;
    font-family: ${monoFontFamily};
    color: ${props => props.color || Colors.Black};
  `,
}


export {
  Heading,
  Subheading,
  Paragraph,
  Label,
  Mono,
};