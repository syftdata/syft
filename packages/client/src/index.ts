/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */
import Syft from './generated';

export * from './plugins';
export * from './types';
export * from './generated';

declare global {
  interface Window {
    syft: any;
  }
}

export namespace type {
  export interface CUID2 {}
  export interface CUID {}
  export interface UUID {}
  export interface Email {}
  export interface Url {}
  export interface CountryCode {}
  export function now(): Date {
    return new Date();
  }
  export function autoincrement(): number {
    return 0;
  }
}

// now load the syft events from window.
if (typeof window !== 'undefined') {
  if (window?.syft !== undefined) {
    const stub = window.syft;
    const syft = new Syft(stub._options);
    stub.forEach((event) => {
      syft.reflectEvent(event.name, event.fields);
    });
  }
}

export default Syft;
