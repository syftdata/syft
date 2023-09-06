/**
 * Takes an event and enriches it with data available on the backend.
 * And routes it to the appropriate destination.
 */

import { type UploadRequest, type ServerEvent } from '../common/types';
import type {
  SegmentEvent,
  Destination,
  JSONObject
} from '@segment/actions-core';
import {
  type Subscription,
  generateMappings,
  getDestination
} from './destinations';
import { type TransactionContext } from '@segment/actions-core/destination-kitindex';

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
  type: string;
  settings: DestinationSettings;
  subscriptions?: Subscription[];
  destination?: Destination;
}

export interface SyftRouterOptions {
  name?: string;
  enricher?: Enricher;
  destinations: DestinationConfig[];
}

class MyTransactionContext implements TransactionContext {
  constructor(readonly transaction: Record<string, string> = {}) {}

  setTransaction(key: string, value: string): void {
    this.transaction[key] = value;
  }
}

export class SyftRouter {
  constructor(private readonly options: SyftRouterOptions) {
    this.options.destinations.forEach((d) => {
      const destination = getDestination(d.type);
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
          generateMappings(d.type, destination.definition, s);
        });
        d.destination = destination;
      } else {
        console.error(`Destination ${d.type} is not found!`);
      }
    });
  }

  /**
   * Run only in dev mode to validate that all destinations are setup correctly.
   * @returns
   */
  async validateSetup(): Promise<boolean> {
    const destinationPromises = this.options.destinations.map((d) => {
      const dest = d.destination;
      if (dest == null) {
        return Promise.reject(new Error("Destination doesn't exist"));
      }
      return dest.testAuthentication(d.settings as unknown as JSONObject);
    });
    await Promise.all(destinationPromises);
    return true;
  }

  async routeEvents(
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
        receivedAt: receivedAt.toJSON()
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
    return events;
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
      return;
    }
    const context = new MyTransactionContext();
    const settings: any = {
      ...destination.settings,
      subscriptions: destination.subscriptions
    };

    const eventPromises = events.map((e) => {
      // console.debug(`
      // sending ${JSON.stringify(e, null, 2)} to ${destination.name}.
      // ${JSON.stringify(settings, null, 2)}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return dest.onEvent(e as SegmentEvent, settings, {
        transactionContext: context
      });
    });
    Promise.all(eventPromises).catch((e) => {
      console.error(`error sending to destination ${destination.type}`, e);
    });
  }
}
