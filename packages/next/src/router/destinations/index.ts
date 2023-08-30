import type { DestinationDefinition } from '@segment/actions-core';
import { Destination } from '@segment/actions-core';
import amplitude from '@segment/action-destinations/dist/destinations/amplitude';
import heap from '@segment/action-destinations/dist/destinations/heap';
import june from '@segment/action-destinations/dist/destinations/june';
import mixpanel from '@segment/action-destinations/dist/destinations/mixpanel';
import slack from '@segment/action-destinations/dist/destinations/slack';
import ga4 from '@segment/action-destinations/dist/destinations/google-analytics-4';

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

export const destinations: Record<string, DestinationDefinition> = {};
function register(name: string, definition: DestinationDefinition<any>): void {
  destinations[name] = definition;
  if (definition.presets == null) {
    definition.presets = CUSTOM_PRESETS[name];
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
