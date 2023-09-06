import type { DestinationDefinition, JSONObject } from '@segment/actions-core';
import { Destination } from '@segment/actions-core';
import amplitude from '@syftdata/action-destinations/dist/destinations/amplitude';
import heap from '@syftdata/action-destinations/dist/destinations/heap';
import june from '@syftdata/action-destinations/dist/destinations/june';
import bigquery from '@syftdata/action-destinations/dist/destinations/bigquery';
import mixpanel from '@syftdata/action-destinations/dist/destinations/mixpanel';
import slack from '@syftdata/action-destinations/dist/destinations/slack';
import ga4 from '@syftdata/action-destinations/dist/destinations/google-analytics-4';
import hubspot from '@syftdata/action-destinations/dist/destinations/hubspot';
import snowflake from '@syftdata/action-destinations/dist/destinations/snowflake';
import { mapValues } from '../../common/utils';

export interface Subscription {
  partnerAction: string;
  subscribe: string;
  mapping?: Record<string, unknown>;
}

export interface MyDestinationDefinition extends DestinationDefinition {
  type: string;
  settings: Record<string, unknown>;
}

/**
 * Use this to add custom presets for destinations that don't have presets.
 */
const CUSTOM_PRESETS = {
  ga4: [
    {
      subscribe: 'type = "track"',
      partnerAction: 'customEvent',
      type: 'automatic'
    },
    {
      subscribe: 'type = "page" or type = "screen"',
      partnerAction: 'pageView',
      type: 'automatic'
    },
    {
      subscribe: 'type = "identify"',
      partnerAction: 'login',
      type: 'automatic'
    }
  ],
  hubspot: [
    {
      subscribe: 'type = "group"',
      partnerAction: 'upsertCompany',
      type: 'automatic'
    },
    {
      subscribe: 'type = "identify"',
      partnerAction: 'upsertContact',
      type: 'automatic'
    }
  ]
};

export const destinations: Record<string, DestinationDefinition> = {};

/**
 * Generates mapping for a given subscription.
 * @param definition
 * @param subscription
 */
export function generateMappings(
  name: string,
  definition: DestinationDefinition<any>,
  subscription: Subscription
): void {
  const action = definition.actions[subscription.partnerAction];
  if (action == null) return;

  const newMapping = mapValues(
    action.fields as unknown as Record<string, JSONObject>,
    'default'
  );

  // for undefined fields, set it to look it up in the event as a fallback.
  Object.keys(newMapping).forEach((k) => {
    if (newMapping[k] === undefined) {
      newMapping[k] = {
        '@path': `$.${k}`
      };
    }
  });
  subscription.mapping = {
    ...newMapping,
    ...subscription.mapping
  };
}

function register(name: string, definition: DestinationDefinition<any>): void {
  destinations[name] = definition;
  if (definition.presets == null || definition.presets.length === 0) {
    definition.presets = CUSTOM_PRESETS[name];
    if (definition.presets == null) {
      definition.presets = [];
      Object.entries(definition.actions).forEach(([name, action]) => {
        if (action.defaultSubscription != null) {
          definition.presets?.push({
            type: 'automatic',
            partnerAction: name,
            subscribe: action.defaultSubscription
          });
        }
      });
    }
    // compute the mapping.
    definition.presets?.forEach((preset) => {
      if (preset.type !== 'automatic') return;
      generateMappings(name, definition, preset);
    });
  }
}

register('amplitude', amplitude);
register('heap', heap);
register('june', june);
register('mixpanel', mixpanel);
register('bigquery', bigquery);
register('snowflake', snowflake);

// NO PRESETS
register('slack', slack);
register('ga4', ga4);
register('hubspot', hubspot);

export function getDestination(key: string): Destination | null {
  const destination = destinations[key];

  if (destination == null) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Destination(destination as DestinationDefinition<any>);
}

const DESTINATION_TO_TYPE = {
  amplitude: 'Analytics',
  heap: 'Analytics',
  june: 'Analytics',
  mixpanel: 'Analytics',
  ga4: 'Analytics',
  bigquery: 'Warehouse',
  hubspot: 'CRM',
  snowflake: 'Warehouse'
};
export function getDestinationSettings(): Record<
  string,
  MyDestinationDefinition
> {
  const myDestinations: Record<string, MyDestinationDefinition> = {};
  Object.entries(destinations).forEach(([name, destination]) => {
    const settings = destination.authentication?.fields ?? {};
    if (destination.authentication?.scheme === 'oauth2') {
      settings.access_token = {
        label: 'Access Token',
        description: 'Access token to access the destination.',
        type: 'string',
        required: true
      };
      settings.refresh_token = {
        label: 'Refresh Token',
        description: 'Refresh Token (If applicable)',
        type: 'string'
      };
      settings.refresh_token_url = {
        label: 'Refresh token URL',
        description: 'Refresh token URL (If applicable)',
        type: 'string'
      };
      settings.clientId = {
        label: 'Client ID',
        description: 'Client ID (If applicable)',
        type: 'string'
      };
      settings.clientSecret = {
        label: 'Client Secret',
        description: 'Client Secret (If applicable)',
        type: 'string'
      };
    }
    myDestinations[name] = {
      ...destination,
      settings,
      type: DESTINATION_TO_TYPE[name] ?? 'Other'
    };
  });
  return myDestinations;
}
