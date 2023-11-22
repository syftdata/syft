/*
 * Get the className of an element, accounting for edge cases where element.className is an object
 * @param {Element} el - element to get the className of
 * @returns {string} the element's class
 */
import { canCaptureValue } from '../../blocks/forms/remove_sensitive';
import { getDOMPathComponents, matchedEventTag } from './match-lib';
import { type AutocaptureConfig, type EventTag } from './types';

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

  // get react path for the element.
  const pathComps = getDOMPathComponents(el);
  const tags = autocaptureConfig?.tags ?? [];
  return tags.find((t) => matchedEventTag(event, t, pathComps));
}

export function canTextNodeContainer(el: Element): boolean {
  return el.tagName === 'P' || el.tagName === 'ARTICLE' || el.tagName === 'DIV';
}

/**
 * Dont capture input values. This is a helper function to get text of what user is reading.
 * @param el
 * @returns
 */
export function getSafeText(
  el: Element,
  validMinWords: number = 5
): string | undefined {
  if (!(el instanceof HTMLInputElement) && canTextNodeContainer(el)) {
    const text = el.textContent
      .trim()
      .replace(/[\r\n]/g, ' ')
      .split(/\s+/)
      .filter(canCaptureValue);
    if (text.length > validMinWords) {
      return text.join(' ').trim().slice(0, 250); // 250 characters max.
    }
  }
}
