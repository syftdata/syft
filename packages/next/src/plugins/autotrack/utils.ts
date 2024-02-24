export type EventHandler = (event: Event) => boolean | undefined;

// from a comment on http://dbj.org/dbj/?p=286
// fails on only one very rare and deliberate custom object:
// let bomb = { toString : undefined, valueOf: function(o) { return "function BOMBA!"; }};
export const _isFunction = function (f: any): f is (...args: any[]) => any {
  try {
    return /^\s*\bfunction\b/.test(f);
  } catch (x) {
    return false;
  }
};

export type DeregisterCallback = () => void;

export const registerEvent = (function () {
  // written by Dean Edwards, 2005
  // with input from Tino Zijdel - crisp@xs4all.nl
  // with input from Carl Sverre - mail@carlsverre.com
  // with input from PostHog
  // http://dean.edwards.name/weblog/2005/10/add-event/
  // https://gist.github.com/1930440

  /**
   * @param {Object} element
   * @param {string} type
   * @param {function(...*)} handler
   * @param {boolean=} oldSchool
   * @param {boolean=} useCapture
   */
  const _registerEvent = function (
    element: Element | Window | Document | Node,
    type: string,
    handler: EventHandler,
    oldSchool?: boolean,
    useCapture?: boolean
  ): DeregisterCallback | undefined {
    if (element == null) {
      console.error('No valid element provided to register_event');
      return;
    }

    const oldSchool2 = oldSchool !== undefined ? oldSchool : false;
    const useCapture2 = useCapture !== undefined ? useCapture : false;

    if (element.addEventListener != null && !oldSchool2) {
      element.addEventListener(type, handler, useCapture2);
      return () => {
        element.removeEventListener(type, handler, useCapture2);
      };
    } else {
      const ontype = 'on' + type;
      const oldHandler = (element as any)[ontype]; // can be undefined
      (element as any)[ontype] = makeHandler(element, handler, oldHandler);
      return () => {
        (element as any)[ontype] = oldHandler;
      };
    }
  };

  function makeHandler(
    element: Element | Window | Document | Node,
    newHandler: EventHandler,
    oldHandlers: EventHandler
  ) {
    return function (event?: Event): boolean | undefined {
      event = event ?? fixEvent(window.event);

      // this basically happens in firefox whenever another script
      // overwrites the onload callback and doesn't pass the event
      // object to previously defined callbacks.  All the browsers
      // that don't define window.event implement addEventListener
      // so the dom_loaded handler will still be fired as usual.
      if (event == null) {
        return undefined;
      }

      let ret = true;
      let oldResult: any;

      if (_isFunction(oldHandlers)) {
        oldResult = oldHandlers(event);
      }
      const newResult = newHandler.call(element, event);

      if (oldResult === false || newResult === false) {
        ret = false;
      }

      return ret;
    };
  }

  function fixEvent(event: Event | undefined): Event | undefined {
    if (event != null) {
      event.preventDefault = fixEvent.preventDefault;
      event.stopPropagation = fixEvent.stopPropagation;
    }
    return event;
  }
  fixEvent.preventDefault = function () {
    (this as unknown as Event).returnValue = false;
  };
  fixEvent.stopPropagation = function () {
    (this as unknown as Event).cancelBubble = true;
  };

  return _registerEvent;
})();

export const _trim = function (str: string): string {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

export function getLabelText(r: Element): string {
  if (!(r instanceof HTMLElement)) return;
  let t = r.innerText.trim();
  if (t.length === 0) {
    t = r.textContent.trim();
    if (t.length === 0) {
      t = r.getAttribute('aria-label');
      if (t.length === 0) {
        t = r.getAttribute('title');
      }
    }
  }
  return t;
}
