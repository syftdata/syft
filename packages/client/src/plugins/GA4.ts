import type Syft from '../generated';
import {
  type IReflector,
  SyftEventType,
  type SyftEvent,
  type ISyftPlugin
} from '../types';
import {MetricProvider} from "./index";

declare global {
  interface Window {
    gtag: any;
    dataLayer: any;
  }
}

export class GA4Plugin implements ISyftPlugin {
  id = MetricProvider[MetricProvider.GA4];
  syft: Syft;
  gtag: any;
  isBrowser = typeof window !== 'undefined';

  constructor() {
    if (!this.isBrowser) {
      console.error('GA4 plugin is only supported in browser');
    }
  }

  load(): void {
    if (this.isBrowser) {
      if (window.gtag == null) {
        console.error('Please install/initalize GA4 SDK!');
      }
    }
  }

  init(reflector: IReflector): void {}

  isLoaded(): boolean {
    return true;
  }

  logEvent(event: SyftEvent): boolean {
    if (!this.isBrowser) {
      return true;
    }
    this.gtag = window.gtag;

    const { syft, ...props } = event;
    const fullProps: Record<string, any> = { ...props, via_syft: true };
    if (syft.eventType === SyftEventType.TRACK) {
      this.gtag('event', syft.eventName, fullProps);
    } else if (syft.eventType === SyftEventType.PAGE) {
      this.gtag('event', 'page_view', {
        page_location: fullProps.url,
        page_referrer: fullProps.referrer,
        page_title: fullProps.title ?? fullProps.name ?? syft.eventName,
        ...fullProps
      });
    } else if (syft.eventType === SyftEventType.SCREEN) {
      if (fullProps.name == null) {
        fullProps.name = syft.eventName;
      }
      this.gtag('event', 'screen_view', fullProps);
    } else if (syft.eventType === SyftEventType.IDENTIFY) {
      const { userId, ...subProps } = fullProps;
      if (userId != null) {
        this.gtag('set', 'user_properties', {
          user_id: userId,
          ...subProps
        });
      } else {
        console.warn('User Identify event doesnt have userId');
      }
    } else if (syft.eventType === SyftEventType.GROUP_IDENTIFY) {
      const { groupId, ...subProps } = fullProps;
      if (groupId != null) {
        this.gtag('event', 'join_group', {
          group_id: groupId,
          ...subProps
        });
      } else {
        console.warn('Group Identify event doesnt have groupId');
      }
    }
    return true;
  }

  resetUserProperties(): void {
    if (this.gtag != null) {
      this.gtag.reset();
    }
  }
}

export default GA4Plugin;
