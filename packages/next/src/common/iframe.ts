export function checkIframeLoaded(
  iframe: HTMLIFrameElement,
  callback: () => void
): void {
  const iframeDoc = iframe.contentDocument ?? iframe.contentWindow.document;
  // Check if loading is complete
  if (iframeDoc.readyState === 'complete') {
    // iframe.contentWindow.alert("Hello");
    // iframe.contentWindow.onload = function () {
    //   alert('I am loaded');
    // };
    // The loading is complete, call the function we want executed once the iframe is loaded
    callback();
    return;
  }

  // If we are here, it is not loaded. Set things up so we check   the status again in 100 milliseconds
  window.setTimeout(checkIframeLoaded, 100);
}
