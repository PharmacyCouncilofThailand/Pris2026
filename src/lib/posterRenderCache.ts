export function createRenderCache(limit: number, revoke: (url: string) => void) {
  const entries = new Map<string, string>();

  return {
    get(key: string): string | undefined {
      const url = entries.get(key);
      if (url === undefined) return undefined;
      entries.delete(key);
      entries.set(key, url);
      return url;
    },
    set(key: string, url: string): void {
      const previous = entries.get(key);
      if (previous !== undefined) {
        entries.delete(key);
        if (previous !== url) revoke(previous);
      }
      entries.set(key, url);
      while (entries.size > limit) {
        const oldest = entries.keys().next().value as string;
        const oldUrl = entries.get(oldest) as string;
        entries.delete(oldest);
        revoke(oldUrl);
      }
    },
  };
}
