import { useEffect } from 'react';
import {
  type AutocaptureConfig,
  type SyftEventHandler
} from '../autocapture/types';
import { Autocapture } from '../autocapture';

export interface UseTrackTagsOptions {
  enabled?: boolean;
  callback: SyftEventHandler;
  config: AutocaptureConfig;
}

export function useTrackTags({
  callback,
  enabled = true,
  config
}: UseTrackTagsOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    console.log('>>> got a new config to generate events', config);
    const autocapture = new Autocapture(config);
    autocapture.init(callback);

    return () => {
      // TODO: remove event listeners.
      autocapture.destroy();
    };
  }, [enabled, config]);
}
