import {
  type UserTraits,
  type EventProps,
  type EventType,
  type CommonPropType,
  type GroupTraits
} from './event_types';

export interface EventOptions {
  [key: string]: CommonPropType | Partial<ClientContextData>;
  userId?: string;
  anonymousId?: string;
  timestamp?: string | Date;
  context: Partial<ClientContextData>;
}

/**
 * Data passed to Plausible as events.
 */
export interface ClientContextData {
  groupId?: string;
  page?: {
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
  messageId?: string;

  // identity
  anonymousId: string;
  userId?: string;
  groupId?: string;
  previousId?: string; // for alias call.

  type: EventType;
  event?: string; // optional for page / screen / identify / group calls
  name?: string;
  category?: string; // for page / screen

  properties: EventProps;

  traits?: UserTraits | GroupTraits; // applicable for group and identify calls.
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
