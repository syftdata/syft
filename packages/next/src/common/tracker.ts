import { getAMP, getInitialSourceTouch, getSessionSourceTouch } from './ad_utm';
import type UniversalConfigStore from './configstore';
import { canLog, type ConsentConfig } from './consent';
import type {
  AMP,
  CommonPropType,
  EventType,
  EventTypes,
  GroupTraits,
  SourceTouch,
  UserTraits
} from './event_types';
import type { Event, EventOptions, Session } from './types';
import { type BatchUploader } from './uploader';
import { isBrowser, uuid } from './utils';

const ANONYMOUS_ID_KEY = 'anonymous_id';
const COMMON_PROPERTIES_KEY = 'common_props';
const USER_ID_KEY = 'user_id';
const USER_TRAITS_KEY = 'user_traits';
const GROUP_ID_KEY = 'group_id';
const GROUP_TRAITS_KEY = 'group_traits';

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Options used when initializing the tracker.
 */
export interface InitOptions {
  uploader: BatchUploader;
  readonly middleware?: (event: Event) => Event | undefined;
  consent?: ConsentConfig;
}

export default class AutoTracker<E extends EventTypes> {
  options: InitOptions;

  configStore: UniversalConfigStore;

  anonymousId: string;
  commonProperties: Record<string, CommonPropType> = {};
  userId: string | undefined;
  userTraits: UserTraits | undefined;
  groupId: string | undefined;
  groupTraits: GroupTraits | undefined;

  session: Session | undefined;

  amp: AMP | undefined;

  initialSource: SourceTouch | undefined;
  source: SourceTouch;

  constructor(options: InitOptions, store: UniversalConfigStore) {
    this.options = options;
    this.configStore = store;

    this.anonymousId = this.configStore.get(ANONYMOUS_ID_KEY) as string;
    if (this.anonymousId == null) {
      // generate a new anonymous id
      this.anonymousId = uuid();
      this.configStore.set(ANONYMOUS_ID_KEY, this.anonymousId);
    }

    this.userId = this.configStore.get(USER_ID_KEY) as string;
    this.userTraits =
      (this.configStore.get(USER_TRAITS_KEY) as Record<
        string,
        CommonPropType
      >) ?? {};
    this.groupId = this.configStore.get(GROUP_ID_KEY) as string;
    this.groupTraits =
      (this.configStore.get(GROUP_TRAITS_KEY) as Record<
        string,
        CommonPropType
      >) ?? {};
    this.commonProperties =
      (this.configStore.get(COMMON_PROPERTIES_KEY) as Record<
        string,
        CommonPropType
      >) ?? {};

    if (isBrowser()) {
      this.amp = getAMP();
      this.source = getSessionSourceTouch(this.configStore);
      this.initialSource = getInitialSourceTouch(this.configStore);
    }
  }

  identify(
    userId: string,
    traits: UserTraits = {},
    options: EventOptions = {},
    integrations?: unknown
  ): void {
    let newTraits = traits;
    if (this.userId == null || this.userId === userId) {
      newTraits = {
        ...this.userTraits,
        ...traits
      };
    }

    if (this.userId === userId && deepEqual(this.userTraits, newTraits)) {
      return;
    }

    this.userId = userId;
    this.userTraits = newTraits;
    this.configStore.set(USER_ID_KEY, userId);
    this.configStore.set(USER_TRAITS_KEY, newTraits);

    if (options.userId != null) {
      console.warn("don't pass userId in options, pass it as the first arg");
      options.userId = userId;
    }

    const partialEvent = this._getPartialEvent(options, integrations);
    this._logEvent(
      {
        ...partialEvent,
        type: 'identify',
        context: {
          ...partialEvent.context,
          traits: undefined
        },
        traits: newTraits
      },
      options,
      integrations
    );
  }

  alias(
    to: string,
    from?: string,
    options?: EventOptions,
    integrations?: unknown
  ): void {
    const partialEvent = this._getPartialEvent(options, integrations);
    this._logEvent(
      {
        ...partialEvent,
        type: 'alias',
        userId: to,
        previousId: from,
        context: {
          ...partialEvent.context,
          traits: undefined
        }
      },
      options,
      integrations
    );
  }

  group(
    groupId: string,
    traits: GroupTraits = {},
    options?: EventOptions,
    integrations?: unknown
  ): void {
    if (this.groupId === groupId && deepEqual(this.groupTraits, traits)) {
      return;
    }

    this.groupId = groupId;
    this.groupTraits = traits;
    this.configStore.set(GROUP_ID_KEY, groupId);
    this.configStore.set(GROUP_TRAITS_KEY, traits);

    const partialEvent = this._getPartialEvent(options, integrations);
    this._logEvent(
      {
        ...partialEvent,
        type: 'group',
        groupId,
        context: {
          ...partialEvent.context,
          traits: undefined
        },
        traits
      },
      options,
      integrations
    );
  }

  setCommon(commonProperties: Record<string, CommonPropType>): void {
    this.commonProperties = commonProperties;
    this.configStore.set(COMMON_PROPERTIES_KEY, commonProperties);
  }

  reset(): void {
    this.userId = undefined;
    this.userTraits = undefined;
    this.groupId = undefined;
    this.groupTraits = undefined;
    this.commonProperties = {};
    this.configStore.remove(USER_ID_KEY);
    this.configStore.remove(GROUP_ID_KEY);
    this.configStore.remove(USER_TRAITS_KEY);
    this.configStore.remove(GROUP_TRAITS_KEY);
    this.configStore.remove(COMMON_PROPERTIES_KEY);
  }

  track<N extends keyof E>(
    name: N,
    properties: E[N],
    options?: EventOptions,
    integrations?: unknown
  ): void {
    const partialEvent = this._getPartialEvent(options, integrations);
    this._logEvent(
      {
        ...partialEvent,
        event: name as string,
        name: name as string,
        type: 'track',
        properties: {
          ...partialEvent.properties,
          ...properties
        }
      },
      options,
      integrations
    );
  }

  _page(
    type: EventType,
    category?: string,
    name?: string,
    props?: E['page'],
    options?: EventOptions,
    integrations?: unknown
  ): void {
    const partialEvent = this._getPartialEvent(options, integrations);
    this._logEvent(
      {
        ...partialEvent,
        type,
        name,
        properties: {
          ...partialEvent.properties,
          ...props,
          category
        }
      },
      options,
      integrations
    );
  }

  page(
    category?: string,
    page?: string,
    props?: E['page'],
    options?: EventOptions,
    integrations?: unknown
  ): void {
    this._page('page', category, page, props, options, integrations);
  }

  screen(
    category?: string,
    screen?: string,
    props?: E['page'],
    options?: EventOptions,
    integrations?: unknown
  ): void {
    this._page('screen', category, screen, props, options, integrations);
  }

  _getPartialEvent(
    options?: EventOptions,
    integrations?: unknown
  ): Omit<Event, 'event' | 'type'> {
    const event = {
      messageId: uuid(),
      userId: options?.userId ?? this.userId,
      anonymousId: options?.anonymousId ?? this.anonymousId,
      context: {
        ...options?.context,
        groupId: this.groupId,
        traits: this.userTraits
      },
      properties: {
        ...this.commonProperties
      },
      timestamp: options?.timestamp ?? new Date()
    };

    if (isBrowser()) {
      // get referrer and utm params
      const initialSource = event.context.initialSource ?? this.initialSource;
      const source = { ...this.source };
      if (event.context.referrer != null) {
        source.referrer = event.context.referrer;
      }
      if (event.context.campaign != null) {
        source.campaign = event.context.campaign;
      }
      if (event.context.clickIds != null) {
        source.clickIds = event.context.clickIds;
      }
      const amp = event.context.amp ?? this.amp;

      return {
        ...event,
        session: {
          id: this.session.id,
          startTime: this.session.startTime
        },
        context: {
          locale: navigator.language,
          page: {
            path: location.pathname,
            referrer: document.referrer ?? null,
            search: location.search,
            title: document.title,
            url: location.href
          },

          ...source,
          initialSource,

          amp,
          deviceWidth: window.innerWidth,
          ...event.context
        }
      };
    }
    return event;
  }

  _logEvent(
    event: Event,
    options?: EventOptions,
    integrations?: unknown
  ): void {
    let _event: Event | undefined = event;
    if (this.options.middleware != null)
      _event = this.options.middleware(_event);

    if (_event != null) {
      if (canLog(this.options.consent)) {
        // fire a syft event on the window. it will show up in the console.
        window.dispatchEvent(
          new CustomEvent('syft-event', {
            detail: event
          })
        );
        this.options.uploader.addToQueue(_event);
      }
    }
  }
}
