// this TS class stores key-value pairs in browser local storage.
class ConfigStore {
  // create an in-memory store for the current session
  private readonly store: Record<string, any> = {};

  constructor(private readonly namespace: string) {}

  set(key: string, value: any): void {
    localStorage.setItem(`${this.namespace}.${key}`, JSON.stringify(value));
    this.store[key] = value;
  }

  get(key: string): any {
    let value = this.store[key];
    if (value !== undefined) {
      return value;
    }
    const strValue = localStorage.getItem(`${this.namespace}.${key}`);
    if (strValue !== null) {
      value = JSON.parse(strValue);
      this.store.set(key, value);
      return value;
    }
    return null;
  }

  remove(key: string): void {
    this.store.delete(key);
    localStorage.removeItem(`${this.namespace}.${key}`);
  }
}
export default ConfigStore;
