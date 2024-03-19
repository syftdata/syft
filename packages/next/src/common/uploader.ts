import { SYFT_VERSION, type Event, type UploadRequest } from './types';

/**
 * Options used when initializing the uploader.
 */
export interface InitOptions {
  url: string;
  sourceId?: string;
  batchSize?: number;
  maxWaitingTime?: number;
  retries?: number;
  preferBeacon?: boolean;
  replicateTo?: string[];
}

export class BatchUploader {
  events: Event[] = [];

  sourceId?: string;
  url: string;
  replicateTo: string[];
  batchSize: number;
  maxWaitingTime: number; // an event doesnt wait more than this time to be uploaded. (unless an upload is in progress)
  retries: number;
  preferBeacon: boolean;

  // state
  isUploading = false;
  oldestEventTimestamp = 0; // oldest event timestamp in the queue.
  currentRetryCount = 0;
  currentTimeout?: NodeJS.Timeout; // current timeout for the upload.

  constructor(options: InitOptions) {
    const {
      sourceId,
      url,
      batchSize = 10,
      maxWaitingTime = 10000,
      retries = 3,
      preferBeacon = false,
      replicateTo = []
    } = options;
    this.sourceId = sourceId;
    this.url = url;
    this.batchSize = batchSize;
    this.maxWaitingTime = maxWaitingTime;
    this.retries = retries;
    this.preferBeacon = preferBeacon;
    this.replicateTo = replicateTo;
  }

  addToQueue(event: Event): boolean {
    if (this.events.length === 0) {
      this.oldestEventTimestamp = Date.now();
    }
    this.events.push(event);
    this.flushIfRequired();
    return true;
  }

  flushIfRequired(): void {
    if (this.isUploading) return;

    if (this.events.length >= this.batchSize) {
      this.__flush(this.preferBeacon);
    }

    const now = Date.now();

    const oldestEventWaitingTime = now - this.oldestEventTimestamp;
    if (oldestEventWaitingTime >= this.maxWaitingTime) {
      this.__flush(this.preferBeacon);
    } else {
      if (this.currentTimeout === undefined) {
        const remainingTime = this.maxWaitingTime - oldestEventWaitingTime;
        this.currentTimeout = setTimeout(() => {
          this.flushIfRequired();
        }, remainingTime);
      }
    }
  }

  __flush = (useBeacon: boolean): void => {
    if (this.events.length === 0) {
      // show the stack trace to find out where this is called from.
      return;
    }

    const events = this.events.splice(0, this.events.length);
    this.isUploading = true;

    clearTimeout(this.currentTimeout);
    this.currentTimeout = undefined;

    this.upload(events, useBeacon)
      .then(() => {
        this.currentRetryCount = 0;
        this.isUploading = false;
      })
      .catch((e) => {
        if (this.currentRetryCount >= this.retries) {
          // drop events
          // console.warn('dropping events', events.length, e);
          this.isUploading = false;
          return;
        }
        // put back events.
        this.events = [...events, ...this.events];
        this.oldestEventTimestamp = 0;
        this.currentRetryCount = this.currentRetryCount + 1;
        // attempting to retry
        this.__flush(useBeacon);
        // this.currentTimeout = setTimeout(() => {
        //   this.__flush();
        // }, this.currentRetryCount * this.retryFactor * this.minRetryDelay);
      });
  };

  async upload(events: Event[], useBeacon: boolean): Promise<boolean> {
    const data: UploadRequest = {
      events,
      sourceId: this.sourceId,
      version: SYFT_VERSION,
      userAgentData: (navigator as any).userAgent,
      sentAt: new Date()
    };
    return await new Promise<boolean>((resolve, reject) => {
      const beacon = useBeacon
        ? navigator?.sendBeacon?.bind(navigator)
        : undefined;
      if (beacon != null) {
        const blob = JSON.stringify(data);
        const resp = beacon(this.url, blob);
        this.replicateTo.forEach((url) => {
          beacon(url, blob);
        });
        resolve(resp);
      } else {
        const req = new XMLHttpRequest();
        req.open('POST', this.url, true);
        req.setRequestHeader('Content-Type', 'text/plain');
        req.send(JSON.stringify(data));
        req.onload = () => {
          if (req.status >= 200 && req.status < 300) {
            resolve(true);
          } else {
            reject(new Error("Couldn't upload events"));
          }
        };
      }
    });
  }

  urgentFlush(): void {
    this.__flush(true);
  }
}
