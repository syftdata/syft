/* eslint-disable */
import { type StaticConfig, type, type SyftEventType } from '@syftdata/client';

const syft: StaticConfig = {
  version: '1.0.0'
};

/**
 * User Identity is tracked via this event.
 * @type {SyftEventType.IDENTIFY}
 */
export class UserIdentity {
  userId: type.UUID;
  email: type.Email;
  country: type.CountryCode;
}

/**
 * @type {SyftEventType.PAGE}
 */
class BasePageEvent {
  page: string;
  time: Date;
}

/**
 * Gets logged when user opens the index page.
 */
export class IndexPageEvent extends BasePageEvent {
  page = 'index';
  loggedIn = false;
}

interface ChannelType {
  channel_name: string;
  channel_type: string;
}

class SourceType {
  source_name: string;
  source_id?: number;
}

type EventType = {
  name: string;
  id?: number;
  test_field?: string;
};

/**
 * SourceAction gets logged when a source is created/updated/deleted.
 * @type {SyftEventType.TRACK}
 */
class SourceAction {
  /**
   * is the source original or a proxy.
   */
  isOriginal: boolean;

  /**
   * id of the source.
   */
  id: type.UUID;

  /**
   * Source type.
   */
  type: SourceType;
  eventType?: EventType;
}

export class SourceUpdated extends SourceAction {}

class NotifChannelAction {
  /**
   * Name of the channel, this is a unique global name.
   * @min 5
   */
  name: string;
  type: ChannelType;
  webhook: type.Url;

  /**
   * Number of notifications fired so far.
   * @min 0
   */
  count: number;
}

export class NotifChannelUpdated extends NotifChannelAction {}
