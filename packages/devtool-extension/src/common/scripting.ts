async function executeScript(tabId: number, frameId: number, file: string) {
  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    files: [file],
  });
}

// @ts-ignore-error - CRXJS needs injected scripts to be this way.
// https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import scriptPath from "../recorder?script";
export async function executeContentScript(tabId: number, frameId: number) {
  executeScript(tabId, frameId, scriptPath);
}

export async function executeCleanUp(tabId: number, frameId: number) {
  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    func: () => {
      if (typeof window?.__SYFT_CLEAN_UP === "function") {
        window.__SYFT_CLEAN_UP();
      }
    },
  });
}
