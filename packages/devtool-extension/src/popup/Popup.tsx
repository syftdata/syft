import { useEffect, useState } from "react";
import { endRecording } from "../common/endRecording";
import {
  setStartRecordingStorage,
  getCurrentTab,
  executeCleanUp,
  executeContentScript,
} from "../common/utils";
import { usePreferredLibrary, useRecordingState } from "../common/hooks";

import { Heading } from "../common/styles/fonts";
import RecordScriptView from "../recorder/RecordScriptView";
import { ScriptType } from "../types";
import { IconButton } from "../recorder/Button";
import { HomeView } from "./HomeView";
import { RecordingView } from "./RecordingView";
import { Css, Flex } from "../common/styles/common.styles";
import { cx } from "@emotion/css";

const Popup = () => {
  const [_scriptType, setScriptType] = usePreferredLibrary();
  const [recordingTabId, actions] = useRecordingState();
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [isShowingLastTest, setIsShowingLastTest] = useState<boolean>(false);

  useEffect(() => {
    getCurrentTab().then((tab) => {
      const { id } = tab;
      setCurrentTabId(id ?? null);
    });
  }, []);

  const onRecordNewTestClick = async () => {
    const currentTab = await getCurrentTab();
    const tabId = currentTab.id;

    if (tabId == null) {
      throw new Error("No tab id found");
    }
    setStartRecordingStorage(tabId, 0, currentTab.url || "");
    await executeCleanUp(tabId, 0);
    await executeContentScript(tabId, 0);
    window.close();
  };

  const activePage =
    recordingTabId != null
      ? "recording"
      : isShowingLastTest
      ? "lastTest"
      : "home";
  const scriptType = _scriptType ?? ScriptType.Playwright;
  return (
    <>
      <Flex.Col
        gap={14}
        alignItems="center"
        className={cx(Css.padding(10), Css.width(650))}
      >
        <Heading.H22>Syft</Heading.H22>
        {activePage === "recording" && (
          <RecordingView
            curretTabId={currentTabId}
            recordingTabId={recordingTabId}
            onEndRecording={() => {
              endRecording();
              setIsShowingLastTest(true);
            }}
          />
        )}
        {activePage === "home" && (
          <HomeView
            onStartRecording={() => onRecordNewTestClick()}
            onViewLastRecording={() => setIsShowingLastTest(true)}
          />
        )}
        {activePage === "lastTest" && (
          <RecordScriptView
            actions={actions}
            scriptType={scriptType}
            setScriptType={setScriptType}
            header={
              <IconButton
                icon="arrow-left"
                onClick={() => {
                  setIsShowingLastTest(false);
                }}
                size="small"
              />
            }
          />
        )}
      </Flex.Col>
    </>
  );
};

export default Popup;
