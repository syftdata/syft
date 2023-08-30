import type { CommonPropType, Event, EventProps } from './types';
import UniversalConfigStore from './configstore';
import { type BatchUploader } from './uploader';
import { uuid } from './utils';

/**
 * A map of event names to their properties.
 */
export interface EventTypes {
  [key: string]: EventProps;
  'OutboundLink Clicked': {
    href: string;
  };
}

const ANONYMOUS_ID_KEY = 'anonymous_id';
const COMMON_PROPERTIES_KEY = 'common_properties';
const USER_ID_KEY = 'user_id';
const USER_TRAITS_KEY = 'user_traits';

/**
 * Options used when initializing the tracker.
 */
export interface InitOptions {
  uploader: BatchUploader;
  readonly middleware: (event: Event) => Event | undefined;
}
export default class AutoTracker<E extends EventTypes> {
  options: InitOptions;

  configStore: UniversalConfigStore;

  anonymousId: string;
  commonProperties: Record<string, CommonPropType> = {};
  userId: string | undefined;
  userProperties: Record<string, CommonPropType> = {};

  constructor(options: InitOptions) {
    this.options = options;
    this.configStore = new UniversalConfigStore([]);

    this.anonymousId = this.configStore.get(ANONYMOUS_ID_KEY) as string;
    this.userId = this.configStore.get(USER_ID_KEY) as string;
    this.userProperties =
      (this.configStore.get(USER_TRAITS_KEY) as Record<
        string,
        CommonPropType
      >) ?? {};
    this.commonProperties =
      (this.configStore.get(COMMON_PROPERTIES_KEY) as Record<
        string,
        CommonPropType
      >) ?? {};
    if (this.anonymousId == null) {
      // generate a new anonymous id
      this.anonymousId = uuid();
      this.configStore.set(ANONYMOUS_ID_KEY, this.anonymousId);
    }
  }

  identify(
    userId: string,
    userProperties: Record<string, CommonPropType>
  ): void {
    let newUserProps = userProperties;
    if (this.userId == null || this.userId === userId) {
      newUserProps = {
        ...this.userProperties,
        ...userProperties
      };
    }

    this.userId = userId;
    this.userProperties = newUserProps;
    this.configStore.set(USER_ID_KEY, userId);
    this.configStore.set(USER_TRAITS_KEY, newUserProps);

    const partialEvent = this._getPartialEvent();
    this._logEvent({
      event: 'User Identified',
      type: 'identify',
      ...partialEvent
    });
  }

  setCommon(commonProperties: Record<string, CommonPropType>): void {
    this.commonProperties = commonProperties;
    this.configStore.set(COMMON_PROPERTIES_KEY, commonProperties);
  }

  resetUser(): void {
    this.userProperties = {};
    this.userId = undefined;
    this.configStore.remove(USER_ID_KEY);
    this.configStore.remove(USER_TRAITS_KEY);
  }

  track<N extends keyof E>(name: N, properties: E[N]): void {
    const partialEvent = this._getPartialEvent();
    this._logEvent({
      event: name as string,
      type: 'track',
      ...partialEvent,
      properties: {
        ...partialEvent.properties,
        ...properties
      }
    });
  }

  pageview(): void {
    const partialEvent = this._getPartialEvent();
    this._logEvent({
      event: 'Page Viewed',
      type: 'page',
      ...partialEvent
    });
  }

  _getPartialEvent(): Omit<Event, 'event' | 'type'> {
    return {
      messageId: uuid(),
      userId: this.userId,
      anonymousId: this.anonymousId,
      context: {
        page: {
          path: location.pathname,
          referrer: document.referrer ?? null,
          search: location.search,
          title: document.title,
          url: location.href
        },
        deviceWidth: window.innerWidth
      },
      properties: {
        ...this.commonProperties
      },
      traits: this.userProperties,
      timestamp: new Date()
    };
  }

  _logEvent(event: Event): void {
    const _event = this.options.middleware(event);
    if (_event != null) {
      this.options.uploader.addToQueue(_event);
    }
  }
}
