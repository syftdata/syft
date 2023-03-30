// this TS class stores key-value pairs in browser local storage.
class ConfigStore {
  // create an in-memory store for the current session
  private readonly store: Record<string, any> = {};

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
export default ConfigStore;
