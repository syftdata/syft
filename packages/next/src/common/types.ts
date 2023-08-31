import {
  type UserTraits,
  type EventProps,
  type EventType
} from './event_types';

export type CommonPropType = string | number | boolean | undefined | null;

/**
 * Data passed to Plausible as events.
 */
export interface ClientContextData {
  groupId?: string;
  page: {
    path: string;
    referrer: Document['referrer'] | null;
    search?: string;
    title: string;
    url: Location['href'];
  };
  deviceWidth?: Window['innerWidth'];

  // TODO: fill in the rest of the fields

  locale?: string;
  /**
   * {@link https://github.com/segmentio/analytics.js-integrations/blob/2d5c637c022d2661c23449aed237d0d546bf062d/integrations/segmentio/lib/index.js#L292-L301}
   */
  traits?: {
    crossDomainId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };

  /**
   * utm params
   * {@link https://github.com/segmentio/analytics.js-integrations/blob/2d5c637c022d2661c23449aed237d0d546bf062d/integrations/segmentio/lib/index.js#L303-L305}
   * {@link https://github.com/segmentio/utm-params/blob/master/lib/index.js#L49}
   */
  campaign?: {
    /**
     * This can also come from the "utm_campaign" param
     *
     * {@link https://github.com/segmentio/utm-params/blob/master/lib/index.js#L40}
     */
    name: string;
    term: string;
    source: string;
    medium: string;
    content: string;
  };

  /**
   *  {@link https://github.com/segmentio/analytics.js-integrations/blob/2d5c637c022d2661c23449aed237d0d546bf062d/integrations/segmentio/lib/index.js#L415}
   */
  referrer?: {
    btid?: string;
    urid?: string;
  };

  /**
   * {@link https://github.com/segmentio/analytics.js-integrations/blob/2d5c637c022d2661c23449aed237d0d546bf062d/integrations/segmentio/lib/index.js#L322}
   */
  amp?: {
    id: string;
  };
}

export interface ServerContextData extends ClientContextData {
  library: {
    name: string;
    version: string;
  };
  userAgent: string;
  userAgentData?: object;
  ip: string;
}

export interface Event {
  userId?: string;
  groupId?: string;
  messageId?: string;
  anonymousId: string;
  event: string;
  type: EventType;
  properties: EventProps;
  name?: string;
  traits?: UserTraits;
  context: ClientContextData;
  timestamp: string | Date;
}

export interface ServerEvent extends Omit<Event, 'context'> {
  name: string;
  context: ServerContextData;
  receivedAt: string | Date;
  sentAt: string | Date;
}

export interface UploadRequest {
  events: Event[];
  version: string;
  sentAt: string | Date;
}

export const SYFT_VERSION = '0.0.1';
