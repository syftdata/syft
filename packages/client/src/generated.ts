import { DEFAULT_STATIC_CONFIG } from './types';
import type { RuntimeConfig } from './types';
import BaseSyft from './base';

export default class Syft extends BaseSyft {
  private static readonly staticConfig = DEFAULT_STATIC_CONFIG;

  constructor(config: RuntimeConfig) {
    super(Syft.staticConfig, config);
    console.warn(`
    Syft is running in reflector mode. 
    Please use syft-cli to generate the client.
    `);
  }
}
