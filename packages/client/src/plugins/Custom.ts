import { type SyftEvent, type ISyftPlugin, SyftEventType } from '../types';
import { PluginPackage } from './index';

export class SyftCustomPlugin implements ISyftPlugin {
  id = PluginPackage[PluginPackage.Custom];
  events: SyftEvent[] = [];

  upload: (events: SyftEvent[]) => Promise<any>;
  uploadInterval: number;
  batchSize: number;

  // state
  isUploading: boolean = false;
  oldestEventTimestamp: number = 0; // oldest event timestamp in the queue.
  currentTimeout?: NodeJS.Timeout; // current timeout for the upload.

  userProperties: any = {};

  constructor(
    upload: (events: SyftEvent[]) => Promise<any>,
    batchSize: number = 10,
    uploadInterval: number = 1000
  ) {
    this.upload = upload;
    this.batchSize = batchSize;
    this.uploadInterval = uploadInterval;
  }

  load?: (() => void) | undefined;

  isLoaded(): boolean {
    return true;
  }

  init(): void {}

  logEvent(event: SyftEvent): boolean {
    if (event.syft.eventType === SyftEventType.IDENTIFY) {
      // if identify event, remember user properties
      const { syft, ...identifyProps } = event;
      this.userProperties = { ...this.userProperties, ...identifyProps };
      return true;
    }
    if (this.events.length === 0) {
      this.oldestEventTimestamp = Date.now();
    }
    this.events.push({
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
    if (oldestEventWaitingTime >= this.uploadInterval) {
      this.__flush();
    } else {
      if (this.currentTimeout === undefined) {
        const remainingTime = this.uploadInterval - oldestEventWaitingTime;
        this.currentTimeout = setTimeout(() => {
          this.flushIfRequired();
        }, remainingTime);
      }
    }
  }

  __flush(): void {
    if (this.events.length === 0) return;
    const events = this.events.splice(0, this.events.length);
    this.isUploading = true;
    this.upload(events).finally(() => {
      this.isUploading = false;
    });
    clearTimeout(this.currentTimeout);
    this.currentTimeout = undefined;
  }

  requestFlush(): void {
    this.__flush();
  }

  resetUserProperties(): void {
    this.userProperties = {};
  }
}
