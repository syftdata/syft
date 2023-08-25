import {
  type SyftEvent,
  type ISyftPlugin,
  SyftEventType,
  type IConfigStore
} from '../types';
import { PluginPackage } from './index';
import { v4 as uuidv4 } from 'uuid';

const ANNONYMOUS_ID_KEY: string = 'annonymous_id';
const COMMON_PROPERTIES_KEY: string = 'common_properties';
const USER_ID_KEY: string = 'user_id';
const USER_TRAITS_KEY: string = 'user_traits';

let ConfigStoreModule;
if (typeof window !== 'undefined') {
  ConfigStoreModule = require('../browser/configstore');
} else {
  ConfigStoreModule = require('../node/configstore');
}
const UniversalConfigStore = ConfigStoreModule.default;

export class SyftCustomPlugin implements ISyftPlugin {
  id = PluginPackage[PluginPackage.Custom];
  events: SyftEvent[] = [];

  upload: (events: SyftEvent[]) => Promise<any>;
  userIdKey: string;
  annonymousIdKey: string;
  batchSize: number;
  maxWaitingTime: number; // an event doesnt wait more than this time to be uploaded. (unless an upload is in progress)
  retries: number;

  // state
  isUploading: boolean = false;
  oldestEventTimestamp: number = 0; // oldest event timestamp in the queue.
  currentRetryCount: number = 0;
  currentTimeout?: NodeJS.Timeout; // current timeout for the upload.

  configStore: IConfigStore;

  annonymousId: string | undefined;
  commonProperties: Record<string, any> = {};
  userId: string | undefined;
  userProperties: Record<string, any> = {};

  constructor(
    upload: (events: SyftEvent[]) => Promise<any>,
    userIdKey: string = 'userId',
    annonymousIdKey: string = 'annonymousId',
    batchSize: number = 10,
    maxWaitingTime: number = 1000,
    retries: number = 3
  ) {
    this.upload = upload;
    this.userIdKey = userIdKey;
    this.annonymousIdKey = annonymousIdKey;
    this.batchSize = batchSize;
    this.maxWaitingTime = maxWaitingTime;
    this.retries = retries;
    this.configStore = new UniversalConfigStore([]);
  }

  isLoaded(): boolean {
    return true;
  }

  init(): void {
    // load user traits and userId from storage
    this.annonymousId = this.configStore.get(ANNONYMOUS_ID_KEY);
    this.userId = this.configStore.get(USER_ID_KEY);
    this.userProperties = this.configStore.get(USER_TRAITS_KEY) ?? {};
    this.commonProperties = this.configStore.get(COMMON_PROPERTIES_KEY) ?? {};
    if (this.annonymousId == null) {
      // generate a new anonymous id
      this.annonymousId = uuidv4();
      this.configStore.set(ANNONYMOUS_ID_KEY, this.annonymousId);
    }
  }

  __storeUser(userId: string, userProperties: Record<string, any>): void {
    this.userId = userId;
    this.userProperties = userProperties;
    this.configStore.set(USER_ID_KEY, userId);
    this.configStore.set(USER_TRAITS_KEY, userProperties);
  }

  __storeCommon(commonProperties: Record<string, any>): void {
    this.commonProperties = commonProperties;
    this.configStore.set(COMMON_PROPERTIES_KEY, commonProperties);
  }

  logEvent(event: SyftEvent): boolean {
    if (event.syft.eventType === SyftEventType.IDENTIFY) {
      // if identify event, remember user properties
      const { syft, ...identifyProps } = event;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const userId = identifyProps[this.userIdKey];
      if (userId != null) {
        let newUserProps = identifyProps;
        if (this.userId == null || this.userId === userId) {
          newUserProps = { ...this.userProperties, ...identifyProps };
        }
        this.__storeUser(userId, newUserProps);
        return true;
      } else {
        this.__storeCommon(identifyProps);
      }
    }

    if (this.events.length === 0) {
      this.oldestEventTimestamp = Date.now();
    }
    this.events.push({
      [this.userIdKey]: this.userId,
      [this.annonymousIdKey]: this.annonymousId,
      ...this.userProperties,
      ...event
    });
    this.flushIfRequired();
    return true;
  }

  flushIfRequired(): void {
    if (this.isUploading) return;

    if (this.events.length >= this.batchSize) {
      this.__flush();
    }

    const now = Date.now();

    const oldestEventWaitingTime = now - this.oldestEventTimestamp;
    if (oldestEventWaitingTime >= this.maxWaitingTime) {
      this.__flush();
    } else {
      if (this.currentTimeout === undefined) {
        const remainingTime = this.maxWaitingTime - oldestEventWaitingTime;
        this.currentTimeout = setTimeout(() => {
          this.flushIfRequired();
        }, remainingTime);
      }
    }
  }

  __flush = (): void => {
    if (this.events.length === 0) {
      // show the stack trace to find out where this is called from.
      return;
    }

    const events = this.events.splice(0, this.events.length);
    this.isUploading = true;

    clearTimeout(this.currentTimeout);
    this.currentTimeout = undefined;

    this.upload(events)
      .then(() => {
        this.currentRetryCount = 0;
        this.isUploading = false;
      })
      .catch(async () => {
        if (this.currentRetryCount >= this.retries) {
          // drop events
          console.warn('dropping events', events.length);
          this.isUploading = false;
          return;
        }

        // put back events.
        this.events = [...events, ...this.events];
        this.oldestEventTimestamp = 0;
        this.currentRetryCount = this.currentRetryCount + 1;
        // attempting to retry
        this.__flush();
        // this.currentTimeout = setTimeout(() => {
        //   this.__flush();
        // }, this.currentRetryCount * this.retryFactor * this.minRetryDelay);
      });
  };

  requestFlush(): void {
    this.__flush();
  }

  resetUserProperties(): void {
    this.userProperties = {};
    this.userId = undefined;
    this.configStore.remove(USER_ID_KEY);
    this.configStore.remove(USER_TRAITS_KEY);
  }
}
