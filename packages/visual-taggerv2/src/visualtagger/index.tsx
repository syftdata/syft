import React from "react";
import ReactDOM, { Root } from "react-dom/client";
import VisualTaggerApp from "./VisualTaggerApp";

// TODO: Move to shadow-root when it's supported in all browsers
// Emotion doesnt like shadow-root.

const target = document.body.appendChild(document.createElement("DIV"));
let reactRoot: Root;
declare global {
  interface Window {
    __SYFT_TAGGER_CLEAN_UP: () => void;
    __SYFT_SCRIPT?: boolean;
    __SYFT_TAGGER_SETUP: () => void;
  }
}

// Expose a clean up function after a test completes
function cleanUp() {
  console.debug("[Syft][Content] cleaning up the recorder app");
  window.__SYFT_SCRIPT = false;
  if (reactRoot) {
    reactRoot.unmount();
  }
}

function setup() {
  if (!window.__SYFT_SCRIPT) {
    window.__SYFT_SCRIPT = true;
    console.debug("[Syft][Content] Injecting the recorder app");
    reactRoot = ReactDOM.createRoot(target as HTMLElement);
    reactRoot.render(
      <React.StrictMode>
        <VisualTaggerApp />
      </React.StrictMode>
    );
  } else {
    console.debug("[Syft][Content] Recorder app already injected");
  }
}

// Expose clean up to window
window.__SYFT_TAGGER_CLEAN_UP = cleanUp;
window.__SYFT_TAGGER_SETUP = setup;
setup();
