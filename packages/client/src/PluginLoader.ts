/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { type IReflector, type ISyftPlugin } from './types';
import { type Callback } from './utils';

const MAX_WAIT_FOR_LOAD = 5000;
const LOADED_CHECK_INTERVAL = 500;

export class PluginLoader {
  allPlugins: ISyftPlugin[] = [];
  plugins: ISyftPlugin[] = []; // loaded plugins
  failedPlugins: ISyftPlugin[] = []; // failed to load

  callbacks: Callback[] = [];
  pluginsReady = false;

  constructor(plugins: ISyftPlugin[]) {
    this.allPlugins = plugins;
  }

  onLoad(): Promise<void> {
    if (this.pluginsReady) {
      return Promise.resolve();
    } else {
      return new Promise((resolve) => {
        this.callbacks.push(resolve);
      });
    }
  }

  markAsLoadingDone(reflector: IReflector): void {
    this.plugins = [
      ...this.plugins,
      ...this.allPlugins.filter((plugin) => plugin.isLoaded())
    ];
    this.failedPlugins = this.allPlugins.filter((plugin) => !plugin.isLoaded());

    this.plugins.forEach((plugin) => {
      plugin.init(reflector);
    });

    if (this.failedPlugins.length > 0) {
      const failedPluginIds = this.failedPlugins
        .map((plugin) => plugin.id)
        .join(', ');
      console.warn(`Syft: Plugins failed to load on time: ${failedPluginIds}`);
    }

    this.pluginsReady = true;
    const callbacks = this.callbacks.splice(0, this.callbacks.length);
    callbacks.forEach((callback) => {
      callback();
    });
  }

  load(reflector: IReflector): void {
    this.allPlugins.forEach((plugin) => {
      if (plugin.load != null) plugin.load();
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.allPluginsLoaded().then(() => {
      this.markAsLoadingDone(reflector);
    });
  }

  pause(time: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  allPluginsLoaded(time: number = 0): Promise<void> {
    if (this.allPlugins.every((plugin) => plugin.isLoaded())) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      if (time >= MAX_WAIT_FOR_LOAD) {
        resolve();
      } else {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.pause(LOADED_CHECK_INTERVAL).then(() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.allPluginsLoaded(time + LOADED_CHECK_INTERVAL).then(resolve);
        });
      }
    });
  }
}
