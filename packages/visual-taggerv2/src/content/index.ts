import { MessageType, SyftEvent } from "../types";
// @ts-ignore
import reactDevtools from "./react_devtools?script&module";

/**
 * This module is injected into the page as content script.
 * This has access to the pages DOM and JS context.
 * This is used to listen to events from the page and show them in the Syft Debugger.
 */

// This method gets the properties of the element that triggered the event.
function getFromSyftEvent(event: CustomEvent): SyftEvent {
  const syftevent: SyftEvent = event.detail as SyftEvent;
  syftevent.createdAt =
    syftevent.props.time != null ? new Date(syftevent.props.time) : new Date();
  return syftevent;
}

console.debug(
  "[Syft][Content] Injected content script, listening for syft events"
);
// Todo: Read from Syft object.
window.addEventListener(
  "syft-event",
  (event) => {
    console.debug("[Syft][Content] Received a syft event");
    chrome.runtime.sendMessage({
      type: MessageType.SyftEvent,
      data: getFromSyftEvent(event as CustomEvent),
    });
  },
  true
);

const script = document.createElement("script");
script.src = chrome.runtime.getURL(reactDevtools);
script.type = "module";
document.head.append(script);

export {};
