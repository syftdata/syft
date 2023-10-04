import { useEffect } from 'react';

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
  const handleRouteChange = (): void => {
    callback(new URL(window.location.href));
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const originalPushState = history.pushState;
    if (originalPushState != null) {
      history.pushState = function (data, title, url) {
        originalPushState.apply(this, [data, title, url]);
        handleRouteChange();
      };
      addEventListener('popstate', handleRouteChange);
    }
    // Attach hashchange listener
    if (hashMode) {
      addEventListener('hashchange', handleRouteChange);
    }

    return () => {
      if (originalPushState != null) {
        history.pushState = originalPushState;
        removeEventListener('popstate', handleRouteChange);
      }
      if (hashMode) {
        removeEventListener('hashchange', handleRouteChange);
      }
    };
  }, [hashMode, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    // call the callback once on mount.
    handleRouteChange();
  });
}
