import Cookies from 'js-cookie';
import { isBrowser, safeJSONParse, safeJSONStringify } from './utils';

export interface IConfigStore {
  set: (key: string, value: unknown) => void;
  /**
   *
   * @param key
   * @param value
   * @param expirationTime number of days before the data expires.
   * @returns
   */
  setWithExpiration?: (
    key: string,
    value: unknown,
    expirationTime: number
  ) => void;
  get: (key: string) => unknown | undefined;
  remove: (key: string) => void;
}

class UniversalConfigStore implements IConfigStore {
  constructor(
    readonly namespace: string,
    private readonly stores: IConfigStore[]
  ) {
    if (stores.length === 0) {
      if (isBrowser()) {
        this.stores = [
          new InMemoryConfigStore(),
          new CookieConfigStore(),
          new StorageConfigStore()
        ];
      } else {
        this.stores = [new InMemoryConfigStore()];
      }
    }
  }

  set(key: string, value: unknown): void {
    const namespaceKey = `${this.namespace}.${key}`;
    for (const store of this.stores) {
      store.set(namespaceKey, value);
    }
  }

  setWithExpiration(key: string, value: unknown, expirationTime: number): void {
    const namespaceKey = `${this.namespace}.${key}`;
    for (const store of this.stores) {
      if (store.setWithExpiration != null)
        store.setWithExpiration(namespaceKey, value, expirationTime);
    }
  }

  get(key: string): unknown | undefined {
    const namespaceKey = `${this.namespace}.${key}`;
    const missedStores: IConfigStore[] = [];
    for (const store of this.stores) {
      const value = store.get(namespaceKey);
      if (value !== undefined) {
        // populate this value in all stores.
        for (const missedStore of missedStores) {
          missedStore.set(namespaceKey, value);
        }
        return value;
      } else {
        missedStores.push(store);
      }
    }
    return undefined;
  }

  remove(key: string): void {
    const namespaceKey = `${this.namespace}.${key}`;
    for (const store of this.stores) {
      store.remove(namespaceKey);
    }
  }
}

export class StorageConfigStore implements IConfigStore {
  set(key: string, value: unknown): void {
    const strVal = safeJSONStringify(value);
    if (strVal) localStorage.setItem(key, JSON.stringify(value));
  }

  setWithExpiration(key: string, value: unknown, expirationTime: number): void {
    const _syftExpiration = Date.now() + expirationTime * 24 * 60 * 60 * 1000;
    const valueWithExpiration = {
      value,
      _syftExpiration
    };
    this.set(key, valueWithExpiration);
  }

  get(key: string): unknown | undefined {
    const strValue = localStorage.getItem(key);
    if (strValue != null) {
      const value = safeJSONParse(strValue) as any;
      if (value === undefined) return;
      if (value._syftExpiration != null) {
        if (Date.now() > value._syftExpiration) {
          localStorage.removeItem(key);
          return undefined;
        }
        return value.value as unknown;
      }
      return value as unknown;
    }
    return;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}

export class CookieConfigStore implements IConfigStore {
  set(key: string, value: unknown): void {
    const strVal = safeJSONStringify(value);
    if (strVal) Cookies.set(key, strVal);
  }

  // TODO: put a timestamp in the value and check it before returning.
  setWithExpiration(key: string, value: unknown, expirationTime: number): void {
    const strVal = safeJSONStringify(value);
    if (strVal)
      Cookies.set(key, strVal, {
        expires: expirationTime
      });
  }

  get(key: string): unknown {
    const strValue = Cookies.get(key);
    if (strValue != null) {
      return safeJSONParse(strValue);
    }
  }

  remove(key: string): void {
    Cookies.remove(key);
  }
}

export class InMemoryConfigStore implements IConfigStore {
  // create an in-memory store for the current session
  private readonly inMemory = new Map<string, unknown>();

  set(key: string, value: unknown): void {
    this.inMemory.set(key, value);
  }

  get(key: string): unknown {
    return this.inMemory.get(key);
  }

  remove(key: string): void {
    this.inMemory.delete(key);
  }
}

export const globalStore = new UniversalConfigStore('syft', []);
export default UniversalConfigStore;
