import {
  type AMP,
  type CommonPropType,
  type EventProps,
  type EventType,
  type GroupTraits,
  type SourceTouch,
  type UserTraits
} from './event_types';

import { version as PACKAGE_VERSION } from '../../package.json';
import { isBrowser } from './utils';

export interface EventOptions {
  [key: string]: CommonPropType | Partial<ClientContextData>;
  userId?: string;
  anonymousId?: string;
  timestamp?: string | Date;
  context?: Partial<ClientContextData>;
}

interface UserAgentData {
  brands?: Array<{
    brand: string;
    version: string;
  }>;
  mobile?: boolean;
  platform?: string;
  architecture?: string;
  bitness?: string;
  model?: string;
  platformVersion?: string;
  /** @deprecated in favour of fullVersionList */
  uaFullVersion?: string;
  fullVersionList?: Array<{
    brand: string;
    version: string;
  }>;
  wow64?: boolean;
}

export interface Session {
  id: string;
  startTime: string | Date;
}

/**
 * Data passed to Plausible as events.
 */
export interface ClientContextData extends SourceTouch {
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
  initialSource?: SourceTouch;
  amp?: AMP;
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

  // session
  session?: Session;
}

export interface ServerContextData extends ClientContextData {
  library: {
    name: string;
    version: string;
    sourceId: string;
  };
  userAgent: string;
  userAgentData: UserAgentData;
  ip: string;
}

export interface ServerEvent extends Omit<Event, 'context'> {
  name?: string;
  context: ServerContextData;
  receivedAt: string | Date;
  sentAt: string | Date;
}

export interface UploadRequest {
  sourceId?: string;
  events: Event[];
  version: string;
  sentAt: string | Date;
  userAgentData: UserAgentData;
  beacon?: boolean;
}

export const SYFT_VERSION = PACKAGE_VERSION;
export const DEFAULT_UPLOAD_PATH =
  process.env.NODE_ENV === 'production'
    ? 'https://app.syftdata.com/api/syft'
    : 'http://localhost:3000/api/syft';
export const BETA_UPLOAD_PATH = 'https://event.syftdata.com/events';

const BETA_ORGS = [
  'dolthub',
  'syftdata.com',
  'dreamteamos.com',
  'revopscoop.com',
  'safegraph.com'
];
export function isBeta(): boolean {
  if (!isBrowser()) return false;
  const e = window.location.hostname;
  if (e == null) return false;
  return BETA_ORGS.some((org) => e.includes(org));
}
