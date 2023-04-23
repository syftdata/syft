import { MessageType, SyftEvent } from "../types";
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
      type: MessageType.SyftEvent,
      data: getFromSyftEvent(event as CustomEvent),
    });
  },
  true
);

export {};
