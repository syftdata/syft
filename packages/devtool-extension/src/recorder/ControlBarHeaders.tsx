import { Css, Flex } from "../common/styles/common.styles";
import { Heading, Label, Paragraph, Subheading } from "../common/styles/fonts";
import { IconButton } from "./Button";
import { Action, BarPosition } from "../types";
import { ActionText2 } from "../common/ActionText";
import { cx } from "@emotion/css";

export interface RecordDoneHeaderProps {
  onClose: () => void;
  showActions: boolean;
  toggleShowActions: () => void;
}

export function RecordDoneHeader({
  onClose,
  showActions,
  toggleShowActions,
}: RecordDoneHeaderProps) {
  return (
    <Flex.Col gap={4} className={Css.padding(4)}>
      <Flex.Row justifyContent="space-between">
        <Heading.H18>Recording Finished!</Heading.H18>
        <IconButton onClick={onClose} icon="close" size="large" />
      </Flex.Row>
      <Flex.Row>
        <Subheading.SH12>
          Below is the generated code for this recording.
        </Subheading.SH12>
        <IconButton
          icon={showActions ? "chevron-up" : "chevron-down"}
          label={showActions ? "Close Details" : "Open Details"}
          onClick={toggleShowActions}
          size="small"
          reverseIcon={true}
        />
      </Flex.Row>
    </Flex.Col>
  );
}

export interface RecordingHeaderProps {
  onEndRecording: () => void;
  onInsertEvent: () => void;
  barPosition: BarPosition | null;
  setBarPosition: (position: BarPosition) => void;
  showActions: boolean;
  toggleShowActions: () => void;
  lastAction: Action | null;
}

export function RecordingHeader({
  onEndRecording,
  onInsertEvent,
  barPosition,
  setBarPosition,
  showActions,
  toggleShowActions,
  lastAction,
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
      <Flex.Col
        gap={4}
        className={cx(Flex.grow(1), Css.maxWidth(290), Css.textEllipsisCss)}
      >
        <Label.L12>Last Action</Label.L12>
        {lastAction && <ActionText2 action={lastAction} />}
      </Flex.Col>
      <Flex.Col gap={4} alignItems="start">
        <IconButton
          label={`Move to ${
            barPosition === BarPosition.Bottom ? "Top" : "Bottom"
          }`}
          onClick={() =>
            setBarPosition(
              barPosition === BarPosition.Bottom
                ? BarPosition.Top
                : BarPosition.Bottom
            )
          }
        />
        <IconButton
          icon={showActions ? "chevron-up" : "chevron-down"}
          label={showActions ? "Close Details" : "Open Details"}
          onClick={toggleShowActions}
          reverseIcon={true}
        />
      </Flex.Col>
    </Flex.Row>
  );
}
