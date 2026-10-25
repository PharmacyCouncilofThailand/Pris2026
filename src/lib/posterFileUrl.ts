const PATH = /^\/events\/\d+\/presentations\/\d+\/[0-9a-f-]+\.pdf$/;
const ENCODED_TRICK = /%2e|%2f|\\/i;

/** True only for public R2 poster PDF urls the same-origin proxy may fetch. */
export function isAllowedPosterFileUrl(url: string): boolean {
  if (ENCODED_TRICK.test(url)) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (!parsed.hostname.endsWith(".r2.dev")) return false;
  if (parsed.username || parsed.password || parsed.port) return false;
  if (parsed.search || parsed.hash) return false;
  return PATH.test(parsed.pathname);
}
