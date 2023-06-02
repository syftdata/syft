import { Action } from "../types";

export type EventTag = Action;

export type ComputedEventTag = EventTag & {
  ele: HTMLElement;
};

// function getEventTag(def: ComputedEventTag) {
//   const { ele, source, trigger, eventId, id } = def;
//   if (!source) {
//     return;
//   }
//   const selector = getBestSelector(ele);
//   if (!selector) {
//     return;
//   }
//   return {
//     trigger,
//     eventId,
//     id,
//     selector,
//     component: source.parent?.name ?? "Unknown",
//   };
// }
