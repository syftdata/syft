/* eslint-disable no-console */
import type {
  MonitorResponse,
  FullConfig,
  IMonitor,
  IJsonUploader
} from '../types';
import type { ApiEvent } from './types';

export interface BaseSchema {
  messageId: string;
  createdAt: string;
  sessionId: string;
}

interface BatchCallProps {
  apiKey: string;
  appVersion?: string;
  libVersion: string;
  env: string;
  libPlatform: string;
  samplingRate: number;
  events: ApiEvent[];
}

export default class Monitor implements IMonitor {
  private sending: boolean = false;
  private readonly jsonUploader: IJsonUploader;
  private readonly config: FullConfig;

  constructor(config: FullConfig, jsonUploader: IJsonUploader) {
    this.config = config;
    this.jsonUploader = jsonUploader;
  }

  async _monitor(events: ApiEvent[]): Promise<MonitorResponse> {
    if (typeof this.config.monitor.remote === 'function') {
      const success = await this.config.monitor.remote(events);
      if (success) {
        return {};
      } else {
        return {
          error: new Error('failed to send events to remote callback.')
        };
      }
    } else {
      const data = this.createBatchCall(events);
      const jsonString = JSON.stringify(data);
      const endpoint = this.config.monitor.remote;
      const responseText = await this.jsonUploader.upload(endpoint, jsonString);
      const response = JSON.parse(responseText) as MonitorResponse;
      return response;
    }
  }

  monitor(
    events: ApiEvent[],
    onCompleted: (response: MonitorResponse) => void
  ): void {
    if (events.length === 0) {
      onCompleted({});
      return;
    }
    if (Math.random() > this.config.monitor.samplingRate) {
      if (this.config.verbose) {
        console.debug('dropping events due to sampling rate.');
      }
      onCompleted({});
      return;
    }
    if (this.sending) {
      onCompleted({
        error: new Error('waiting for the previous call to finish.')
      });
      return;
    }
    this.sending = true;
    this._monitor(events)
      .then((r) => {
        onCompleted(r);
        this.sending = false;
      })
      .catch((e) => {
        onCompleted({
          error: e.message
        });
        this.sending = false;
      });
  }

  private createBatchCall(events: ApiEvent[]): BatchCallProps {
    return {
      apiKey: this.config.apiKey,
      appVersion: this.config.appVersion,
      libVersion: this.config.version,
      env: this.config.env,
      events,
      libPlatform: 'web',
      samplingRate: this.config.monitor.samplingRate
    };
  }
}
