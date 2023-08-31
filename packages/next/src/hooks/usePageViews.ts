import { useEffect } from 'react';
import { Router } from 'next/router';

export interface UsePageViewsOptions {
  hashMode?: boolean;
  enabled?: boolean;
  callback: (url: URL) => void;
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
    const handleRouteChange = (url: URL): void => {
      callback(url);
    };

    Router.events.on('routeChangeComplete', handleRouteChange);

    if (hashMode) {
      Router.events.on('hashChangeComplete', handleRouteChange);
    }

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
      if (hashMode) {
        Router.events.off('hashChangeComplete', handleRouteChange);
      }
    };
  }, [Router.events, hashMode]);
}
