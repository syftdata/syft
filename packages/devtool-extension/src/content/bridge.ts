function originFromWebapp(origin: string) {
  const originURL = new URL(origin);
  return (
    originURL.hostname === "localhost" ||
    originURL.hostname === "syftdata.com" ||
    originURL.hostname.indexOf(".syftdata.com") > -1
  );
}

export function initalizeBridge(): void {
  window.addEventListener("message", (event) => {
    const data = event?.data ?? {};
    if (
      data?.source === "syft-web-app" &&
      data?.type === "start-recording" &&
      originFromWebapp(event.origin)
    ) {
      chrome.runtime.sendMessage({ url: data?.url, type: "start-recording" });
    }

    if (
      data?.source === "syft-web-app" &&
      data?.type === "ping" &&
      originFromWebapp(event.origin)
    ) {
      window.postMessage({
        source: "syft-studio",
        type: "pong",
      });
    }
  });

  chrome.runtime.onMessage.addListener(async function (request) {
    if (request?.type === "playwright-test-recording") {
      window.postMessage({
        source: "syft-studio",
        type: "playwright-test-recording",
        code: request?.code,
        actions: request?.actions,
      });
    }
  });
}
