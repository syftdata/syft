import type { Event, EventOptions } from './types';
import UniversalConfigStore from './configstore';
import { type BatchUploader } from './uploader';
import { isBrowser, searchParams, uuid } from './utils';
import type {
  CommonPropType,
  EventTypes,
  GroupTraits,
  UserTraits,
  EventType,
  Referrer,
  Campaign,
  AMP
} from './event_types';
// import utm from '@segment/utm-params';
import Cookies from 'js-cookie';
import { getCampaign, getReferrer } from './ad_utm';

const ANONYMOUS_ID_KEY = 'anonymous_id';
const COMMON_PROPERTIES_KEY = 'common_props';
const USER_ID_KEY = 'user_id';
const USER_TRAITS_KEY = 'user_traits';
const GROUP_ID_KEY = 'group_id';
const GROUP_TRAITS_KEY = 'group_traits';

const REFERRER_KEY = 'referrer';

/**
 * Options used when initializing the tracker.
 */
export interface InitOptions {
  uploader: BatchUploader;
  readonly middleware?: (event: Event) => Event | undefined;
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
  referrer: Referrer | undefined;
  campaign: Campaign | undefined;
  amp: AMP | undefined;

  constructor(options: InitOptions) {
    this.options = options;
    this.configStore = new UniversalConfigStore([]);

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

    this.referrer = this.configStore.get(REFERRER_KEY) as Referrer | undefined;
  }

  identify(
    userId: string,
    traits: UserTraits = {},
    options?: EventOptions,
    integrations?: unknown
  ): void {
    // TODO: de-dupe calls

    let newTraits = traits;
    if (this.userId == null || this.userId === userId) {
      newTraits = {
        ...this.userTraits,
        ...traits
      };
    }

    this.userId = userId;
    this.userTraits = newTraits;
    this.configStore.set(USER_ID_KEY, userId);
    this.configStore.set(USER_TRAITS_KEY, newTraits);

    const partialEvent = this._getPartialEvent();
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
    const partialEvent = this._getPartialEvent();
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
    // TODO: de-dupe calls

    this.groupId = groupId;
    this.groupTraits = traits;
    this.configStore.set(GROUP_ID_KEY, groupId);
    this.configStore.set(GROUP_TRAITS_KEY, traits);

    const partialEvent = this._getPartialEvent();
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
    const partialEvent = this._getPartialEvent();
    this._logEvent(
      {
        ...partialEvent,
        event: name as string,
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
    const partialEvent = this._getPartialEvent();
    this._logEvent(
      {
        ...partialEvent,
        type,
        name,
        properties: {
          ...partialEvent.context.page,
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

  _getReferrer(): Referrer | undefined {
    if (isBrowser()) {
      const { search } = location;
      const params = searchParams(search);
      if (params != null) {
        const referrer = getReferrer(params);
        if (referrer != null) {
          this.referrer = referrer;
          this.configStore.set(REFERRER_KEY, referrer);
        }
      }
    }
    return this.referrer;
  }

  _getCampaign(): Campaign | undefined {
    if (isBrowser()) {
      const { search } = location;
      const params = searchParams(search);
      if (params != null) {
        const campaign = getCampaign(params);
        if (campaign != null) {
          this.campaign = campaign;
        }
      }
    }
    return this.campaign;
  }

  _getAMP(): AMP | undefined {
    if (isBrowser()) {
      const ampId = Cookies.get('_ga');
      if (ampId != null) {
        this.amp = {
          id: ampId
        };
      }
    }
    return this.amp;
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
      const referrer = event.context.referrer ?? this._getReferrer();
      const campaign = event.context.campaign ?? this._getCampaign();
      const amp = event.context.amp ?? this._getAMP();

      return {
        ...event,
        context: {
          locale: navigator.language,
          page: {
            path: location.pathname,
            referrer: document.referrer ?? null,
            search: location.search,
            title: document.title,
            url: location.href
          },
          referrer,
          campaign,
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
