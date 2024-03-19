import { type DeregisterCallback, registerEvent } from './utils';
import {
  isTag,
  isTextNode,
  getMatchingEventTag,
  isDocumentFragment
} from './autocapture-utils';
import {
  type SyftEventHandler,
  type AutocaptureConfig,
  type EventTag
} from './types';
import { type Field } from '@syftdata/common/lib/types';

const _getEventTarget = (e: Event): Element | null => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Event/target#Compatibility_notes
  if (typeof e.target === 'undefined') {
    return (e.srcElement as Element) ?? null;
  } else {
    if ((e.target as HTMLElement)?.shadowRoot != null) {
      return (e.composedPath()[0] as Element) ?? null;
    }
    return (e.target as Element) ?? null;
  }
};

export class Autocapture {
  config: AutocaptureConfig;
  callback: SyftEventHandler | undefined;

  _deregisterCallbacks: DeregisterCallback[] = [];

  constructor(config: AutocaptureConfig) {
    this.config = config;
    if (this.config?.url_allowlist != null) {
      this.config.url_allowlist = this.config.url_allowlist.map(
        (url) => new RegExp(url)
      );
    }
  }

  init(callback: SyftEventHandler): void {
    this.callback = callback;
    const res = [];
    res.push(
      registerEvent(document, 'submit', this._captureEvent, false, true)
    );
    res.push(
      registerEvent(document, 'change', this._captureEvent, false, true)
    );
    res.push(registerEvent(document, 'click', this._captureEvent, false, true));
    this._deregisterCallbacks = res.filter(
      (cb) => cb !== undefined
    ) as DeregisterCallback[];
  }

  destroy(): void {
    // unregister event.
    this._deregisterCallbacks.forEach((cb) => {
      cb();
    });
    this._deregisterCallbacks = [];
  }

  _getFieldVal = (
    field: Field,
    el: Element,
    e: Event,
    eventTag: EventTag
  ): any => {
    // TODO: fill this.
    return undefined;
  };

  _captureEvent = (e: Event): boolean | undefined => {
    /** * Don't mess with this code without running IE8 tests on it ***/
    e = e ?? window.event;
    let target = _getEventTarget(e);
    if (isTextNode(target)) {
      // defeat Safari bug (see: http://www.quirksmode.org/js/events_properties.html)
      target = (target.parentNode ?? null) as Element | null;
    }

    if (target != null) {
      let curEl = target;
      const targetElementList = [target];
      while (curEl.parentNode != null && !isTag(curEl, 'body')) {
        if (isDocumentFragment(curEl.parentNode)) {
          curEl = (curEl.parentNode as any).host;
        } else {
          curEl = curEl.parentNode as Element;
        }
        targetElementList.push(curEl);
      }

      const usedEventTags = new Set<EventTag>();
      targetElementList.forEach((el) => {
        // get event tag for el, e.type.
        const eventTag = getMatchingEventTag(el, e, this.config);
        if (eventTag != null) {
          const events = eventTag.handlerToEvents[e.type];
          if (events != null && events.length > 0) {
            if (usedEventTags.has(eventTag)) return; // skip if already used.
            usedEventTags.add(eventTag);

            events.forEach((eventName) => {
              // get schema for eventTag, eventName.
              const schema = this.config.schemas.find(
                (schema) => schema.name === eventName
              );
              if (schema != null) {
                // collect data for each field in schema.
                const props: Record<string, any> = {};
                schema.fields.forEach((field) => {
                  const value = this._getFieldVal(field, el, e, eventTag);
                  if (value !== undefined) {
                    props[field.name] = value;
                  }
                });
                if (this.callback !== undefined) {
                  this.callback(eventName, props, schema, eventTag, el);
                }
              }
            });
          }
        }
      });

      return true;
    }
  };
}
