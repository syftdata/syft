import { getCurrentTabId } from "../common/utils";
import { MessageType } from "../types";

chrome.devtools.panels.create(
  "Syft Studio",
  "img/logo-48.png",
  "./devpanel.html",
  (panel) => {
    const tabId = getCurrentTabId();
    panel.onSearch.addListener((action, query) => {
      chrome.runtime.sendMessage({
        tabId,
        type: MessageType.OnSearch,
        payload: { action, query },
      });
    });
    panel.onShown.addListener(() => {
      chrome.runtime.sendMessage({
        tabId,
        type: MessageType.OnShown,
      });
    });
    panel.onHidden.addListener(() => {
      chrome.runtime.sendMessage({
        tabId,
        type: MessageType.OnHidden,
      });
    });
    // const recordButton = panel.createStatusBarButton(
    //   "img/logo-32.png",
    //   "Play Recording",
    //   false
    // );
    // const onRecordingClicked = () => {
    //   void openNewTab();
    // };
    // recordButton.onClicked.addListener(onRecordingClicked);
  }
);
export {};
