declare global {
  interface Window {
    amplitude: any;
    gtag: any;
  }
}
export function amplitudeTest(optionalField?: number): void {
  window.amplitude.track('event-ampli-1', {
    argOpt: optionalField,
    arg2: false
  });

  window.amplitude.track({
    eventName: 'event-ampli-2',
    arg1: 1,
    arg2: false
  });

  const path = 'wow';
  window.amplitude.page('event-ampli-page', {
    path,
    arg2: false
  });
}

export function gaTest(): void {
  window.gtag('event', 'event-ga-1', {
    arg1: 1,
    arg2: false
  });

  window.gtag('set', 'user', {
    userid: 1,
    email: 'abc@acme.com'
  });
}
