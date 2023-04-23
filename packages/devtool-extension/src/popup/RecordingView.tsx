import { Flex } from "../common/styles/common.styles";
import { Subheading } from "../common/styles/fonts";
import { IconButton, PrimaryIconButton } from "../common/core/Button";

interface RecordingViewProps {
  onEndRecording: () => void;
  recordingTabId: number | null;
  curretTabId: number | null;
}

export const RecordingView = ({
  curretTabId,
  recordingTabId,
  onEndRecording,
}: RecordingViewProps) => {
  const isRecordingCurrentTab = curretTabId === recordingTabId;
  return (
    <Flex.Col alignItems="center" gap={8}>
      <Subheading.SH14>
        Recording{isRecordingCurrentTab ? "..." : " on Another Tab"}
      </Subheading.SH14>
      {!isRecordingCurrentTab && recordingTabId != null && (
        <IconButton
          onClick={() => {
            chrome.tabs.update(recordingTabId, { active: true });
            window.close();
          }}
          size="medium"
          label="Go To Recording Tab"
        />
      )}
      <PrimaryIconButton
        onClick={onEndRecording}
        size="large"
        icon="video-camera-off"
        label="Stop Recording"
      />
    </Flex.Col>
  );
};
