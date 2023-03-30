import type { ExternalEvent, IEventDispatcher } from '../types';

class EventDispatcher implements IEventDispatcher {
  dispatch(event: ExternalEvent): void {}
}
export default EventDispatcher;
