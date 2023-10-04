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
import { type ConsentOptions } from '../common/consent';

declare global {
  interface Window {
    SyftUpdateAutoCapture?: (config: AutocaptureConfig) => void;
    SyftUserSession?: {
      syftToken: string;
      syftId: string;
      syftSourceId: string;
    };
  }
}

export interface ProviderProps {
  children?: ReactNode | ReactNode[];

  /**
   * Use this to explicitly decide whether or not to render script. If not passed the script will be rendered in production environments.
   */
  enabled?: boolean;

  trackPageViews?: boolean;
  hashMode?: boolean;

  trackOutboundLinks?: boolean;
  autocapture?: AutocaptureConfig;

  consent?: ConsentOptions;

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
  const enabled = props.enabled !== undefined ? props.enabled : true;
  const autocaptureEnabled = enabled && isBrowser();

  if (tracker == null && enabled) {
    // pass the url based on the proxy options.
    uploader = new BatchUploader({
      url: props.uploadPath ?? '/api/syft',
      batchSize: 1
    });
    tracker = new AutoTracker<E>({
      uploader,
      consent: props.consent,
      middleware: props.middleware
    });
  }

  const [autocapture, setAutoCaptureConfig] = useState<
    AutocaptureConfig | undefined
  >(props.autocapture);

  useEffect(() => {
    if (window.location.href.includes('syft_token')) {
      const url = new URL(window.location.href);
      const syftToken = url.searchParams.get('syft_token');
      const syftId = url.searchParams.get('syft_id');
      const syftSourceId = url.searchParams.get('syft_source_id');
      if (syftToken != null && syftId != null) {
        window.SyftUserSession = {
          syftToken,
          syftId,
          syftSourceId
        };
        localStorage.setItem(
          'syft-user-session',
          JSON.stringify(window.SyftUserSession)
        );
      }
    }
    if (window.SyftUserSession == null) {
      window.SyftUserSession = JSON.parse(
        localStorage.getItem('syft-user-session')
      );
    }
    if (window.SyftUserSession != null) {
      window.SyftUpdateAutoCapture = (config) => {
        setAutoCaptureConfig({
          ...autocapture,
          ...config
        });
      };
      const script = document.createElement('script');
      script.src =
        autocapture?.toolbarJS ??
        'https://storage.googleapis.com/syft_cdn/syftbar/0.0.1/syftbar.es.js';
      script.type = 'module';
      document.body.appendChild(script);
    }
  }, []);

  usePageViews({
    enabled: autocaptureEnabled && props.trackPageViews !== false,
    hashMode: props.hashMode !== false,
    callback: (url) => {
      tracker?.page(undefined, url.toString());
    }
  });

  useLinkClicks({
    enabled: autocaptureEnabled && props.trackOutboundLinks !== false,
    callback: (href) => {
      tracker?.track('OutboundLink Clicked', { href });
    }
  });

  useTrackTags({
    enabled:
      autocaptureEnabled &&
      autocapture?.schemas != null &&
      autocapture?.tags != null,
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
