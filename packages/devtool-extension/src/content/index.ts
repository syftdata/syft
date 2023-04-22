import { SyftEvent } from "../types";
import { initalizeBridge } from "./bridge";

// This method gets the properties of the element that triggered the event.
function getFromSyftEvent(event: CustomEvent): SyftEvent {
  const syftevent: SyftEvent = {
    name: event.detail.name,
    props: event.detail.props,
    syft_status: event.detail.syft_status,
    createdAt: event.detail.createdAt,
  };
  syftevent.createdAt = syftevent.props.time
    ? new Date(syftevent.props.time)
    : new Date();
  return syftevent;
}

initalizeBridge();

// Todo: Read from Syft object.
window.addEventListener(
  "syft-event",
  (event) => {
    chrome.runtime.sendMessage({
      ...getFromSyftEvent(event as CustomEvent),
    });
  },
  true
);

// // inject script
// const delay = 200
// setTimeout(() => {
//   const script = document.createElement('script')
//   script.src = chrome.runtime.getURL('scripts/react_devtools_hook.js')
//   document.head.appendChild(script)
// }, delay)

export {};
