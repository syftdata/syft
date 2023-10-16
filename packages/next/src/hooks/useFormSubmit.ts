import { useEffect } from 'react';
import { formSubmits } from '../plugins/formSubmit';
import { type SyftFormData } from '../blocks/forms/types';

export interface UseFormSubmitOptions {
  enabled?: boolean;
  callback: (path: string, data: SyftFormData, destination?: URL) => void;
  shouldTrack?: (
    path: string,
    form: HTMLFormElement,
    destination?: URL
  ) => boolean;
}

export function useFormSubmit({
  callback,
  enabled = true,
  shouldTrack
}: UseFormSubmitOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    return formSubmits(callback, shouldTrack);
  }, []);
}
