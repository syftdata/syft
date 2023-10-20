export type SessionCallback = (
  idle: boolean,
  sessionLength: number,
  activeTime: number
) => void;
interface Settings {
  idleTimeoutMs?: number;
  callback: SessionCallback;
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

export default class InteractionTime {
  private times: Times[];
  private isIdle: boolean;

  private idleIntervalId?: number;

  private currentIdleTimeMs: number;

  private readonly idleTimeoutMs: number;
  private readonly checkIdleIntervalMs: number;
  private readonly callback: SessionCallback;

  constructor({ idleTimeoutMs = 3000, callback }: Settings) {
    this.times = [];
    this.isIdle = false;
    this.currentIdleTimeMs = 0;

    this.checkIdleIntervalMs = 1000;
    this.idleTimeoutMs = idleTimeoutMs;
    this.callback = callback;
    this.registerEventListeners();
  }

  private readonly onBrowserActiveChange = (): void => {
    if (document.visibilityState === 'visible') {
      this.onActivity();
    } else {
      this.onInactivity();
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

  private readonly heartBeat = (): void => {
    // give heartbeat.
    this.callback(
      this.isIdle,
      performance.now() - this.times[0].start,
      this.getTimeInMilliseconds()
    );
  };

  private readonly checkIdleTime = (): void => {
    this.checkVideoState();
    if (this.currentIdleTimeMs >= this.idleTimeoutMs) {
      this.onInactivity();
    } else {
      this.heartBeat();
      this.currentIdleTimeMs += this.checkIdleIntervalMs;
    }
  };

  private readonly onActivity = (): void => {
    if (this.isIdle) {
      this.startTimer();
    }
    this.isIdle = false;
    this.currentIdleTimeMs = 0;
  };

  private readonly onInactivity = (): void => {
    if (this.isIdle) return;
    this.isIdle = true;
    this.stopTimer();
    this.heartBeat();
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
        this.checkIdleTime,
        this.checkIdleIntervalMs
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

export function sessionTrack(callback: () => void): () => void {
  const a = new InteractionTime({
    callback: (idle, sessionLength, activeTime) => {
      callback();
      // if (idle) {
      //   console.log('>> turned idle', sessionLength, activeTime);
      // } else {
      //   console.log('>> turned active', sessionLength, activeTime);
      // }
    }
  });
  a.startTimer();
  return () => {
    a.destroy();
  };
}
