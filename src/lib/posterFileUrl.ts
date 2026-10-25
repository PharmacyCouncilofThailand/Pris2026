const PATH = /^\/events\/\d+\/presentations\/\d+\/[0-9a-f-]+\.pdf$/;
const ENCODED_TRICK = /%2e|%2f|\\/i;

/**
 * True only for public R2 poster PDF urls the same-origin proxy may fetch.
 * With `pinnedHost` set, only that exact hostname is accepted; otherwise any *.r2.dev.
 */
export function isAllowedPosterFileUrl(url: string, pinnedHost?: string): boolean {
  if (ENCODED_TRICK.test(url)) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const hostOk = pinnedHost
    ? parsed.hostname === pinnedHost.toLowerCase()
    : parsed.hostname.endsWith(".r2.dev");
  if (!hostOk) return false;
  if (parsed.username || parsed.password || parsed.port) return false;
  if (parsed.search || parsed.hash) return false;
  return PATH.test(parsed.pathname);
}
