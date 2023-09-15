import React, {
  createContext,
  useEffect,
  type ReactNode,
  useState
} from 'react';
import { isBrowser } from '../common/utils';
import AutoTracker from '../common/tracker';
import type { Event } from '../common/types';
import type { EventTypes } from '../common/event_types';
import { BatchUploader } from '../common/uploader';
import { useLinkClicks, usePageViews } from '../hooks';
import { useTrackTags } from '../hooks/useEventTags';
import { type AutocaptureConfig } from '../autocapture/types';

declare global {
  interface Window {
    SyftUpdateAutoCapture?: (config: AutocaptureConfig) => void;
  }
}

export interface ProviderProps {
  children?: ReactNode | ReactNode[];

  /**
   * Use this to explicitly decide whether or not to render script. If not passed the script will be rendered in production environments.
   */
  enabled?: boolean;

  autocapture?: AutocaptureConfig;

  middleware?: (event: Event) => Event | undefined;
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
  const enabled =
    props.enabled !== undefined ? props.enabled : true && isBrowser();

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

  const [autocapture, setAutoCaptureConfig] = useState<
    AutocaptureConfig | undefined
  >(props.autocapture);

  useEffect(() => {
    if (window.location.href.includes('syft_token')) {
      window.SyftUpdateAutoCapture = (config) => {
        setAutoCaptureConfig({
          ...autocapture,
          ...config
        });
      };

      // load the debug script.
      const script = document.createElement('script');
      script.src =
        autocapture.toolbarJS ?? 'http://localhost:4173/syftbar.es.js';
      script.type = 'module';
      document.body.appendChild(script);
    }
  }, []);

  usePageViews({
    enabled: enabled && autocapture?.trackPageviews === true,
    hashMode: autocapture?.hashMode,
    callback: (url) => {
      tracker?.page(undefined, url.toString());
    }
  });

  useLinkClicks({
    enabled: enabled && autocapture?.trackOutboundLinks === true,
    callback: (href) => {
      tracker?.track('OutboundLink Clicked', { href });
    }
  });

  useTrackTags({
    enabled: enabled && autocapture?.tags != null,
    callback: (name, event, tag, ele) => {
      tracker?.track(name, event);
    },
    config: autocapture
  });

  if (!enabled) {
    return <>{props.children}</>;
  }

  return (
    <SyftContext.Provider value={tracker}>
      {props.children}
    </SyftContext.Provider>
  );
};
