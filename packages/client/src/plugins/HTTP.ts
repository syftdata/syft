import { type SyftEvent } from '../types';
import { PluginPackage, SyftCustomPlugin } from './index';

export class SyftHTTPPlugin extends SyftCustomPlugin {
  id = PluginPackage[PluginPackage.HTTP];

  constructor(
    endpoint: string,
    headers: Record<string, string> = {},
    userIdKey: string = 'userId',
    installationIdKey: string = 'installationId',
    batchSize: number = 10,
    maxWaitingTime: number = 1000,
    retries: number = 3
  ) {
    super(
      async (events: SyftEvent[]) => {
        // transform events to JSON
        const external = events.map((evt) => {
          const { syft, ...rest } = evt;
          return {
            eventName: syft.eventName,
            ...rest
          };
        });
        return await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(external)
        });
      },
      userIdKey,
      installationIdKey,
      batchSize,
      maxWaitingTime,
      retries
    );
  }
}
