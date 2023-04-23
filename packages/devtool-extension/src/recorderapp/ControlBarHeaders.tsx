import { Css, Flex } from "../common/styles/common.styles";
import { Heading, Subheading } from "../common/styles/fonts";
import { IconButton } from "../common/core/Button";
import { Action } from "../types";

export function RecordDoneHeader() {
  return (
    <Flex.Col gap={4} className={Css.padding(4)}>
      <Flex.Row justifyContent="space-between">
        <Heading.H18>Recording Finished!</Heading.H18>
      </Flex.Row>
      <Flex.Row>
        <Subheading.SH12>
          Below is the generated code for this recording.
        </Subheading.SH12>
      </Flex.Row>
    </Flex.Col>
  );
}

export interface RecordingHeaderProps {
  onEndRecording: () => void;
  onInsertEvent: () => void;
}

export function RecordingHeader({
  onEndRecording,
  onInsertEvent,
}: RecordingHeaderProps) {
  return (
    <Flex.Row gap={4} alignItems="center" justifyContent="start">
      <IconButton
        label="Stop Rec"
        icon="video-camera-off"
        onClick={onEndRecording}
        size="large"
      />
      <IconButton
        label="Event"
        icon="plus"
        onClick={onInsertEvent}
        size="large"
      />
    </Flex.Row>
  );
}
