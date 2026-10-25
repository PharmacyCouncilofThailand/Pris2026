export function createRenderCache<T>(limit: number) {
  const entries = new Map<string, T>();

  return {
    get(key: string): T | undefined {
      if (!entries.has(key)) return undefined;
      const value = entries.get(key) as T;
      entries.delete(key);
      entries.set(key, value);
      return value;
    },
    set(key: string, value: T): void {
      entries.delete(key);
      entries.set(key, value);
      while (entries.size > limit) {
        entries.delete(entries.keys().next().value as string);
      }
    },
  };
}
