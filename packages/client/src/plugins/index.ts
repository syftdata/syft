/**
 * Supported Metrics Providers. We can revisit modeling this in the future.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export enum MetricProvider {
  Amplitude = 'amplitude-js' as string,

  MixPanel = 'mixpanel-browser' as string,
  Heap = '@heap/react-heap' as string,
  GA4 = 'react-ga4' as string,
  Segment = 'analytics-node' as string,
  Testing = 'testing-plugin' as string
}

export * from './Segment';
export * from './Amplitude';
export * from './MixPanel';
export * from './Heap';
export * from './GA4';
export * from './TestingPlugin';
