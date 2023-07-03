/**
 * Metrics Plugin Providers with corresponding packages. The enum name should exactly match the name of the Plugin
 * without postfix 'Plugin', e.g., AmplitudePlugin enum is Amplitude. Make sure to use enum name as plugin id for new
 * Plugins, e.g., PluginPackage[PluginPackage.GA4].
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export enum PluginPackage {
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
export * from './Custom';
