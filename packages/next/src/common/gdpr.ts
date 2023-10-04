import { globalStore } from './configstore';

export interface GDPROptions {
  enable?: boolean;
  respectDnt?: boolean;
}

const GDPR_DEFAULT_PERSISTENCE_PREFIX = '_opt_in_out_';
function getKey(): string {
  return `${GDPR_DEFAULT_PERSISTENCE_PREFIX}.default`;
}

export function optIn(): void {
  const key = getKey();
  globalStore.set(key, '1');
}

export function optOut(): void {
  const key = getKey();
  globalStore.set(key, '0');
}

export function hasGivenConsent(): boolean {
  return globalStore.get(getKey()) != null;
}

export function hasOptedIn(): boolean {
  return globalStore.get(getKey()) === '1';
}

export function canLog(options?: GDPROptions): boolean {
  options = options ?? {};
  if (!(options.enable ?? false)) return true;
  if (options.respectDnt === true) {
    if ([true, 1, '1', 'yes'].includes(window.navigator.doNotTrack))
      return false;
  }
  return globalStore.get(getKey()) === '1';
}

export function clearOptInOut(): void {
  globalStore.remove(getKey());
}
