import type { DestinationDefinition, JSONObject } from '@segment/actions-core';
import { Destination } from '@segment/actions-core';
import amplitude from '@segment/action-destinations/dist/destinations/amplitude';
import heap from '@segment/action-destinations/dist/destinations/heap';
import june from '@segment/action-destinations/dist/destinations/june';
import mixpanel from '@segment/action-destinations/dist/destinations/mixpanel';
import slack from '@segment/action-destinations/dist/destinations/slack';
import ga4 from '@segment/action-destinations/dist/destinations/google-analytics-4';
import { mapValues } from '../../common/utils';

export interface Subscription {
  partnerAction: string;
  subscribe: string;
  mapping?: Record<string, unknown>;
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
  ]
};

/**
 * Use this to add additional fields to the mapping for destinations that have presets already.
 */
const ADDITIONAL_MAPPING_FIELDS = {
  june: {
    context: {
      type: 'object',
      required: false,
      description: 'Context properties to send with the event',
      label: 'Context properties',
      default: { '@path': '$.context' }
    }
  }
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
  const fields = definition.actions[subscription.partnerAction]?.fields;
  let newMapping = mapValues(
    fields as unknown as Record<string, JSONObject>,
    'default'
  );

  // add additional fields
  const additionalFields = ADDITIONAL_MAPPING_FIELDS[name];
  if (additionalFields != null) {
    const additionalMapping = mapValues(
      additionalFields as unknown as Record<string, JSONObject>,
      'default'
    );
    newMapping = {
      ...additionalMapping,
      ...newMapping
    };
  }

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

// NO PRESETS
register('slack', slack);
register('ga4', ga4);

export function getDestination(key: string): Destination | null {
  const destination = destinations[key];

  if (destination == null) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Destination(destination as DestinationDefinition<any>);
}
