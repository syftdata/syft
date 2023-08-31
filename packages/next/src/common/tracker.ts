import type { CommonPropType, Event } from './types';
import UniversalConfigStore from './configstore';
import { type BatchUploader } from './uploader';
import { uuid } from './utils';
import type {
  PageViewProps,
  EventTypes,
  GroupTraits,
  UserTraits
} from './event_types';

const ANONYMOUS_ID_KEY = 'anonymous_id';
const COMMON_PROPERTIES_KEY = 'common_properties';
const USER_ID_KEY = 'user_id';
const USER_TRAITS_KEY = 'user_traits';
const GROUP_ID_KEY = 'group_id';

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
  userProperties: UserTraits = {};
  groupId: string | undefined;

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
    this.userProperties =
      (this.configStore.get(USER_TRAITS_KEY) as Record<
        string,
        CommonPropType
      >) ?? {};
    this.groupId = this.configStore.get(GROUP_ID_KEY) as string;
    this.commonProperties =
      (this.configStore.get(COMMON_PROPERTIES_KEY) as Record<
        string,
        CommonPropType
      >) ?? {};
  }

  identify(userId: string, userProperties: UserTraits = {}): void {
    // TODO: de-dupe calls

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
      ...partialEvent,
      event: 'User Identified',
      type: 'identify',
      context: {
        ...partialEvent.context,
        traits: undefined
      },
      traits: newUserProps
    });
  }

  group(groupId: string, groupProperties: GroupTraits = {}): void {
    // TODO: de-dupe calls

    this.groupId = groupId;
    this.configStore.set(GROUP_ID_KEY, groupId);

    const partialEvent = this._getPartialEvent();
    this._logEvent({
      ...partialEvent,
      event: 'Group Identified',
      type: 'group',
      groupId,
      context: {
        ...partialEvent.context,
        traits: undefined
      },
      traits: groupProperties
    });
  }

  setCommon(commonProperties: Record<string, CommonPropType>): void {
    this.commonProperties = commonProperties;
    this.configStore.set(COMMON_PROPERTIES_KEY, commonProperties);
  }

  resetUser(): void {
    this.userProperties = {};
    this.userId = undefined;
    this.groupId = undefined;
    this.configStore.remove(USER_ID_KEY);
    this.configStore.remove(GROUP_ID_KEY);
    this.configStore.remove(USER_TRAITS_KEY);
  }

  track<N extends keyof E>(name: N, properties: E[N]): void {
    const partialEvent = this._getPartialEvent();
    this._logEvent({
      ...partialEvent,
      event: name as string,
      type: 'track',
      properties: {
        ...partialEvent.properties,
        ...properties
      }
    });
  }

  page(props: PageViewProps = {}): void {
    const partialEvent = this._getPartialEvent();
    const { name, ...rest } = props;
    this._logEvent({
      ...partialEvent,
      event: 'Page Viewed',
      type: 'page',
      name,
      properties: {
        ...partialEvent.properties,
        ...rest
      }
    });
  }

  screen(props: PageViewProps = {}): void {
    const partialEvent = this._getPartialEvent();
    const { name, ...rest } = props;
    this._logEvent({
      ...partialEvent,
      event: 'Screen Viewed',
      type: 'screen',
      name,
      properties: {
        ...partialEvent.properties,
        ...rest
      }
    });
  }

  _getPartialEvent(): Omit<Event, 'event' | 'type'> {
    return {
      messageId: uuid(),
      userId: this.userId,
      anonymousId: this.anonymousId,
      context: {
        groupId: this.groupId,
        page: {
          path: location.pathname,
          referrer: document.referrer ?? null,
          search: location.search,
          title: document.title,
          url: location.href
        },
        deviceWidth: window.innerWidth,
        traits: this.userProperties
      },
      properties: {
        ...this.commonProperties
      },
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
