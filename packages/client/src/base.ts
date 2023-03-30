import Batcher from './batcher';
import { type TestingPlugin } from './plugins';
import {
  DEFAULT_STATIC_CONFIG,
  DEFAULT_RUNTIME_CONFIG,
  DEFAULT_MONITOR_CONFIG,
  SyftEnv,
  type IReflector,
  type FullConfig,
  type RuntimeConfig,
  type StaticConfig
} from './types';
import { onLoadCallback } from './utils';

/* eslint-disable no-console */
export default class BaseSyft implements IReflector {
  config: FullConfig;
  batcher: Batcher;

  constructor(staticConfig: StaticConfig, runtimeConfig: RuntimeConfig) {
    const defaultRuntime = DEFAULT_RUNTIME_CONFIG;
    const defaultMonitor = DEFAULT_MONITOR_CONFIG;
    if (runtimeConfig?.env === SyftEnv.Dev) {
      defaultRuntime.verbose = true;
      defaultMonitor.batchSize = 1;
      defaultMonitor.batchFlushSeconds = 1;
      defaultMonitor.samplingRate = 1.0;
    }

    this.config = {
      ...DEFAULT_STATIC_CONFIG,
      ...staticConfig,
      ...defaultRuntime,
      ...runtimeConfig,
      monitor: {
        ...defaultMonitor,
        ...runtimeConfig?.monitor
      }
    };
    this.batcher = new Batcher(this.config);
    onLoadCallback(() => {
      this.batcher.loadPlugins(this);
    });
  }

  /**
   * Use it only in your unit-tests.
   * @returns
   */
  getTester(): TestingPlugin {
    if (this.batcher.tester == null) {
      this.batcher.enableTester();
    }
    return this.batcher.tester as TestingPlugin;
  }

  reflectEvent(eventName: string, eventProperties: Record<string, any>): void {
    if (this.config.verbose) {
      console.debug(
        `Reflecting ${eventName} with params: ${JSON.stringify(
          eventProperties
        )}`
      );
    }
    this.batcher.reflectEvent(eventName, eventProperties);
  }
}
