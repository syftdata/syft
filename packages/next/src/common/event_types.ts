export type EventType =
  | 'page'
  | 'track'
  | 'signup'
  | 'identify'
  | 'group'
  | 'alias'
  | 'screen';
export type EventProps = Record<string, unknown> | never;

/**
 * A map of event names to their properties.
 */
export interface EventTypes {
  [key: string]: EventProps;
  page: Record<string, CommonPropType>;
  signup: Record<string, CommonPropType>;
  'OutboundLink Clicked': {
    href: string;
  };
}

export type CommonPropType =
  | string
  | number
  | boolean
  | Date
  | undefined
  | null;

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  region?: string;
}

export interface UserTraits {
  [key: string]: CommonPropType | Address | GroupTraits;
  id?: string; // Unique ID in your database for a user
  address?: Address; // Street address of a user optionally containing: city, country, postalCode, state, or street
  age?: number; // Age of a user
  avatar?: string; // URL to an avatar image for the user
  birthday?: Date | string; // User’s birthday. ISO-8601 date strings / Date object.
  createdAt?: Date | string; // Date the user’s account was first created. ISO-8601 date strings / Date object.
  description?: string; // Description of the user
  email?: string; // Email address of the user
  firstName?: string; // First name of the user
  lastName?: string; // Last name of the user
  fullName?: string; // Full name of the user
  gender?: string; // Gender of a user
  name?: string; // Full name of the user
  phone?: string; // Phone number of the user
  title?: string; // Title of a user, usually related to their position at a specific company. Example: “VP of Engineering”
  username?: string; // User’s username. This should be unique to each user, like the usernames of Twitter or GitHub.
  website?: string; // URL of the user’s website
  company?: string; // Company name.
}

export interface GroupTraits {
  [key: string]: CommonPropType | Address;
  id?: string; // Unique ID in your database for a group
  address?: Address; // Street address of a group. optionally containing: city, country, postalCode, state, or street
  avatar?: string; // URL to an avatar image for the user
  createdAt?: Date | string; // Date the user’s account was first created. ISO-8601 date strings / Date object.
  description?: string; // Description of the user
  email?: string; // Email address of the user

  employees?: number; // Number of employees of a group, typically used for companies.
  employeesRange?: string;

  annualRevenue?: number; // Annual revenue of a group, typically used for companies.
  estimatedAnnualRevenue?: string;

  sector?: string;
  industry?: string; // Industry the group is in, typically used for companies.
  name?: string; // Full name of the group
  legalName?: string; // Legal name of the group / company.
  location?: string; // Location of the group, typically used for companies.
  phone?: string; // Phone number of the group
  website?: string; // URL of the group’s website
  plan?: string; // Name of the plan the group is on, typically used for SaaS companies.
}

/**
 *  {@link https://github.com/segmentio/analytics.js-integrations/blob/2d5c637c022d2661c23449aed237d0d546bf062d/integrations/segmentio/lib/index.js#L415}
 */
export interface Referrer {
  id?: string;
  type?: string;

  name?: string;
  url?: string;
  link?: string;

  btid?: string;
  urid?: string;
}

/**
 * utm params
 * {@link https://github.com/segmentio/analytics.js-integrations/blob/2d5c637c022d2661c23449aed237d0d546bf062d/integrations/segmentio/lib/index.js#L303-L305}
 * {@link https://github.com/segmentio/utm-params/blob/master/lib/index.js#L49}
 */
export interface Campaign {
  [key: string]: string | undefined;
  /**
   * This can also come from the "utm_campaign" param
   *
   * {@link https://github.com/segmentio/utm-params/blob/master/lib/index.js#L40}
   */
  name?: string;
  term?: string;
  source?: string;
  medium?: string;
  content?: string;
}

/**
 * {@link https://github.com/segmentio/analytics.js-integrations/blob/2d5c637c022d2661c23449aed237d0d546bf062d/integrations/segmentio/lib/index.js#L322}
 */
export interface AMP {
  id: string;
}

export interface SyftIDs {
  email?: string;
  domain?: string;
}

export interface SourceTouch {
  campaign?: Campaign;
  referrer?: Referrer;
  clickIds?: Record<string, string>;
  syftIds?: SyftIDs;
}
