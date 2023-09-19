/*
 * Get the className of an element, accounting for edge cases where element.className is an object
 * @param {Element} el - element to get the className of
 * @returns {string} the element's class
 */
import { type EventTag, type AutocaptureConfig } from './types';
import { _trim } from './utils';

export function getClassName(el: Element): string {
  switch (typeof el.className) {
    case 'string':
      return el.className;
    // TODO: when is this ever used?
    case 'object': {
      // handle cases where className might be SVGAnimatedString or some other type
      const baseVal = (el.className as any).baseVal;
      return baseVal ?? el.getAttribute('class') ?? '';
    }
    default:
      // future proof
      return '';
  }
}

/*
 * Get the direct text content of an element, protecting against sensitive data collection.
 * Concats textContent of each of the element's text node children; this avoids potential
 * collection of sensitive data that could happen if we used element.textContent and the
 * element had sensitive child elements, since element.textContent includes child content.
 * Scrubs values that look like they could be sensitive (i.e. cc or ssn number).
 * @param {Element} el - element to get the text of
 * @returns {string} the element's direct text content
 */
export function getSafeText(el: Element): string {
  let elText = '';

  if (
    !isSensitiveElement(el) &&
    el.childNodes != null &&
    el.childNodes.length > 0
  ) {
    el.childNodes.forEach((child) => {
      if (child instanceof Element && isTextNode(child)) {
        elText += _trim(child.textContent)
          // scrub potentially sensitive values
          .split(/(\s+)/)
          .filter(shouldCaptureValue)
          .join('')
          // normalize whitespace
          .replace(/[\r\n]/g, ' ')
          .replace(/[ ]+/g, ' ')
          // truncate
          .substring(0, 255);
      }
    });
  }

  return _trim(elText);
}

/*
 * Check whether an element has nodeType Node.ELEMENT_NODE
 * @param {Element} el - element to check
 * @returns {boolean} whether el is of the correct nodeType
 */
export function isElementNode(
  el: Element | undefined | null
): el is HTMLElement {
  return !(el == null) && el.nodeType === 1; // Node.ELEMENT_NODE - use integer constant for browser portability
}

/*
 * Check whether an element is of a given tag type.
 * Due to potential reference discrepancies (such as the webcomponents.js polyfill),
 * we want to match tagNames instead of specific references because something like
 * element === document.body won't always work because element might not be a native
 * element.
 * @param {Element} el - element to check
 * @param {string} tag - tag name (e.g., "div")
 * @returns {boolean} whether el is of the given tag type
 */
export function isTag(
  el: Element | undefined | null,
  tag: string
): el is HTMLElement {
  return (
    !(el == null) &&
    el.tagName != null &&
    el.tagName.toLowerCase() === tag.toLowerCase()
  );
}

/*
 * Check whether an element has nodeType Node.TEXT_NODE
 * @param {Element} el - element to check
 * @returns {boolean} whether el is of the correct nodeType
 */
export function isTextNode(el: Element | undefined | null): el is HTMLElement {
  return !(el == null) && el.nodeType === 3; // Node.TEXT_NODE - use integer constant for browser portability
}

/*
 * Check whether an element has nodeType Node.DOCUMENT_FRAGMENT_NODE
 * @param {Element} el - element to check
 * @returns {boolean} whether el is of the correct nodeType
 */
export function isDocumentFragment(
  el: Element | ParentNode | undefined | null
): el is DocumentFragment {
  return !(el == null) && el.nodeType === 11; // Node.DOCUMENT_FRAGMENT_NODE - use integer constant for browser portability
}

export const autocaptureCompatibleElements = [
  'a',
  'button',
  'form',
  'input',
  'select',
  'textarea',
  'label'
];

function matchedEventTag(el: Element, event: Event, tag: EventTag): boolean {
  try {
    return (
      tag.reactSource.handlers.includes(event.type) && el.matches(tag.selector)
    );
  } catch (e) {}
  return false;
}

/*
 * Check whether a DOM event should be "captured" or if it may contain sentitive data
 * using a variety of heuristics.
 * @param {Element} el - element to check
 * @param {Event} event - event to check
 * @param {Object} autocaptureConfig - autocapture config
 * @returns {boolean} whether the event should be captured
 */
export function getMatchingEventTag(
  el: Element,
  event: Event,
  autocaptureConfig: AutocaptureConfig | undefined = undefined
): EventTag | undefined {
  if (isTag(el, 'html') || !isElementNode(el)) {
    return;
  }

  if (autocaptureConfig?.url_allowlist != null) {
    const url = window.location.href;
    const allowlist = autocaptureConfig.url_allowlist;
    if (!allowlist.some((regex) => url.match(regex))) {
      return;
    }
  }

  if (autocaptureConfig?.dom_event_allowlist != null) {
    const allowlist = autocaptureConfig.dom_event_allowlist;
    if (!allowlist.some((eventType) => event.type === eventType)) {
      return;
    }
  }

  if (autocaptureConfig?.element_allowlist != null) {
    const allowlist = autocaptureConfig.element_allowlist;
    if (
      !allowlist.some((elementType) => el.tagName.toLowerCase() === elementType)
    ) {
      return;
    }
  }

  if (autocaptureConfig?.css_selector_allowlist != null) {
    const allowlist = autocaptureConfig.css_selector_allowlist;
    if (!allowlist.some((selector) => el.matches(selector))) {
      return;
    }
  }

  const tags = autocaptureConfig?.tags ?? [];
  return tags.find((t) => matchedEventTag(el, event, t));
}

/*
 * Check whether a DOM element is 'sensitive' and we should only capture limited data
 * @param {Element} el - element to check
 * @returns {boolean} whether the element should be captured
 */
export function isSensitiveElement(el: Element): boolean {
  // don't send data from inputs or similar elements since there will always be
  // a risk of clientside javascript placing sensitive data in attributes
  const allowedInputTypes = ['button', 'checkbox', 'submit', 'reset'];
  if (
    (isTag(el, 'input') &&
      !allowedInputTypes.includes((el as HTMLInputElement).type)) ||
    isTag(el, 'select') ||
    isTag(el, 'textarea') ||
    el.getAttribute('contenteditable') === 'true'
  ) {
    return true;
  }
  return false;
}

/*
 * Check whether a string value should be "captured" or if it may contain sentitive data
 * using a variety of heuristics.
 * @param {string} value - string value to check
 * @returns {boolean} whether the element should be captured
 */
export function shouldCaptureValue(value: string): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === 'string') {
    value = _trim(value);

    // check to see if input value looks like a credit card number
    // see: https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9781449327453/ch04s20.html
    const ccRegex =
      /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/;
    if (ccRegex.test(value.replace(/[- ]/g, ''))) {
      return false;
    }

    // check to see if input value looks like a social security number
    const ssnRegex = /(^\d{3}-?\d{2}-?\d{4}$)/;
    if (ssnRegex.test(value)) {
      return false;
    }
  }

  return true;
}

/*
 * Iterate through children of a target element looking for span tags
 * and return the text content of the span tags, separated by spaces,
 * along with the direct text content of the target element
 * @param {Element} target - element to check
 * @returns {string} text content of the target element and its child span tags
 */
export function getDirectAndNestedSpanText(target: Element): string {
  let text = getSafeText(target);
  text = `${text} ${getNestedSpanText(target)}`.trim();
  return shouldCaptureValue(text) ? text : '';
}

/*
 * Iterate through children of a target element looking for span tags
 * and return the text content of the span tags, separated by spaces
 * @param {Element} target - element to check
 * @returns {string} text content of span tags
 */
export function getNestedSpanText(target: Element): string {
  let text = '';
  if (target?.childNodes?.length > 0) {
    target.childNodes.forEach((child) => {
      if (
        child instanceof Element &&
        child?.tagName?.toLowerCase() === 'span'
      ) {
        try {
          const spanText = getSafeText(child);
          text = `${text} ${spanText}`.trim();
          if (child.childNodes?.length > 0) {
            text = `${text} ${getNestedSpanText(child)}`.trim();
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  }
  return text;
}
