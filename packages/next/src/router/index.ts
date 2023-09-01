/**
 * Takes an event and enriches it with data available on the backend.
 * And routes it to the appropriate destination.
 */

import { type UploadRequest, type ServerEvent } from '../common/types';
import type { SegmentEvent, Destination } from '@segment/actions-core';
import {
  type Subscription,
  generateMappings,
  getDestination
} from './destinations';

interface RequestData {
  ip?: string;
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
  userAgent?: string;
  cookies: ReqCookies;
}

export type ReqCookies = Partial<Record<string, string>>;
export type Enricher = (
  event: ServerEvent,
  cookies: ReqCookies
) => Promise<ServerEvent | undefined>;

export type DestinationSettings = Record<string, unknown>;
export interface DestinationConfig {
  name: string;
  settings: DestinationSettings;
  subscriptions?: Subscription[];
  destination?: Destination;
}

export interface SyftRouterOptions {
  name?: string;
  enricher?: Enricher;
  destinations: DestinationConfig[];
}

export class SyftRouter {
  constructor(private readonly options: SyftRouterOptions) {
    this.options.destinations.forEach((d) => {
      const destination = getDestination(d.name);
      if (destination?.definition != null) {
        if (d.subscriptions == null) {
          // apply existing presets
          const presets = destination.definition.presets;
          if (presets != null) {
            d.subscriptions = presets
              .map((p) => {
                if (p.type === 'automatic') {
                  return p;
                }
                return undefined;
              })
              .filter((s) => s != null) as Subscription[];
          }
        }

        d.subscriptions?.forEach((s) => {
          generateMappings(d.name, destination.definition, s);
        });
        d.destination = destination;
      } else {
        console.error(`Destination ${d.name} is not found!`);
      }
    });
  }

  async _handleEvents(
    req: UploadRequest,
    { ip, userAgent, cookies }: RequestData
  ): Promise<void> {
    const { events, version, sentAt } = req;
    const receivedAt = new Date();
    const serverEvents = events.map((e): ServerEvent => {
      const { context, ...rest } = e;
      return {
        ...rest,
        context: {
          ...context,
          library: {
            name: this.options.name ?? 'syft',
            version
          },
          userAgent: userAgent ?? 'N/A',
          userAgentData: req.userAgentData,
          ip: ip ?? 'N/A'
        },
        sentAt,
        receivedAt
      };
    });
    const enrichedEvents = await this._enrichEvents(serverEvents, cookies);
    this._sendEvents(enrichedEvents);
  }

  async _enrichEvents(
    events: ServerEvent[],
    cookies: ReqCookies
  ): Promise<ServerEvent[]> {
    const enricher = this.options.enricher;
    if (enricher != null) {
      const enrichedEventPromises = events.map(
        async (event) => await enricher(event, cookies)
      );
      const enrichedEvents = await Promise.all(enrichedEventPromises);
      const filteredEvents = enrichedEvents.filter((e) => e != null);
      return filteredEvents as ServerEvent[];
    }
    return await Promise.resolve(events);
  }

  _sendEvents(events: ServerEvent[]): void {
    this.options.destinations.forEach((d) => {
      this._sendEventsToDestination(d, events);
    });
  }

  _sendEventsToDestination(
    destination: DestinationConfig,
    events: ServerEvent[]
  ): void {
    const dest = destination.destination;
    if (dest == null) {
      console.error(`Destination ${destination.name} is not found!`);
      return;
    }
    const settings: any = {
      ...destination.settings,
      subscriptions: destination.subscriptions
    };

    const eventPromises = events.map((e) => {
      // console.debug(`
      // sending ${JSON.stringify(e, null, 2)} to ${destination.name}.
      // ${JSON.stringify(settings, null, 2)}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return dest.onEvent(e as SegmentEvent, settings);
    });
    Promise.all(eventPromises).catch((e) => {
      console.error(`error sending to destination ${destination.name}`, e);
    });
  }
}
