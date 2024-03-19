import { createContext, useEffect, useState, type ReactNode } from 'react';
import { globalStore } from '../common/configstore';
import { type ConsentConfig } from '../common/consent';
import type { EventTypes } from '../common/event_types';
import AutoTracker from '../common/tracker';
import type { Event } from '../common/types';
import { BatchUploader } from '../common/uploader';
import { isBrowser } from '../common/utils';
import { useLinkClicks, usePageViews } from '../hooks';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { useTrackTags } from '../hooks/useTrackTags';
import { type AutocaptureConfig } from '../plugins/autotrack/types';

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
  trackFormSubmits?: boolean;
  autocapture?: AutocaptureConfig;

  consent?: ConsentConfig;

  middleware?: (event: Event) => Event | undefined;

  /**
   * The path to upload the events to. Defaults to `/api/syft`.
   */
  uploadPath?: string;
  sourceId?: string; // a way to uniquely identify your uploader.
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
      sourceId: props.sourceId,
      url: props.uploadPath ?? '/api/syft',
      batchSize: 1
    });
    tracker = new AutoTracker<E>(
      {
        uploader,
        consent: props.consent,
        middleware: props.middleware
      },
      globalStore
    );
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
        'https://cdn.syftdata.com/syftbar/0.0.1/syftbar.es.js';
      script.type = 'module';
      document.body.appendChild(script);
    }
  }, []);

  usePageViews({
    enabled: autocaptureEnabled && props.trackPageViews !== false,
    hashMode: props.hashMode !== false,
    callback: (pathname) => {
      tracker?.page(undefined, pathname);
    }
  });

  useLinkClicks({
    enabled: autocaptureEnabled && props.trackOutboundLinks !== false,
    callback: (href) => {
      tracker?.track('OutboundLink Clicked', { href });
    }
  });

  useFormSubmit({
    enabled: autocaptureEnabled && props.trackFormSubmits !== false,
    callback: (url, formData, destination) => {
      const eventName =
        destination != null && destination.hostname !== window.location.hostname
          ? 'Outbound Form'
          : 'Form Submitted';

      // clean up the field data and extract attributes.

      tracker?.track(eventName, {
        destination: destination?.toString(),
        ...formData.attributes
      });
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
