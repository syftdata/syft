import { type SyftEvent, type ISyftPlugin } from '../types';

export class SyftCustomPlugin implements ISyftPlugin {
  id = 'SyftCustomPlugin';
  events: SyftEvent[] = [];

  upload: (events: SyftEvent[]) => Promise<any>;
  uploadInterval: number;
  batchSize: number;

  flushAttemptTimestamp: number; // last flush attempt timestamp
  isUploading: boolean = false;

  constructor(
    upload: (events: SyftEvent[]) => Promise<any>,
    batchSize: number = 10,
    uploadInterval: number = 1000
  ) {
    this.upload = upload;
    this.batchSize = batchSize;
    this.uploadInterval = uploadInterval;
  }

  isLoaded(): boolean {
    return true;
  }

  init(): void {}

  logEvent(event: SyftEvent): boolean {
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
    const timeSinceLastFlushAttempt = now - this.flushAttemptTimestamp;
    if (timeSinceLastFlushAttempt >= this.uploadInterval) {
      this.__flush();
    }
  }

  __flush(): void {
    const events = this.events.splice(0, this.events.length);
    this.isUploading = true;
    this.flushAttemptTimestamp = Date.now();
    this.upload(events).finally(() => {
      this.isUploading = false;
    });
  }

  requestFlush(): void {
    this.__flush();
  }

  resetUserProperties(): void {}
}
