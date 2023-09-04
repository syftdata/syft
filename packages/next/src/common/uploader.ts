import { type UploadRequest, type Event, SYFT_VERSION } from './types';

/**
 * Options used when initializing the uploader.
 */
export interface InitOptions {
  url: string;
  batchSize?: number;
  maxWaitingTime?: number;
  retries?: number;
}

export class BatchUploader {
  events: Event[] = [];

  url: string;
  batchSize: number;
  maxWaitingTime: number; // an event doesnt wait more than this time to be uploaded. (unless an upload is in progress)
  retries: number;

  // state
  isUploading = false;
  oldestEventTimestamp = 0; // oldest event timestamp in the queue.
  currentRetryCount = 0;
  currentTimeout?: NodeJS.Timeout; // current timeout for the upload.

  constructor(options: InitOptions) {
    const {
      url,
      batchSize = 10,
      maxWaitingTime = 10000,
      retries = 3
    } = options;
    this.url = url;
    this.batchSize = batchSize;
    this.maxWaitingTime = maxWaitingTime;
    this.retries = retries;
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
      .catch(() => {
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

  async upload(events: Event[]): Promise<void> {
    const data: UploadRequest = {
      events,
      version: SYFT_VERSION,
      userAgentData: (navigator as any).userAgent,
      sentAt: new Date()
    };
    await new Promise((resolve, reject) => {
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
    });
  }

  requestFlush(): void {
    this.__flush();
  }
}
