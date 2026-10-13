export const memStore = new Map<string, string>();

export const mockStorage = {
  getItem: (key: string) => memStore.get(key) ?? null,
  setItem: (key: string, value: string) => { memStore.set(key, String(value)); },
  removeItem: (key: string) => { memStore.delete(key); },
  clear: () => { memStore.clear(); },
  key: (index: number) => Array.from(memStore.keys())[index] ?? null,
  get length() { return memStore.size; },
};

Object.defineProperty(globalThis, "localStorage", {
  value: mockStorage,
  configurable: true,
  writable: true,
});
