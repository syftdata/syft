import type { SyftEvent, ISyftPlugin, IReflector } from '../types';
import {MetricProvider} from "./index";

export class TestingPlugin implements ISyftPlugin {
  id = MetricProvider[MetricProvider.Testing];
  events: SyftEvent[] = [];

  isLoaded(): boolean {
    return true;
  }

  init(reflector: IReflector): void {}

  logEvent(event: SyftEvent): boolean {
    this.events.push(event);
    return true;
  }

  reset(): void {
    this.events.length = 0;
  }

  allValidEvents(): boolean {
    return this.events.every((event) => event.syft.isValid);
  }

  hasEvent(name: string): boolean {
    return this.events.findIndex((event) => event.syft.eventName === name) > -1;
  }

  resetUserProperties(): void {}
}

export default TestingPlugin;
