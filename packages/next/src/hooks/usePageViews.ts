import { useEffect } from 'react';
import { pageViews } from '../plugins/pageViews';
import { getCurrentPath } from '../common/utils';

export interface UsePageViewsOptions {
  hashMode?: boolean;
  enabled?: boolean;
  callback: (path: string) => void;
}

export function usePageViews({
  callback,
  hashMode = true,
  enabled = true
}: UsePageViewsOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    return pageViews(callback, hashMode);
  }, [hashMode, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    callback(getCurrentPath(hashMode));
  }, []);
}
