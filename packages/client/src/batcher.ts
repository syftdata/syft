import { TestingPlugin } from '.';
import type { IEventDispatcher, SyftEvent } from '.';
import {
  SyftEventInstrumentStatus,
  type FullConfig,
  type IReflector,
  type ISyftPlugin,
  SyftEventTrackStatus,
  SyftEventValidStatus
} from './types';
import { convertCase } from './utils';
import { PluginLoader } from './PluginLoader';

let DispatcherModule;
if (typeof window !== 'undefined') {
  DispatcherModule = require('./browser/dispatcher');
} else {
  DispatcherModule = require('./node/dispatcher');
}
const DispatcherClass = DispatcherModule.default;

export default class Batcher {
  private readonly config: FullConfig;

  readonly pluginLoader: PluginLoader;
  private plugins: ISyftPlugin[] = [];
  private pendingEvents: SyftEvent[] = []; // hold events in the queue until all plugins are loaded.
  private readonly dispatcher: IEventDispatcher;

  constructor(config: FullConfig) {
    this.config = config;
    this.pluginLoader = new PluginLoader(config.plugins);
    this.dispatcher = new DispatcherClass();
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
    return true;
  }

  reflectEvent(name: string, props: Record<string, any>): void {
    if (!this.config.monitor.disabled) {
      this.dispatcher.dispatch({
        type: 'syft-event',
        detail: {
          name,
          props: props ?? {},
          syft_status: {
            instrument: SyftEventInstrumentStatus.INSTRUMENTED,
            track: SyftEventTrackStatus.NOT_TRACKED,
            valid: SyftEventValidStatus.UNKNOWN
          }
        }
      });
    }
  }

  flush(): void {
    for (const plugin of this.plugins) {
      if (plugin.requestFlush != null) plugin.requestFlush();
    }
  }
}
