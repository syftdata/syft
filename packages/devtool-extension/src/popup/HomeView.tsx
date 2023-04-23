import { Flex } from "../common/styles/common.styles";
import { Subheading } from "../common/styles/fonts";
import { IconButton, PrimaryIconButton } from "../common/core/Button";

interface HomeViewProps {
  onStartRecording: () => void;
  onViewLastRecording: () => void;
}

export const HomeView = ({
  onStartRecording,
  onViewLastRecording,
}: HomeViewProps) => {
  return (
    <Flex.Col alignItems="center" gap={8}>
      <Subheading.SH14>Generate Event Test Specs easily.</Subheading.SH14>
      <PrimaryIconButton
        onClick={onStartRecording}
        size="large"
        icon="video-camera"
        label="Start Recording"
      />
      <IconButton
        onClick={onViewLastRecording}
        size="small"
        icon="check-circle"
        label="View Last Recording"
      />
    </Flex.Col>
  );
};
