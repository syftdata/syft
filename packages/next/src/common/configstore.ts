import Cookies from 'js-cookie';
import { isBrowser } from './utils';

interface IConfigStore {
  set: (key: string, value: unknown) => void;
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
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string): unknown | undefined {
    const strValue = localStorage.getItem(key);
    if (strValue != null) {
      return JSON.parse(strValue);
    }
    return undefined;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}

export class CookieConfigStore implements IConfigStore {
  set(key: string, value: unknown): void {
    Cookies.set(key, JSON.stringify(value));
  }

  get(key: string): unknown {
    const strValue = Cookies.get(key);
    if (strValue != null) {
      return JSON.parse(strValue);
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
