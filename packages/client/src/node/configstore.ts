import { type IConfigStore } from '../types';

// this TS class stores key-value pairs in browser local storage.
class UniversalConfigStore implements IConfigStore {
  // create an in-memory store for the current session
  private readonly store: Record<string, any> = {};

  constructor(private readonly stores: IConfigStore[]) {}

  set(key: string, value: any): void {
    this.store[key] = value;
  }

  get(key: string): any {
    const value = this.store[key];
    if (value !== undefined) {
      return value;
    }
    return null;
  }

  remove(key: string): void {
    this.store.delete(key);
  }
}
export default UniversalConfigStore;
