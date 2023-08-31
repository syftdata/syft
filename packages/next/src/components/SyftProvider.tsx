import React, { createContext, type ReactNode } from 'react';
import { isBrowser } from '../common/utils';
import AutoTracker from '../common/tracker';
import type { Event } from '../common/types';
import type { EventTypes } from '../common/event_types';
import { BatchUploader } from '../common/uploader';
import { useLinkClicks, usePageViews } from '../hooks';

export interface ProviderProps {
  children?: ReactNode | ReactNode[];

  /**
   * Use this to explicitly decide whether or not to render script. If not passed the script will be rendered in production environments.
   */
  enabled?: boolean;
  trackPageviews?: boolean;
  hashMode?: boolean;

  middleware?: (event: Event) => Event | undefined;

  trackOutboundLinks?: boolean;

  /**
   * The path to upload the events to. Defaults to `/api/syft`.
   */
  uploadPath?: string;
}

let uploader: BatchUploader | undefined;
let tracker: AutoTracker<any> | undefined;
export const SyftContext = createContext<typeof tracker>(undefined);
export const SyftProvider = <E extends EventTypes>(
  props: ProviderProps
): JSX.Element => {
  const { enabled = true, children } = props;
  if (tracker == null && enabled) {
    // pass the url based on the proxy options.
    uploader = new BatchUploader({
      url: props.uploadPath ?? '/api/syft',
      batchSize: 1
    });
    tracker = new AutoTracker<E>({
      uploader,
      middleware: props.middleware ?? ((event) => event)
    });
  }

  usePageViews({
    hashMode: props.hashMode,
    enabled: enabled && props.trackPageviews === true && isBrowser(),
    callback: (url) => {
      tracker?.page(undefined, url.toString());
    }
  });

  useLinkClicks({
    enabled: enabled && props.trackOutboundLinks === true && isBrowser(),
    callback: (href) => {
      tracker?.track('OutboundLink Clicked', { href });
    }
  });

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <SyftContext.Provider value={tracker}>{children}</SyftContext.Provider>
  );
};
