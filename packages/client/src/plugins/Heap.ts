import {
  type IReflector,
  SyftEventType,
  type SyftEvent,
  type ISyftPlugin
} from '../types';

declare global {
  interface Window {
    heap: any;
  }
}

export class HeapPlugin implements ISyftPlugin {
  id = 'Heap';
  pkg = '@heap/react-heap';
  isBrowser = typeof window !== 'undefined';
  heap: any;

  constructor(heap?: any) {
    this.heap = heap;
    if (!this.isBrowser) {
      if (this.heap == null) {
        console.error('Please initalize the plugin with Heap SDK!');
      }
    }
  }

  load(): void {
    if (this.heap == null && this.isBrowser) {
      if (window.heap == null) {
        console.error('Please install/initalize Heap SDK!');
        return;
      }
      this.heap = window.heap;
    }
  }

  init(reflector: IReflector): void {}

  isLoaded(): boolean {
    return this.heap != null;
  }

  logEvent(event: SyftEvent): boolean {
    const { syft, ...props } = event;
    const fullProps: Record<string, any> = { ...props, via_syft: true };
    if (
      syft.eventType === SyftEventType.TRACK ||
      syft.eventType === SyftEventType.PAGE ||
      syft.eventType === SyftEventType.SCREEN
    ) {
      this.heap.track(syft.eventName, props);
    } else if (syft.eventType === SyftEventType.IDENTIFY) {
      const { userId, ...subProps } = fullProps;
      if (userId != null) {
        this.heap.identify(userId); // get user-id
        this.heap.addUserProperties(subProps);
      } else {
        console.warn('User Identify event doesnt have userId');
      }
    }
    return true;
  }

  resetUserProperties(): void {
    if (this.heap != null) {
      this.heap.resetIdentity();
    }
  }
}

export default HeapPlugin;
