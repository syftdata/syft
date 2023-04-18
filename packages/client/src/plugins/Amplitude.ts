/* eslint-disable no-console */
import {
  type IReflector,
  SyftEventType,
  type SyftEvent,
  type ISyftPlugin
} from '../types';

declare global {
  interface Window {
    amplitude: any;
  }
}

class Plugin {
  name = 'syft';
  type = 'destination';
  syft: IReflector;

  constructor(syft: IReflector) {
    this.syft = syft;
  }

  toJSON(): Record<string, any> {
    return {
      name: this.name,
      type: this.type
    };
  }

  async execute(event: {
    event_type: string;
    event_properties: any;
  }): Promise<any> {
    if (event.event_properties?.via_syft !== true) {
      this.syft.reflectEvent(event.event_type, event.event_properties);
    }
    return {
      code: 200,
      event,
      message: 'OK'
    };
  }

  async setup(): Promise<void> {}
}

export class AmplitudePlugin implements ISyftPlugin {
  id = 'Amplitude';
  amplitude: any;
  isBrowser = typeof window !== 'undefined';

  constructor(amplitude?: any) {
    this.amplitude = amplitude;
    if (!this.isBrowser) {
      if (this.amplitude == null) {
        console.error('Please initalize the plugin with Analytics SDK!');
      }
    }
  }

  load(): void {
    if (this.amplitude == null && this.isBrowser) {
      if (window.amplitude == null) {
        console.error('Please install/initalize Amplitude SDK!');
        return;
      }
      this.amplitude = window.amplitude;
    }
  }

  init(reflector: IReflector): void {
    if (this.amplitude.add != null) {
      this.amplitude.add(new Plugin(reflector));
    } else {
      console.warn('Failed to register reflector with Amplitude SDK');
    }
  }

  isLoaded(): boolean {
    return this.amplitude != null;
  }

  logEvent(event: SyftEvent): boolean {
    const { syft, ...props } = event;
    const fullProps: Record<string, any> = { ...props, via_syft: true };
    const eventProps: Record<string, any> = {};
    // for node.js environment, amplitude requires a userId or deviceId to be set.
    if (!this.isBrowser) {
      eventProps.user_id = fullProps.userId ?? fullProps.user_id;
      eventProps.device_id = fullProps.deviceId ?? fullProps.device_id;

      if (eventProps.user_id == null && eventProps.device_id == null) {
        console.warn(
          `Amplitude requires a userId or deviceId to be set in node.js environment. 
          Please add userId or deviceId to the event model.`
        );
      }
    }

    if (syft.eventType === SyftEventType.TRACK) {
      this.amplitude.track(syft.eventName, fullProps, eventProps);
    } else if (
      syft.eventType === SyftEventType.PAGE ||
      syft.eventType === SyftEventType.SCREEN
    ) {
      let eventName = `${syft.eventName} Viewed`;
      if (fullProps.name != null) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        eventName = `${fullProps.name} Viewed`;
      }
      this.amplitude.track(eventName, fullProps, eventProps);
    } else if (syft.eventType === SyftEventType.IDENTIFY) {
      const { userId, ...subProps } = fullProps;
      if (userId != null) {
        this.amplitude.setUserId(userId);
        const identify = new this.amplitude.Identify().set(subProps);
        this.amplitude.identify(identify, eventProps);
      } else {
        console.warn('User Identify event doesnt have userId');
      }
    } else if (syft.eventType === SyftEventType.GROUP_IDENTIFY) {
      const { groupType, groupId } = fullProps;
      if (groupType != null && groupId != null) {
        this.amplitude.setGroup(groupType, groupId, eventProps);
        // const identify = new this.amplitude.Identify().set(subProps);
        // this.amplitude.identify(identify);
      } else {
        console.warn('Group Identify event doesnt have groupType/groupId');
      }
    }
    return true;
  }

  resetUserProperties(): void {
    if (this.amplitude != null) {
      this.amplitude.reset();
    }
  }
}

export default AmplitudePlugin;
