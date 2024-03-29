import { TestingPlugin } from '.';
import type { IEventDispatcher, SyftEvent } from '.';
import {
  SyftEventInstrumentStatus,
  type FullConfig,
  type IReflector,
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
      this.__replayEvents();
    });
  }

  tester: TestingPlugin | undefined;
  enableTester(): void {
    this.pluginLoader.markAsLoadingDone(this);
    this.tester = new TestingPlugin();
    this.pluginLoader.plugins.push(this.tester);
  }

  __replayEvents(): void {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    events.forEach((evt) => this.logEvent(evt));
  }

  resetUser(): void {
    for (const plugin of this.pluginLoader.plugins) {
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

    const props: Record<string, any> = {};
    for (const key of Object.getOwnPropertyNames(orig)) {
      if (key === 'syft') continue;
      const newKey = convertCase(key, this.config.propertyNameCase);
      props[newKey] = orig[key];
    }

    // apply naming conventions.
    const event: SyftEvent = {
      ...props,
      syft: {
        ...orig.syft,
        eventName: convertCase(orig.syft.eventName, this.config.eventNameCase)
      }
    };
    for (const plugin of this.pluginLoader.plugins) {
      if (!plugin.logEvent(event)) {
        return false;
      }
    }
    this.dispatcher.dispatch({
      type: 'syft-event',
      detail: {
        name: event.syft.eventName,
        props,
        syft_status: {
          instrument: SyftEventInstrumentStatus.INSTRUMENTED,
          track: SyftEventTrackStatus.TRACKED,
          valid: event.syft.isValid
            ? SyftEventValidStatus.VALID
            : SyftEventValidStatus.NOT_VALID
        }
      }
    });
    return true;
  }

  reflectEvent(name: string, props: Record<string, any>): void {
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
    if (!this.config.monitor.disabled) {
      // TODO: upload to our backend.
    }
  }

  flush(): void {
    for (const plugin of this.pluginLoader.plugins) {
      if (plugin.requestFlush != null) plugin.requestFlush();
    }
  }
}
