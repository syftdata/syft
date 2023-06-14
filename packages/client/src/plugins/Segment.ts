/* eslint-disable no-console */
import type Syft from '../generated';
import {
  type IReflector,
  SyftEventType,
  type SyftEvent,
  type ISyftPlugin
} from '../types';
import {PluginPackage} from "./index";

declare global {
  interface Window {
    analytics: any;
  }
}

/**
 * Plugin added to Segment's analytics.js library.
 */
class Plugin {
  name = 'syft';
  type = 'destination';
  version = '1.0.0';
  syft: IReflector;

  constructor(syft: IReflector) {
    this.syft = syft;
  }

  isLoaded(): boolean {
    return true;
  }

  load(): void {}

  track(ctx: any): any {
    return this.handleSegmentEvent(ctx);
  }

  page(ctx: any): any {
    return this.handleSegmentEvent(ctx);
  }

  screen(ctx: any): any {
    return this.handleSegmentEvent(ctx);
  }

  handleSegmentEvent(ctx: any): any {
    const eventType: unknown = ctx?.event?.type;
    const event = ctx?.event;
    const props = event.properties ?? event.traits;
    if (props?.via_syft === true) {
      return ctx;
    }

    if (eventType === 'track') {
      this.syft.reflectEvent(event.event, event.properties ?? event.traits);
    } else if (eventType === 'page' || eventType === 'screen') {
      this.syft.reflectEvent(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        event.name ?? `${event.type}_${event.properties.path}`,
        event.properties ?? event.traits
      );
    }
    return ctx;
  }
}

/**
 * Plugin added to Syft.
 */
export class SegmentPlugin implements ISyftPlugin {
  id = PluginPackage[PluginPackage.Segment];
  syft: Syft;
  analytics: any;
  isBrowser = typeof window !== 'undefined';

  constructor(analytics?: any) {
    this.analytics = analytics;
    if (!this.isBrowser) {
      if (this.analytics == null) {
        console.error('Please initalize the plugin with Analytics SDK!');
      }
    }
  }

  load(): void {
    if (this.analytics == null && this.isBrowser) {
      if (window.analytics == null) {
        console.error('Please install/initalize Analytics SDK!');
        return;
      }
      this.analytics = window.analytics;
    }
  }

  init(reflector: IReflector): void {
    if (this.analytics.register != null) {
      this.analytics.register(new Plugin(reflector));
    } else {
      console.warn('Failed to register reflector with Segment SDK');
    }
  }

  isLoaded(): boolean {
    return this.analytics != null;
  }

  logEvent(event: SyftEvent): boolean {
    const { syft, ...props } = event;
    const fullProps: Record<string, any> = { ...props, via_syft: true };

    if (syft.eventType === SyftEventType.TRACK) {
      this.analytics.track(syft.eventName, fullProps);
    } else if (syft.eventType === SyftEventType.PAGE) {
      if (fullProps.name == null) {
        fullProps.name = syft.eventName;
      }
      this.analytics.page(fullProps);
    } else if (syft.eventType === SyftEventType.SCREEN) {
      if (fullProps.name == null) {
        fullProps.name = syft.eventName;
      }
      this.analytics.screen(fullProps);
    } else if (syft.eventType === SyftEventType.IDENTIFY) {
      const { userId, ...subProps } = fullProps;
      if (userId != null) {
        this.analytics.identify(userId, subProps);
      } else {
        console.warn('User Identify event doesnt have userId');
      }
    } else if (syft.eventType === SyftEventType.GROUP_IDENTIFY) {
      const { groupId, ...subProps } = fullProps;
      if (groupId != null) {
        this.analytics.group(groupId, subProps);
      } else {
        console.warn('Group Identify event doesnt have groupId');
      }
    }
    return true;
  }

  resetUserProperties(): void {
    if (this.analytics != null) {
      this.analytics.reset();
    }
  }
}

export default SegmentPlugin;
