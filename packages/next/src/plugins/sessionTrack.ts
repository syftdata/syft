import { type IConfigStore } from '../common/configstore';
import { type Session } from '../common/types';
import { uuid } from '../common/utils';
import { getSafeText } from './autotrack/autocapture-utils';

export interface SessionCallback {
  onNewSession: (session: Session) => void;
  onContinueSession?: (
    session: Session,
    activeTime: number,
    sessionLength: number
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

  private session: Session;

  constructor({
    configStore,
    callback,
    idleTimeCheckIntervalMs = 5000,
    idleTimeoutMs = 30 * 1000,
    sessionTimeoutMs = 30 * 60 * 1000
  }: Settings) {
    this.times = [];
    this.isIdle = false;
    this.currentIdleTimeMs = 0;

    this.idleTimeCheckIntervalMs = idleTimeCheckIntervalMs;
    this.idleTimeoutMs = idleTimeoutMs;
    this.sessionTimeoutMs = sessionTimeoutMs;
    this.callback = callback;
    this.configStore = configStore;

    this.session = this.refreshSession();
    this.registerEventListeners();
  }

  /**
   * Checks if a session needs to be started or resumed. starts if this is the first time user is visiting.
   * @returns
   */
  private readonly refreshSession = (): Session => {
    const session = this.configStore.get(SESSION_KEY) as Session;
    if (session != null) {
      const now = Date.now();
      const elapsed = now - session.lastActivityTime;
      if (elapsed <= this.sessionTimeoutMs) {
        this.callback.onContinueSession(session, 0, 0);
      } else {
        this.callback.onEndSession(session);
        return this.createNewSession();
      }
    } else {
      return this.createNewSession();
    }
    return session;
  };

  private readonly createNewSession = (): Session => {
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
      // check if we need to start a new session;
      this.refreshSession();
      this.onActivity();
    } else {
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
        performance.now() - this.times[0].start,
        this.getTimeInMilliseconds()
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
      this.startTimer();
    }
    this.isIdle = false;
    this.currentIdleTimeMs = 0;
    // append the content to session.
    if (e?.type === 'click') {
      let target = e.target as HTMLElement;
      let content: string | undefined;
      while (target != null) {
        content = getSafeText(target);
        if (content != null) {
          break;
        }
        target = target.parentElement;
      }
      if (content != null) this.session.content.push(content);
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
