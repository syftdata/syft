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
  'wheel',
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

export interface SessionInternal extends Session {
  lastActivityTime: number;
  content: string[];
}

class InteractionTime {
  private times: Times[];
  private isIdle: boolean;

  private idleIntervalId?: number;

  private currentIdleTimeMs: number;

  private readonly idleTimeoutMs: number;
  private readonly sessionTimeoutMs: number;
  private readonly idleTimeCheckIntervalMs: number;
  private readonly callback: SessionCallback;
  private readonly configStore: IConfigStore;

  private session: SessionInternal;

  constructor({
    configStore,
    callback,
    idleTimeCheckIntervalMs = 10 * 1000, // 10 secs is good.
    idleTimeoutMs = 30 * 1000, // 30 sec
    sessionTimeoutMs = 10 * 60 * 1000 // 10 mins by default.
  }: Settings) {
    this.times = [];
    this.isIdle = false;
    this.currentIdleTimeMs = 0;

    this.idleTimeCheckIntervalMs = idleTimeCheckIntervalMs;
    this.idleTimeoutMs = idleTimeoutMs;
    this.sessionTimeoutMs = sessionTimeoutMs;
    this.callback = callback;
    this.configStore = configStore;

    this.refreshSession();
    this.registerEventListeners();
  }

  /**
   * Checks if a session needs to be started or resumed. starts if this is the first time user is visiting.
   * @returns
   */
  private readonly refreshSession = (): void => {
    const session = this.configStore.get(SESSION_KEY) as SessionInternal;
    if (session != null) {
      this.session = session;
      if (!this.refreshSessionIfNeeded()) {
        // session is not restarted, so, call onContinueSession.
        if (this.callback.onContinueSession != null) {
          this.callback.onContinueSession(
            this.session,
            0,
            0,
            this.session.content
          );
        }
      }
    } else {
      this.createNewSession();
    }
  };

  private readonly refreshSessionIfNeeded = (): boolean => {
    const now = Date.now();
    const elapsed = now - this.session.lastActivityTime;
    if (elapsed > this.sessionTimeoutMs) {
      this.callback.onEndSession(this.session);
      this.reset(); // change the timers.
      this.createNewSession();
      return true;
    }
    return false;
  };

  private readonly createNewSession = (): SessionInternal => {
    const now = Date.now();
    const session = {
      id: uuid(),
      startTime: new Date(),
      lastActivityTime: now,
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
      // send the last heartbeat before hiding the tab.
      this.heartBeat();
      this.markAsIdle();
    }
  };

  private readonly checkVideoState = (): void => {
    const vidoes = document.querySelectorAll('video');
    const playingVideos = Array.from(vidoes).filter(
      (g) =>
        !(g.paused || g.loop || (g.muted && !g.controls) || g.readyState < 2)
    );
    if (playingVideos.length > 0 && document.visibilityState === 'visible') {
      this.onActivity();
    }
  };

  /**
   * Call this method to let listeners know that user is active.
   */
  private readonly heartBeat = (): void => {
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
    if (this.isIdle) return;
    this.isIdle = true;
    this.stopTimer();
  };

  /**
   * This method checks if user spent more than allowed idle time.
   * If yes, it marks the user as inactive. otherwise, calls heartbeat.
   */
  private readonly checkIfIdle = (): void => {
    this.checkVideoState();
    if (this.currentIdleTimeMs >= this.idleTimeoutMs) {
      this.markAsIdle();
    } else {
      this.configStore.set(SESSION_KEY, this.session);
      this.heartBeat();
      this.currentIdleTimeMs += this.idleTimeCheckIntervalMs;
    }
  };

  private readonly onActivity = (e?: Event): void => {
    if (this.isIdle) {
      // check if we need to start a new session;
      this.refreshSessionIfNeeded();
      this.startTimer();
    }
    this.isIdle = false;
    this.currentIdleTimeMs = 0;
    // append the content to session.
    if (e?.type === 'click') {
      let target = e.target as HTMLElement;
      let content: string | undefined;
      // don't go more than 2 levels up.
      for (let i = 0; i < 2 && target != null; i++) {
        content = getSafeText(target);
        if (content != null) {
          break;
        }
        target = target.parentElement;
      }
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
    this.session.lastActivityTime = Date.now();
  };

  private readonly registerEventListeners = (): void => {
    const documentListenerOptions = { passive: true };
    const windowListenerOptions = { ...documentListenerOptions, capture: true };

    document.addEventListener('visibilitychange', this.onBrowserActiveChange);

    // TODO: throttle reset.
    const throttleResetIdleTime = this.onActivity;
    windowIdleEvents.forEach((event) => {
      window.addEventListener(
        event,
        throttleResetIdleTime,
        windowListenerOptions
      );
    });

    documentIdleEvents.forEach((event) => {
      document.addEventListener(
        event,
        throttleResetIdleTime,
        documentListenerOptions
      );
    });
  };

  private readonly unregisterEventListeners = (): void => {
    document.removeEventListener(
      'visibilitychange',
      this.onBrowserActiveChange
    );

    windowIdleEvents.forEach((event) => {
      window.removeEventListener(event, this.onActivity);
    });

    documentIdleEvents.forEach((event) => {
      document.removeEventListener(event, this.onActivity);
    });
  };

  public startTimer = (): void => {
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

  public stopTimer = (): void => {
    if (this.times.length === 0) {
      return;
    }
    this.times[this.times.length - 1].stop = performance.now();
  };

  public getTimeInMilliseconds = (): number => {
    return this.times.reduce((acc, current) => {
      if (current.stop != null) {
        acc = acc + (current.stop - current.start);
      } else {
        acc = acc + (performance.now() - current.start);
      }
      return acc;
    }, 0);
  };

  public reset = (): void => {
    this.stopTimer();
    this.times = [];
    this.isIdle = false;
    this.currentIdleTimeMs = 0;

    window.clearInterval(this.idleIntervalId);
    this.idleIntervalId = undefined;
  };

  public destroy = (): void => {
    // flush the data before page unloads.
    this.heartBeat();
    this.reset();
    this.unregisterEventListeners();
  };
}

export function sessionTrack(
  callback: SessionCallback,
  configStore: IConfigStore
): () => void {
  const a = new InteractionTime({
    callback,
    configStore
  });
  a.startTimer();
  return () => {
    a.destroy();
  };
}
