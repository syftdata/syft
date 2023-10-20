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
  type SyftSubscription,
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
  cookies: ReqCookies,
  context: TransactionContext
) => Promise<ServerEvent | ServerEvent[]>;

export type DestinationSettings = Record<string, unknown>;
export interface DestinationConfig {
  type: string;
  settings: DestinationSettings;
  subscriptions?: SyftSubscription[];
  destination?: Destination;
}

export interface SyftRouterOptions {
  name?: string;
  enrichers?: Enricher[];
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
              .filter((s) => s != null) as SyftSubscription[];
          }
        }

        // if subscription is given by customer. Generate mappings for it.
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
    const dPromises = this.options.destinations.map(async (d) => {
      const dest = d.destination;
      if (dest == null) {
        return await Promise.reject(new Error("Destination doesn't exist"));
      }
      await dest
        .testAuthentication(d.settings as unknown as JSONObject)
        .catch(async (e) => {
          console.error(`Destination ${d.type} is not setup correctly!`, e);
          return e;
        });
    });
    await Promise.all(dPromises);
    return true;
  }

  async routeEvents(
    req: UploadRequest,
    { ip, userAgent, cookies }: RequestData
  ): Promise<void> {
    const { events, version, sentAt, sourceId } = req;
    const receivedAt = new Date();
    const context = new MyTransactionContext();
    const serverEvents = events.map((e): ServerEvent => {
      const { context, ...rest } = e;
      return {
        ...rest,
        context: {
          ...context,
          library: {
            name: this.options.name ?? 'syft',
            version,
            sourceId
          },
          userAgent: userAgent ?? '',
          userAgentData: req.userAgentData,
          ip: ip ?? ''
        },
        sentAt,
        receivedAt: receivedAt.toJSON()
      };
    });
    const enrichedEvents = await this._enrichEvents(
      serverEvents,
      cookies,
      context
    );
    this._sendEvents(enrichedEvents, context);
  }

  async _enrichEvents(
    events: ServerEvent[],
    cookies: ReqCookies,
    context: TransactionContext
  ): Promise<ServerEvent[]> {
    const enrichers = this.options.enrichers;
    if (enrichers != null) {
      for (const enricher of enrichers) {
        const a = events.map(async (event) => {
          return await enricher(event, cookies, context);
        });
        events = (await Promise.all(a)).flatMap((e) => e);
      }
    }
    return events;
  }

  _sendEvents(events: ServerEvent[], context: TransactionContext): void {
    this.options.destinations.forEach((d) => {
      this._sendEventsToDestination(d, events, context).catch((e) => {
        console.error(`Failed to send events to ${d.type}`, e);
      });
    });
  }

  async _sendEventsToDestination(
    destination: DestinationConfig,
    events: ServerEvent[],
    context: TransactionContext
  ): Promise<boolean> {
    const dest = destination.destination;
    if (dest == null) {
      return;
    }
    const settings: any = {
      ...destination.settings,
      subscriptions: destination.subscriptions
    };

    for (const event of events) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await dest.onEvent(event as SegmentEvent, settings, {
        transactionContext: context
      });
    }
    return true;
  }
}
