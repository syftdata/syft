import { convertToAttributeSet } from '../blocks/forms/get_attributes';
import { findIdentityInForm } from '../blocks/forms/get_identity';
import { removeSensitive } from '../blocks/forms/remove_sensitive';
import UniversalConfigStore, {
  CookieConfigStore,
  InMemoryConfigStore
} from '../common/configstore';
import AutoTracker from '../common/tracker';
import { DEFAULT_UPLOAD_PATH } from '../common/types';
import { BatchUploader } from '../common/uploader';
import { getCurrentPath, ready } from '../common/utils';
import { buttonClicks } from '../plugins/buttonClicks';
import { formSubmits } from '../plugins/formSubmit';
import { linkClicks } from '../plugins/linkClicks';
import { pageViews } from '../plugins/pageViews';
import { InteractionTime } from '../plugins/sessionTrack';

export type ExistingLog = [string, ...any[]];

declare global {
  interface Window {
    syftc: SyftProps;
    syft: ExistingLog[] | AutoTracker<any>;
  }
}

interface SyftProps {
  autoTrackEnabled?: boolean; // true by default. set it to false, if you want to disable auto tracking completely. use below individual flags to enable/disable specific tracking.
  trackPageViews?: boolean;
  hashMode?: boolean;

  trackOutboundLinks?: boolean;
  trackMedia?: boolean;
  trackButtonClicks?: boolean;
  trackFormSubmits?: boolean;

  enabled?: boolean; // true by default if not specified. set it to false, until a consent is given.

  /**
   * The path to upload the events to. Defaults to `/api/syft`.
   */
  uploadPath?: string;
  replicateTo?: string[]; // if specified, then the events are replicated to these urls.
  sourceId?: string;

  acrossDomain?: boolean; // true by default. if false, then visitors are not tracked across your sub domains.

  identifyFormPage?: string; // the page where the identify form is located
}

let uploader: BatchUploader | undefined;
let tracker: AutoTracker<any> | undefined;
const deregisterCallbacks: Array<() => void> = [];
function startSyft(): () => void {
  const props = window.syftc ?? {};
  // pass the url based on the proxy options.
  uploader = new BatchUploader({
    sourceId: props.sourceId,
    url: props.uploadPath ?? DEFAULT_UPLOAD_PATH,
    replicateTo: props.replicateTo,
    batchSize: 10,
    maxWaitingTime: 9999,
    preferBeacon: true
  });

  let domain: string | undefined;
  if (props.acrossDomain !== false) {
    domain = window.location.hostname;
    // set the cookie domain to root domain.
    const parts = domain.split('.');
    if (parts.length > 2) {
      parts.shift();
    }
    domain = parts.join('.');
  }
  const store = new UniversalConfigStore('syft', [
    new InMemoryConfigStore(),
    new CookieConfigStore(domain)
  ]);
  tracker = new AutoTracker(
    {
      uploader,
      middleware: (e) => {
        // we are dropping the data. instead hold the data ?
        if (window.syftc.enabled !== false) return e;
      }
    },
    store
  );

  const a = new InteractionTime({
    callback: {
      onNewSession: (session) => {
        tracker.session = session;
      },
      onEndSession: (session) => {
        tracker.session = undefined;
      },
      onContinueSession: (session, activeTime, sessionLength, content) => {
        tracker.session = session;
        if (props.autoTrackEnabled !== false) {
          tracker.track('syft_session', {
            activeTime,
            sessionLength,
            content: content.join('\n')
          });
        }
      }
    },
    configStore: store
  });
  a.startTimer();
  deregisterCallbacks.push(a.destroy);
  if (props.autoTrackEnabled !== false) {
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
    // if (props.trackMedia !== false) {
    //   const cb = mediaPlays((type, video) => {
    //     tracker.track(`Video ${type}`, {
    //       src: video.currentSrc,
    //       id: video.id,
    //       position: video.currentTime
    //     });
    //   });
    //   deregisterCallbacks.push(cb);
    // }
    if (props.trackButtonClicks !== false) {
      const cb = buttonClicks((type, text, selectors) => {
        tracker.track('Button Clicked', { type, text, selectors });
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
            if (identity?.id != null && identity?.id !== '') {
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
    } else if (type === 'signup') {
      tracker.signup(...(data as [string, Record<string, any>?]));
    } else if (type === 'identify') {
      tracker.identify(...(data as [string, Record<string, any>?]));
    }
  });

  // flush the data before page goes to background.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      uploader.urgentFlush();
    }
  });

  return () => {
    // flush the data before page unloads.
    uploader.urgentFlush();
    deregisterCallbacks.forEach((deregister) => {
      deregister();
    });
    deregisterCallbacks.length = 0;
  };
}
const deregister = startSyft();
window.onbeforeunload = () => {
  deregister();
};
