import type { ExternalEvent, IEventDispatcher } from '../types';

declare global {
  interface Window {
    dispatchEvent: (event: Event) => boolean;
  }
}

class EventDispatcher implements IEventDispatcher {
  dispatch(event: ExternalEvent): void {
    if (navigator.product === 'ReactNative') {
      return;
    }
    window.dispatchEvent(
      new CustomEvent(event.type, {
        detail: event.detail
      })
    );
  }
}
export default EventDispatcher;
