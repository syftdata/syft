import { getCurrentPath } from '../common/utils';

export function pageViews(
  callback: (v: string) => void,
  hashMode = true
): () => void {
  const handleRouteChange = (): void => {
    callback(getCurrentPath(hashMode));
  };

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
}
