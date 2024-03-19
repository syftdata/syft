import { useEffect } from 'react';
import { linkClicks } from '../plugins/linkClicks';

export interface UseLinkClicksOptions {
  enabled?: boolean;
  callback: (url: string, element: HTMLAnchorElement) => void;
}

export function useLinkClicks({
  callback,
  enabled = true
}: UseLinkClicksOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    linkClicks(callback);
  }, [enabled]);
}
