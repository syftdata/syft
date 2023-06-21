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

  // below is a duplicate track call for "event-ampli-2", with different properties.
  // our analyzer merges them.
  window.amplitude.track({
    eventName: 'event-ampli-2',
    arg1: optionalField, // test merging isOptional
    arg2: false,
    arg3: 'wow' // test merging new args
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
