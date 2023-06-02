import { MessageType, SyftEvent } from "../types";
// @ts-ignore
import reactDevtools from "./react_devtools?script&module";

// This method gets the properties of the element that triggered the event.
function getFromSyftEvent(event: CustomEvent): SyftEvent {
  const syftevent: SyftEvent = event.detail as SyftEvent;
  syftevent.createdAt =
    syftevent.props.time != null ? new Date(syftevent.props.time) : new Date();
  return syftevent;
}

console.debug("[Syft][Content] Injected content script, listening for events");
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
