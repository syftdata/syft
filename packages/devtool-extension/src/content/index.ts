import { MessageType, SyftEvent } from "../types";

// This method gets the properties of the element that triggered the event.
function getFromSyftEvent(event: CustomEvent): SyftEvent {
  const syftevent: SyftEvent = event.detail as SyftEvent;
  syftevent.createdAt =
    syftevent.props.time != null ? new Date(syftevent.props.time) : new Date();
  return syftevent;
}

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

export {};
