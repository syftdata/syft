// import Cookies = require("js-cookie");

import { isBrowser } from './utils';

interface IConfigStore {
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown | undefined;
  remove: (key: string) => void;
}

class UniversalConfigStore implements IConfigStore {
  // create an in-memory store for the current session
  private readonly inMemory: Record<string, unknown> = {};

  constructor(private readonly stores: IConfigStore[]) {
    if (stores.length === 0) {
      if (isBrowser()) {
        this.stores = [
          // new CookieConfigStore("syft"),
          new StorageConfigStore('syft')
        ];
      }
    }
  }

  set(key: string, value: unknown): void {
    this.inMemory[key] = value;
    for (const store of this.stores) {
      store.set(key, value);
    }
  }

  get(key: string): unknown | undefined {
    let value = this.inMemory[key];
    if (value !== undefined) {
      return value;
    }
    for (const store of this.stores) {
      value = store.get(key);
      if (value !== undefined) {
        this.inMemory[key] = value;
        return value;
      }
    }
    return undefined;
  }

  remove(key: string): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.inMemory[key];
    for (const store of this.stores) {
      store.remove(key);
    }
  }
}

export class StorageConfigStore implements IConfigStore {
  constructor(private readonly namespace: string) {}

  set(key: string, value: unknown): void {
    localStorage.setItem(`${this.namespace}.${key}`, JSON.stringify(value));
  }

  get(key: string): unknown | undefined {
    const strValue = localStorage.getItem(`${this.namespace}.${key}`);
    if (strValue != null) {
      return JSON.parse(strValue);
    }
    return undefined;
  }

  remove(key: string): void {
    localStorage.removeItem(`${this.namespace}.${key}`);
  }
}

// export class CookieConfigStore implements IConfigStore {
//   constructor(private readonly namespace: string) {}

//   set(key: string, value: unknown): void {
//     Cookies.set(`${this.namespace}.${key}`, JSON.stringify(value));
//   }

//   get(key: string): unknown {
//     const strValue = Cookies.get(`${this.namespace}.${key}`);
//     if (strValue != null) {
//       return JSON.parse(strValue);
//     }
//   }

//   remove(key: string): void {
//     Cookies.remove(`${this.namespace}.${key}`);
//   }
// }

export default UniversalConfigStore;
