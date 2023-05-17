/* eslint-disable */
import { type StaticConfig, type } from '@syftdata/client';

const syft: StaticConfig = {
  version: '1.0.0'
};

enum Direction {
  Up,
  Down,
  Left,
  Right
}

enum YesNo {
  Yes = 'Yes',
  No = 'No'
}

/**
 * User Identity is tracked via this event.
 * @type {SyftEventType.IDENTIFY}
 */
export class UserIdentity {
  userId: type.UUID;
  email: type.Email;
  country: type.CountryCode;
  direction: Direction;
  isSpammer: YesNo;
  isVerified: boolean;
}
