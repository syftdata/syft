import { TestingPlugin } from '.';
import type { SyftEvent } from '.';
import { extractSchema } from './monitor/parser';
import type { ApiEvent } from './monitor/types';
import Monitor from './monitor';
import {
  type IEventDispatcher,
  type FullConfig,
  type IConfigStore,
  type IMonitor,
  SyftEventTrackStatus,
  SyftEventValidStatus,
  SyftEventInstrumentStatus,
  type IReflector,
  type ISyftPlugin
} from './types';
import { convertCase } from './utils';
import { PluginLoader } from './PluginLoader';

/* eslint-disable @typescript-eslint/no-var-requires */
let EnvClasses = require('./node');
if (typeof window !== 'undefined') {
  EnvClasses = require('./browser');
}

export default class Batcher {
  private readonly config: FullConfig;

  readonly pluginLoader: PluginLoader;
  private plugins: ISyftPlugin[] = [];
  private pendingEvents: SyftEvent[] = []; // hold events in the queue until all plugins are loaded.

  private monitorEvents: ApiEvent[] = [];
  private flushAttemptTimestamp: number; // last flush attempt timestamp

  private readonly monitor: IMonitor;
  private readonly configStore: IConfigStore;
  private readonly dispatcher: IEventDispatcher;

  constructor(config: FullConfig) {
    this.config = config;
    this.monitor = new Monitor(config, new EnvClasses.JsonUploader());
    this.configStore = new EnvClasses.ConfigStore();
    this.dispatcher = new EnvClasses.EventDispatcher();
    this.pluginLoader = new PluginLoader(config.plugins);
  }

  // TODO move plugin loader to caller level.
  loadPlugins(reflector: IReflector): void {
    this.pluginLoader.load(reflector);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.pluginLoader.onLoad().then(() => {
      this.plugins = [...this.plugins, ...this.pluginLoader.plugins];
      this.__replayEvents();
    });
  }

  tester: TestingPlugin | undefined;
  enableTester(): void {
    this.tester = new TestingPlugin();
    this.plugins.push(this.tester);
    this.pluginLoader.markAsLoadingDone(this);
  }

  __replayEvents(): void {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    events.forEach((evt) => this.logEvent(evt));
  }

  resetUser(): void {
    for (const plugin of this.plugins) {
      plugin.resetUserProperties();
    }
  }

  logEvent(orig: SyftEvent): boolean {
    if (!this.pluginLoader.pluginsReady) {
      if (this.config.verbose) {
        console.debug(
          `Plugins are not ready yet. Enqueuing Event ${orig.syft.eventName}`
        );
      }
      this.pendingEvents.push(orig);
      return false;
    }

    if (this.config.verbose) {
      console.debug(
        `Log Event ${orig.syft.eventName} with fields ${JSON.stringify(orig)}`
      );
    }

    // apply naming conventions.
    const event: SyftEvent = {
      syft: {
        ...orig.syft,
        eventName: convertCase(orig.syft.eventName, this.config.eventNameCase)
      }
    };
    for (const key of Object.getOwnPropertyNames(orig)) {
      if (key === 'syft') continue;
      const newKey = convertCase(key, this.config.propertyNameCase);
      event[newKey] = orig[key];
    }

    for (const plugin of this.plugins) {
      if (!plugin.logEvent(event)) {
        return false;
      }
    }
    const { syft, ...eventProperties } = event;
    this._reflectEvent(
      syft.eventName,
      eventProperties,
      SyftEventTrackStatus.TRACKED,
      syft.isValid ? SyftEventValidStatus.VALID : SyftEventValidStatus.NOT_VALID
    );
    return true;
  }

  reflectEvent(name: string, props: Record<string, any>): void {
    this._reflectEvent(
      name,
      props,
      SyftEventTrackStatus.NOT_TRACKED,
      SyftEventValidStatus.UNKNOWN
    );
  }

  _reflectEvent(
    name: string,
    props: Record<string, any>,
    tracked: SyftEventTrackStatus,
    valid: SyftEventValidStatus
  ): void {
    if (!this.config.monitor.disabled) {
      this.dispatcher.dispatch({
        type: 'syft-event',
        detail: {
          name,
          props: props ?? {},
          syft_status: {
            instrument: SyftEventInstrumentStatus.INSTRUMENTED,
            track: SyftEventTrackStatus[tracked],
            valid: SyftEventValidStatus[valid]
          }
        }
      });
    }

    if (
      this.config.monitor.remote == null ||
      this.config.monitor.remote === ''
    ) {
      return;
    }

    const fields = extractSchema(props);
    this.monitorEvents.push({
      name,
      eventType: 'event',
      fields
    });
    if (this.config.verbose) {
      console.debug(`Event ${name} has schema ${JSON.stringify(fields)}`);
    }
    this.uploadIfRequired();
  }

  flush(): void {
    this.upload();
  }

  private uploadIfRequired(): void {
    const batchSize = this.monitorEvents.length;
    const now = Date.now();
    const timeSinceLastFlushAttempt = now - this.flushAttemptTimestamp;

    const sendBySize = batchSize % this.config.monitor.batchSize === 0;
    const sendByTime =
      timeSinceLastFlushAttempt >= this.config.monitor.batchFlushSeconds * 1000;

    if (sendBySize || sendByTime) {
      this.upload();
    }
  }

  private upload(): void {
    const now = Date.now();
    const sendingEvents = this.monitorEvents;
    this.flushAttemptTimestamp = now;
    this.monitorEvents = [];

    const stopUntilTimestamp = this.configStore.get('stopUntilTimestamp');
    if (stopUntilTimestamp != null && now < stopUntilTimestamp) {
      console.info(`Uploads are diasbled till ${stopUntilTimestamp as number}`);
      return;
    }

    this.monitor.monitor(sendingEvents, (resp) => {
      if (resp.stopUntil != null) {
        this.configStore.set(
          'stopUntilTimestamp',
          this.flushAttemptTimestamp + resp.stopUntil
        );
      }

      if (resp.error != null) {
        this.monitorEvents = this.monitorEvents.concat(sendingEvents);
        if (this.config.verbose) {
          console.warn('batch sending failed!', resp.error.message);
        }
      }
    });
  }

  getMonitorQueue(): ApiEvent[] {
    return this.monitorEvents;
  }
}
