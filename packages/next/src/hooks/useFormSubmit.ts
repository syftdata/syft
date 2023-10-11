import { useEffect } from 'react';
import { isBrowser } from '../common/utils';

function getAttributeFields(
  element: HTMLElement,
  prefix: string = ''
): Record<string, unknown> {
  const attributes = { ...element.dataset };
  const attributeFields = {};

  Object.keys(attributes).forEach(function (attribute) {
    // The `on` prefix is used for event handling but isn't a field.
    if (attribute.indexOf(prefix) === 0) {
      let value: string | boolean = attributes[attribute];

      // Detects Boolean value strings.
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      const field = attribute.slice(prefix.length);
      attributeFields[field] = value;
    }
  });

  return attributeFields;
}

function parseFormAction(
  formAction: string,
  baseUrl: string = window.location.href
): URL | null {
  try {
    const parsedURL = new URL(formAction, baseUrl);
    return parsedURL;
  } catch (error) {
    return null;
  }
}

export interface UseFormSubmitOptions {
  callback: (url: URL, attributes: Record<string, unknown>) => void;

  enabled?: boolean;

  shouldTrackOutboundForm?: (form: HTMLFormElement, url: URL) => boolean;
}

export function useFormSubmit({
  callback,
  enabled = true,
  shouldTrackOutboundForm
}: UseFormSubmitOptions): void {
  const trackSubmit = (event: SubmitEvent): void => {
    const form = event.target as HTMLFormElement;
    const parsedUrl: URL = parseFormAction(form.action);
    if (parsedUrl == null) {
      return;
    }
    if (shouldTrackOutboundForm != null) {
      const shouldTrack = shouldTrackOutboundForm(form, parsedUrl);
      if (!shouldTrack) {
        return;
      }
    }

    if (!(typeof process !== 'undefined' && process.env.NODE_ENV === 'test')) {
      setTimeout(() => {
        form.submit();
      }, 150);
    }
    const userFields = getAttributeFields(form);
    callback(parsedUrl, userFields);
    event.preventDefault();
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (!isBrowser()) {
      return;
    }

    document.addEventListener('submit', trackSubmit);
    return () => {
      document.removeEventListener('submit', trackSubmit);
    };
  }, []);
}
