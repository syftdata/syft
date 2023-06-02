import React from "react";
import { unmountComponentAtNode } from "react-dom";
import ReactDOM from "react-dom/client";
import VisualTaggerApp from "./VisualTaggerApp";

// TODO: Move to shadow-root when it's supported in all browsers
// Emotion doesnt like shadow-root.

const target = document.body.appendChild(document.createElement("DIV"));
declare global {
  interface Window {
    __SYFT_CLEAN_UP: () => void;
    __SYFT_SCRIPT: boolean | null;
  }
}

// Expose a clean up function after a test completes
function cleanUp() {
  window.__SYFT_SCRIPT = null;
  unmountComponentAtNode(target);
}

// Expose clean up to window
window.__SYFT_CLEAN_UP = cleanUp;

if (window.__SYFT_SCRIPT == null) {
  window.__SYFT_SCRIPT = true;
  console.debug("[Syft][Content] Injecting the recorder app");
  ReactDOM.createRoot(target as HTMLElement).render(
    <React.StrictMode>
      <VisualTaggerApp />
    </React.StrictMode>
  );
} else {
  console.debug("[Syft][Content] Recorder app already injected");
}
