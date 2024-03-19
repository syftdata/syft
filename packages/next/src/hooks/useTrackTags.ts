import { useEffect } from 'react';
import {
  type AutocaptureConfig,
  type SyftEventHandler
} from '../plugins/autotrack/types';
import { Autocapture } from '../plugins/autotrack';

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
    const autocapture = new Autocapture(config);
    autocapture.init(callback);

    return () => {
      autocapture.destroy();
    };
  }, [enabled, config]);
}
