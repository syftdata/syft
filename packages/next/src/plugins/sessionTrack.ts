import { type IConfigStore } from '../common/configstore';
import { type Session } from '../common/types';
import { uuid } from '../common/utils';
import { getSafeText } from './autotrack/autocapture-utils';

export interface SessionCallback {
  onNewSession: (session: Session) => void;
  onContinueSession?: (
    session: Session,
    activeTime: number,
    sessionLength: number,
    content: string[]
  ) => void;
  onEndSession: (session: Session) => void;
}

interface Settings {
  // must be smaller than idle timeout.
  idleTimeCheckIntervalMs?: number;

  // must be smaller than session timeout.
  idleTimeoutMs?: number;

  // must be large. session is tracked across tabs.
  sessionTimeoutMs?: number;

  callback: SessionCallback;
  configStore: IConfigStore;
}
interface Times {
  start: number;
  stop: number | null;
}

const windowIdleEvents = ['scroll', 'resize'];
const documentIdleEvents = [
  'keydown',
  'keyup',
  'mousedown',
  'mousemove',
  'touchstart',
  'touchmove',
  'click',
  'play',
  'contextmenu'
];

const SESSION_KEY = 'session';

interface SessionInternal extends Session {
  lastActivityTime: number;
  content: string[];
}

const modifyEventListeners = (
  action: 'add' | 'remove',
  target: Window | Document,
  events: string[],
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void => {
  events.forEach((event) => {
    target[`${action}EventListener`](event, listener, options);
  });
};

// Simplified content collection
const getContentFromClick = (
  target: HTMLElement | undefined,
  levels: number
): string | undefined => {
  while (levels-- > 0 && target != null) {
    const content = getSafeText(target);
    if (content != null && content.length > 0) return content;
    target = target.parentElement;
  }
};

export class InteractionTime {
  private times: Times[];
  private isIdle: boolean;

  private idleIntervalId?: number;
  private readonly idleTimeoutMs: number;
  private readonly sessionTimeoutMs: number;
  private readonly idleTimeCheckIntervalMs: number;
  private readonly callback: SessionCallback;
  private readonly configStore: IConfigStore;

  private session: SessionInternal;

  constructor({
    configStore,
    callback,
    idleTimeCheckIntervalMs = 10 * 1000,
    idleTimeoutMs = 30 * 1000,
    sessionTimeoutMs = 10 * 60 * 1000
  }: Settings) {
    this.idleTimeCheckIntervalMs = idleTimeCheckIntervalMs;
    this.idleTimeoutMs = idleTimeoutMs;
    this.sessionTimeoutMs = sessionTimeoutMs;
    this.callback = callback;
    this.configStore = configStore;
    this.session = this.configStore.get(SESSION_KEY) as SessionInternal;

    this.times = [];
    this.isIdle = true;
    this.onActivity(); // to start the session.
    this.registerEventListeners();
  }

  /**
   * Checks if a session needs to be started or resumed.
   * starts if this is the first time user is visiting.
   * NOTE: lastActivityTime is based on performance.now() which can get reset after browser restart. so, elapsed time can be negative.
   * @returns
   */
  private readonly refreshSession = (session?: SessionInternal): void => {
    if (session != null) {
      const elapsed = performance.now() - session.lastActivityTime;
      if (elapsed >= 0 && elapsed < this.sessionTimeoutMs) {
        this.session = session;
      } else {
        this.callback.onEndSession(session);
        this.createNewSession();
      }
    } else {
      this.createNewSession();
    }
  };

  private readonly createNewSession = (): SessionInternal => {
    this.times = [];
    const session = {
      id: uuid(),
      startTime: new Date(),
      lastActivityTime: performance.now(),
      content: []
    };
    this.configStore.set(SESSION_KEY, session);
    this.session = session;
    this.callback.onNewSession(session);
    return session;
  };

  private readonly onBrowserActiveChange = (): void => {
    if (document.visibilityState === 'visible') {
      this.onActivity();
    } else {
      this.markAsIdle();
    }
  };

  /**
   * Call this method to let listeners know that user is active.
   */
  private readonly notifyTheSession = (): void => {
    // console.log("notifying session", this.session.id,
    //   this.session.content, this.getTimeInMilliseconds() / 1000,
    //   (performance.now() - this.times[0].start) / 1000);
    if (this.callback.onContinueSession != null) {
      this.callback.onContinueSession(
        this.session,
        this.getTimeInMilliseconds(),
        performance.now() - this.times[0].start,
        this.session.content
      );
      this.session.content = [];
    }
  };

  private readonly markAsIdle = (): void => {
    this.isIdle = true;
    this.stopTimer();
  };

  /**
   * This method checks if user spent more than allowed idle time.
   * If yes, it marks the user as inactive. otherwise, calls heartbeat.
   */
  private readonly checkIfIdle = (): void => {
    const elapsed = performance.now() - this.session.lastActivityTime;
    if (elapsed > 0 && elapsed < this.idleTimeoutMs) {
      this.notifyTheSession();
    } else {
      this.markAsIdle();
    }
    this.configStore.set(SESSION_KEY, this.session); // store the session in memory.
  };

  private readonly onActivity = (e?: Event): void => {
    if (this.isIdle) {
      // check if we need to start a new session;
      this.refreshSession(this.session);
      this.startTimer();
      this.isIdle = false;
    }
    try {
      // append the content to session.
      if (e?.type === 'click') {
        const target = e.target as HTMLElement;
        const content = getContentFromClick(target, 2);
        if (content != null) {
          // only keep last 3 clicks, to keep cookie size small.
          if (!this.session.content.includes(content)) {
            this.session.content.push(content);
            while (this.session.content.length > 3) {
              this.session.content.shift();
            }
          }
        }
      }
    } catch (_e) {
      // ignore
    }
    this.session.lastActivityTime = performance.now();
  };

  private readonly registerEventListeners = (): void => {
    const documentListenerOptions = { passive: true };
    const windowListenerOptions = { ...documentListenerOptions, capture: true };

    document.addEventListener('visibilitychange', this.onBrowserActiveChange);
    modifyEventListeners(
      'add',
      window,
      windowIdleEvents,
      this.onActivity,
      windowListenerOptions
    );
    modifyEventListeners(
      'add',
      document,
      documentIdleEvents,
      this.onActivity,
      documentListenerOptions
    );
  };

  private readonly unregisterEventListeners = (): void => {
    document.removeEventListener(
      'visibilitychange',
      this.onBrowserActiveChange
    );
    modifyEventListeners('remove', window, windowIdleEvents, this.onActivity);
    modifyEventListeners(
      'remove',
      document,
      documentIdleEvents,
      this.onActivity
    );
  };

  private readonly startTimer = (): void => {
    this.times.push({
      start: performance.now(),
      stop: null
    });
    if (this.idleIntervalId == null) {
      this.idleIntervalId = window.setInterval(
        this.checkIfIdle,
        this.idleTimeCheckIntervalMs
      );
    }
  };

  private readonly stopTimer = (): void => {
    if (this.times.length > 0) {
      this.times[this.times.length - 1].stop = performance.now();
    }
    if (this.idleIntervalId != null) {
      window.clearInterval(this.idleIntervalId);
      this.idleIntervalId = undefined;
    }
  };

  private readonly getTimeInMilliseconds = (): number => {
    return this.times.reduce((acc, current) => {
      if (current.stop != null) {
        acc = acc + (current.stop - current.start);
      } else {
        acc = acc + (performance.now() - current.start);
      }
      return acc;
    }, 0);
  };

  public destroy = (): void => {
    // flush the data before page unloads.
    this.stopTimer();
    this.notifyTheSession();
    this.times = [];
    this.isIdle = true;
    this.unregisterEventListeners();
  };
}
