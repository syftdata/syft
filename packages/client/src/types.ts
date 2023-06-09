import type { ApiEvent } from './monitor/types';
import type { MetricsDependency } from './metrics_dependency_registry';

export enum SyftEventType {
  TRACK,
  PAGE,
  SCREEN,
  IDENTIFY,
  GROUP_IDENTIFY
}

export enum SyftEventTrackStatus {
  TRACKED, // event is modeled and instrumented using syft.
  SEMI_TRACKED, // event is modeled, but the library is not being used.
  NOT_TRACKED // event is not modeled.
}

export enum SyftEventValidStatus {
  VALID, // event data is valid.
  NOT_VALID, // event data is not valid.
  UNKNOWN // we don't know if the event data is valid.
}

export enum SyftEventInstrumentStatus {
  INSTRUMENTED, // event is instrumented.
  NOT_INSTRUMENTED, // event is not instrumented.
  NOT_INSTRUMENTED_VERBOSE // event is not instrumented, and includes a lot of events.
}

export enum NamingCase {
  KEEP_AS_IS,
  SNAKE, // Replace spaces with underscore and lowercase.
  CAMEL, // Remove spaces/underscores and convert first letter to uppercase.
  PASCAL,
  TITLE,
  LOWER,
  UPPER
}

export interface SyftProps {
  eventName: string;
  eventType: SyftEventType;
  isValid: boolean;
}

export interface SyftEvent extends Record<string, any> {
  syft: SyftProps;
}

export const SyftEnv = {
  Prod: 'prod',
  Dev: 'dev'
} as const;

export type SyftEnvType = typeof SyftEnv;
export type SyftEnvValueType = SyftEnvType[keyof SyftEnvType];

// config provided during code generation
export interface StaticConfig {
  projectName: string;
  version: string;
  strict?: boolean; // drops events if they fail invalid checks.
  eventNameCase?: NamingCase;
  propertyNameCase?: NamingCase;
  lintingDisabled?: boolean;
}

export interface MonitorConfig {
  batchSize?: number;
  batchFlushSeconds?: number;
  remote?: string | ((events: ApiEvent[]) => Promise<boolean>);
  samplingRate?: number;
  disabled?: boolean;
}

// config provided during syft runtime initialization.
export interface RuntimeConfig {
  env?: SyftEnvValueType;
  appVersion: string;
  plugins: ISyftPlugin[];
  verbose?: boolean;
  monitor?: MonitorConfig;
  apiKey?: string;
}

export interface InternalConfig {
  monitor: Required<MonitorConfig>;
}

export type FullConfig = Required<StaticConfig> &
  Required<RuntimeConfig> &
  InternalConfig;

export const DEFAULT_STATIC_CONFIG: Required<StaticConfig> = {
  version: '0.0.0',
  strict: false,
  projectName: '',
  eventNameCase: NamingCase.TITLE,
  propertyNameCase: NamingCase.KEEP_AS_IS,
  lintingDisabled: false
};
export const DEFAULT_RUNTIME_CONFIG: Required<RuntimeConfig> = {
  env: SyftEnv.Prod,
  appVersion: '0.0.0',
  plugins: [],
  verbose: false,
  monitor: {},
  apiKey: ''
};

export const DEFAULT_MONITOR_CONFIG: Required<MonitorConfig> = {
  batchSize: 30,
  batchFlushSeconds: 30,
  samplingRate: 0.01, // 1% of the data
  // remote: 'https://events.syftdata.com/reflect/v1',
  remote: '',
  disabled: false
};

export interface IReflector {
  reflectEvent: (
    eventName: string,
    eventProperties: Record<string, any>
  ) => void;
}

export interface ISyftPlugin extends MetricsDependency {
  /**
   * Gives you an opportunity to start loading the plugin dependencies
   */
  load?: () => void;
  /**
   * Return true when the plugin loaded its dependencies
   * @returns true when the plugin is ready
   */
  isLoaded: () => boolean;

  /**
   * Initialize your plugin with the reflector.
   * This is needed in order to get benefit out of syft's extensive tooling.
   * @param reflector
   */
  init: (reflector: IReflector) => void;

  /** Gets called when an event is logged.
   * A plugin can use `eventName` and `eventType` properties to route the event.
   */
  logEvent: (event: SyftEvent) => boolean;

  /** Gets called when syft.resetUser() is called. */
  resetUserProperties: () => void;
}

export interface MonitorResponse {
  error?: Error;
  stopUntil?: number; // number of milli seconds to disable.
  // to disable until the next day, set it to 24 * 60 * 60 * 1000
}

export interface IMonitor {
  monitor: (
    events: ApiEvent[],
    onCompleted: (response: MonitorResponse) => void
  ) => void;
}

export interface IJsonUploader {
  upload: (url: string, jsonData: string) => Promise<string>;
}

export interface IConfigStore {
  set: (key: string, value: any) => void;
  get: (key: string) => any;
  remove: (key: string) => void;
}

export interface ExternalEvent {
  type: string;
  detail: any;
}
export interface IEventDispatcher {
  dispatch: (event: ExternalEvent) => any;
}
