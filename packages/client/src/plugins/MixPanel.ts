/* eslint-disable no-console */
import {
  type IReflector,
  SyftEventType,
  type SyftEvent,
  type ISyftPlugin
} from '../types';

declare global {
  interface Window {
    mixpanel: any;
  }
}

// class Plugin {
//   name = 'syft';
//   type = 'destination';
//   syft: IReflector;

//   constructor(syft: IReflector) {
//     this.syft = syft;
//   }

//   async execute(event: {
//     event_type: string;
//     event_properties: any;
//   }): Promise<void> {
//     if (event.event_properties?.via_syft === true) {
//       return;
//     }
//     this.syft.reflectEvent(event.event_type, event.event_properties);
//   }

//   async setup(): Promise<void> {}
// }

export class MixPanelPlugin implements ISyftPlugin {
  id = 'MixPanel';
  mixpanel: any;
  isBrowser = typeof window !== 'undefined';

  constructor(mixpanel?: any) {
    this.mixpanel = mixpanel;
    if (!this.isBrowser) {
      if (this.mixpanel == null) {
        console.error('Please initalize the plugin with Mixpanel SDK!');
      }
    }
  }

  load(): void {
    if (this.mixpanel == null && this.isBrowser) {
      if (window.mixpanel == null) {
        console.error('Please install/initalize Mixpanel SDK!');
        return;
      }
      this.mixpanel = window.mixpanel;
    }
  }

  init(syft: IReflector): void {
    // this.mixpanel.add(new Plugin(syft));
  }

  isLoaded(): boolean {
    return this.mixpanel != null;
  }

  logEvent(event: SyftEvent): boolean {
    const { syft, ...props } = event;
    const fullProps: Record<string, any> = { ...props, via_syft: true };
    if (syft.eventType === SyftEventType.TRACK) {
      this.mixpanel.track(syft.eventName, fullProps);
    } else if (
      syft.eventType === SyftEventType.PAGE ||
      syft.eventType === SyftEventType.SCREEN
    ) {
      let eventName = `${syft.eventName} Viewed`;
      if (fullProps.name != null) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        eventName = `${fullProps.name} Viewed`;
      }
      this.mixpanel.track(eventName, fullProps);
    } else if (syft.eventType === SyftEventType.IDENTIFY) {
      const { userId, ...subProps } = fullProps;
      if (userId != null) {
        this.mixpanel.identify(userId);
        this.mixpanel.people.set(subProps);
      } else {
        console.warn('User Identify event doesnt have userId');
      }
    } else if (syft.eventType === SyftEventType.GROUP_IDENTIFY) {
      const { groupType, groupId, ...subProps } = fullProps;
      if (groupType != null && groupId != null) {
        this.mixpanel.set_group(groupType, groupId);
        this.mixpanel.get_group(groupType, groupId).set(subProps);
      } else {
        console.warn('Group Identify event doesnt have groupType/groupId');
      }
    }
    return true;
  }

  resetUserProperties(): void {
    if (this.mixpanel != null) {
      this.mixpanel.reset();
    }
  }
}

export default MixPanelPlugin;
