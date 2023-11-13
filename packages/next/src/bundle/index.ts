import { convertToAttributeSet } from '../blocks/forms/get_attributes';
import { findIdentityInForm } from '../blocks/forms/get_identity';
import { removeSensitive } from '../blocks/forms/remove_sensitive';
import AutoTracker from '../common/tracker';
import { BatchUploader } from '../common/uploader';
import { formSubmits } from '../plugins/formSubmit';
import { linkClicks } from '../plugins/linkClicks';
import { pageViews } from '../plugins/pageViews';
import { getCurrentPath, ready } from '../common/utils';
import { sessionTrack } from '../plugins/sessionTrack';
import { globalStore } from '../common/configstore';

export type ExistingLog = [string, ...any[]];

declare global {
  interface Window {
    syftc: SyftProps;
    syft: ExistingLog[] | AutoTracker<any>;
  }
}

interface SyftProps {
  trackPageViews?: boolean;
  hashMode?: boolean;

  trackOutboundLinks?: boolean;
  trackFormSubmits?: boolean;

  enabled?: boolean; // true by default if not specified. set it to false, until a consent is given.

  /**
   * The path to upload the events to. Defaults to `/api/syft`.
   */
  uploadPath?: string;
  sourceId?: string;

  identifyFormPage?: string; // the page where the identify form is located
  conversionFormPage?: string; // the page where the conversion form is located
}

let uploader: BatchUploader | undefined;
let tracker: AutoTracker<any> | undefined;
const deregisterCallbacks: Array<() => void> = [];
function startSyft(): () => void {
  const props = window.syftc ?? {};
  const enabled = props.enabled !== undefined ? props.enabled : true;
  // pass the url based on the proxy options.
  uploader = new BatchUploader({
    sourceId: props.sourceId,
    url: props.uploadPath ?? 'https://app.syftdata.com/api/syft',
    batchSize: 1
    // batchSize: 5,
    // maxWaitingTime: 5000
  });

  tracker = new AutoTracker({
    uploader,
    middleware: (e) => {
      if (window.syftc.enabled !== false) return e;
    }
  });

  if (enabled) {
    const sessionDestroy = sessionTrack(
      {
        onNewSession: (session) => {
          tracker.session = session;
        },
        onEndSession: (session) => {
          tracker.session = undefined;
        },
        onContinueSession: (session, activeTime, sessionLength, content) => {
          tracker.session = session;
          tracker.track('syft_session', {
            activeTime,
            sessionLength,
            content: content.join(' ')
          });
        }
      },
      globalStore
    );
    deregisterCallbacks.push(sessionDestroy);

    if (props.trackPageViews !== false) {
      const callPage = (path): void => {
        // wait for page to load, correctness of title is important.
        ready(() => {
          tracker.page(undefined, path);
        }, 100);
      };
      // call the page view once. we need session all the time.
      callPage(getCurrentPath(props.hashMode !== false));
      const cb = pageViews(callPage, props.hashMode !== false);
      deregisterCallbacks.push(cb);
    }

    if (props.trackOutboundLinks !== false) {
      const cb = linkClicks((href) => {
        tracker.track('OutboundLink Clicked', { href });
      });
      deregisterCallbacks.push(cb);
    }
    if (props.trackFormSubmits !== false) {
      const cb = formSubmits(
        (path, formData, destination) => {
          const eventName =
            destination != null &&
            destination.hostname !== window.location.hostname
              ? 'Outbound Form'
              : 'Form Submit';
          const attributes = {
            destination: destination?.toString(),
            ...formData.attributes,
            ...convertToAttributeSet(removeSensitive(formData.fields))
          };
          tracker.track(eventName, attributes);
          if (
            props.identifyFormPage == null ||
            path === props.identifyFormPage
          ) {
            const identity = findIdentityInForm(formData.fields);
            if (identity != null) {
              tracker.identify(identity.id, identity.traits);
            }
          }
        },
        undefined,
        tracker.source.campaign
      );
      deregisterCallbacks.push(cb);
    }
  }

  // check if there is data in syft.
  const existingData = (window.syft ?? []) as ExistingLog[];
  window.syft = tracker;
  existingData.forEach((data: any[]) => {
    const type = data.shift();
    if (type === 'page') {
      tracker.page(...(data as [string, string?]));
    } else if (type === 'track') {
      tracker.track(...(data as [string, Record<string, any>?]));
    } else if (type === 'identify') {
      tracker.identify(...(data as [string, Record<string, any>?]));
    }
  });

  return () => {
    deregisterCallbacks.forEach((deregister) => {
      deregister();
    });
    deregisterCallbacks.length = 0;
  };
}
const deregister = startSyft();
window.onunload = () => {
  deregister();
};
