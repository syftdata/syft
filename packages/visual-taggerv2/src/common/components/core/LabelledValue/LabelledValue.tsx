import { Colors } from "../../../styles/colors";
import { Flex } from "../../../styles/common.styles";
import { Label, Mono } from "../../../styles/fonts";

interface LabelledValueProps {
  label: string;
  value?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
const LabelledValue = ({
  label,
  value,
  children,
  className,
  onClick,
}: LabelledValueProps) => {
  return (
    <Flex.Col gap={4} className={className} onClick={onClick}>
      <Label.L10 color={Colors.Gray.V5}>{label}</Label.L10>
      {value && <Mono.M10>{value}</Mono.M10>}
      {children}
    </Flex.Col>
  );
};

export default LabelledValue;
