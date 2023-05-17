import { useEffect, useState } from "react";
import { Css, Flex, FlexExtra } from "../common/styles/common.styles";
import Section from "../common/components/core/Section";
import { css } from "@emotion/css";
import {
  IconButton,
  PrimaryIconButton,
} from "../common/components/core/Button/IconButton";
import { SyftRunner, createSyftRunner } from "../replay";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import { Step } from "@puppeteer/replay";
import PuppeteerStepList from "./PuppeteerStepList";

interface RecordPreviewViewProps {
  steps: Step[];
  scriptTitle: string;
  onClose: () => void;
  className?: string;
  startPlaying?: boolean;
}

export default function RecordPreviewView({
  steps,
  scriptTitle,
  onClose,
  className,
  startPlaying = false,
}: RecordPreviewViewProps) {
  const [isPlaying, setIsPlaying] = useState(startPlaying);
  const [runner, setRunner] = useState<SyftRunner | undefined>();
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [failedIndex, setFailedIndex] = useState(-1);

  // set playing to control index and initialize the runner.
  // it stops the previously running runner if exists.
  useEffect(() => {
    if (isPlaying) {
      // stop previous script
      if (!runner) {
        createSyftRunner().then((syftRunner) => {
          if (syftRunner != null) {
            setRunner(syftRunner);
            syftRunner.transport.onclose = () => {
              setIsPlaying(false);
            };
            setFailedIndex(-1);
            setPlayingIndex(0);
          }
        });
      } else {
        setFailedIndex(-1);
        setPlayingIndex(0);
      }
    } else {
      if (runner) {
        runner.transport.onclose = undefined;
        runner.transport.close();
      }
      setPlayingIndex(-1);
    }
  }, [isPlaying]);

  // set playing-index to control the runner.
  useEffect(() => {
    if (playingIndex != -1) {
      // run script one by one.
      if (runner) {
        if (playingIndex >= steps.length) {
          setIsPlaying(false);
        } else {
          const call = async () => {
            const step = steps[playingIndex];
            await runner.runner.runStep(step);
          };
          call()
            .then(() => {
              setPlayingIndex(playingIndex + 1);
            })
            .catch((e) => {
              console.error(e);
              setFailedIndex(playingIndex);
              setIsPlaying(false);
            });
        }
      }
    } else {
      if (runner) {
        runner.onComplete();
        setRunner(undefined);
      }
    }
  }, [playingIndex]);

  return (
    <Flex.Col className={className}>
      <FlexExtra.RowWithDivider
        gap={4}
        alignItems="center"
        justifyContent="space-between"
        className={Css.padding("8px 12px")}
      >
        <LabelledValue label="Title" value={scriptTitle} />
        <Flex.Row gap={4} justifyContent="end" alignItems="center">
          <PrimaryIconButton
            onClick={() => {
              setIsPlaying(!isPlaying);
            }}
            icon={isPlaying ? "pause" : "play"}
            label="Preview"
          />
          <IconButton
            onClick={() => {
              setIsPlaying(false);
              onClose();
            }}
            icon="close"
          />
        </Flex.Row>
      </FlexExtra.RowWithDivider>
      <Section title="Script">
        <Flex.Col
          className={css(
            Css.overflow("scroll"),
            Css.maxHeight("calc(100vh - 180px)")
          )}
        >
          <PuppeteerStepList
            steps={steps}
            playingIndex={playingIndex}
            failedIndex={failedIndex}
          />
        </Flex.Col>
      </Section>
    </Flex.Col>
  );
}
