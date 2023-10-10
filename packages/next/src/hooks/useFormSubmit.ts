import { useEffect } from 'react';
import { getAttributeFields, isBrowser } from '../common/utils';
import { parseUrl } from 'dom-utils';

export interface UseFormSubmitOptions {
  callback: (url: Location, attributes: Record<string, unknown>) => void;

  enabled?: boolean;

  shouldTrackOutboundForm?: (form: HTMLFormElement, url: Location) => boolean;
}

export function useFormSubmit({
  callback,
  enabled = true,
  shouldTrackOutboundForm
}: UseFormSubmitOptions): void {
  const trackSubmit = (event: SubmitEvent): void => {
    const form = event.target as HTMLFormElement;
    const parsedUrl: Location = parseUrl(form.action);
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
