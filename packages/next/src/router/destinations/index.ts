import type { DestinationDefinition } from '@segment/actions-core';
import { Destination } from '@segment/actions-core';
import amplitude from './amplitude';
import slack from './slack';

export const destinations: Record<string, DestinationDefinition> = {};
function register(name: string, definition: DestinationDefinition<any>): void {
  destinations[name] = definition;
}

register('amplitude', amplitude);
register('slack', slack);

export function getDestination(key: string): Destination | null {
  const destination = destinations[key];

  if (destination == null) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Destination(destination as DestinationDefinition<any>);
}
