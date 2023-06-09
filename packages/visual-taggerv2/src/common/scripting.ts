async function executeScript(tabId: number, frameId: number, file: string) {
  return await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    files: [file],
    injectImmediately: true,
  });
}

// @ts-ignore-error - CRXJS needs injected scripts to be this way.
// https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import scriptPath from "../visualtagger?script";
export async function executeContentScript(tabId: number, frameId: number) {
  console.warn("Executing content script", scriptPath);
  await executeScript(tabId, frameId, scriptPath);
  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    func: () => {
      if (typeof window?.__SYFT_TAGGER_SETUP === "function") {
        window.__SYFT_TAGGER_SETUP();
      }
    },
  });
}

export async function executeCleanUp(tabId: number, frameId: number) {
  console.warn("Executing cleanup script");
  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    func: () => {
      if (typeof window?.__SYFT_TAGGER_CLEAN_UP === "function") {
        window.__SYFT_TAGGER_CLEAN_UP();
      }
    },
  });
}
