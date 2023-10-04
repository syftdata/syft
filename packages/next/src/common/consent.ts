import { globalStore } from './configstore';

interface ConsentOptions {
  respectDnt?: boolean;
}
export type ConsentConfig = ConsentOptions | boolean | undefined;

const GDPR_DEFAULT_PERSISTENCE_PREFIX = '_opt_in_out_';
function getKey(): string {
  return `${GDPR_DEFAULT_PERSISTENCE_PREFIX}.default`;
}

function getOptionsFromConfig(
  config: ConsentConfig
): ConsentOptions | undefined {
  if (config == null) return undefined;
  if (typeof config === 'boolean') {
    return config ? {} : undefined;
  }
  return config;
}

/**
 * call this method when user opts in / accepts.
 */
export function optIn(): void {
  const key = getKey();
  globalStore.set(key, '1');
}

/**
 * call this method when user opts out / rejects.
 */
export function optOut(): void {
  const key = getKey();
  globalStore.set(key, '0');
}

/**
 * This method helps to decide if consent popup needs to be shown.
 * returns true if user had either opted in or opted out.
 */
export function hasGivenConsent(): boolean {
  return globalStore.get(getKey()) != null;
}

/**
 * This method helps to check if data can be collected or not.
 * returns true if it is okay to collect data.
 */
export function canLog(config: ConsentConfig): boolean {
  const options = getOptionsFromConfig(config);
  if (options == null) return true;
  if (options.respectDnt === true) {
    if ([true, 1, '1', 'yes'].includes(window.navigator.doNotTrack))
      return false;
  }
  return globalStore.get(getKey()) === '1';
}

/**
 * This method helps to check if user has given consent or not.
 * returns true if user opted in.
 */
export function hasOptedIn(): boolean {
  return globalStore.get(getKey()) === '1';
}

/**
 * This method helps to reset the consent.
 */
export function clearOptInOut(): void {
  globalStore.remove(getKey());
}
