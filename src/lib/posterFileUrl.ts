const PATH = /^\/events\/\d+\/presentations\/\d+\/[0-9a-f-]+\.pdf$/;
const DOWNLOAD_PATH = /^\/events\/\d+\/presentations\/\d+\/[0-9a-f-]+\.(pdf|png)$/;
const ENCODED_TRICK = /%2e|%2f|\\/i;

/**
 * True only for public R2 poster PDF urls the same-origin proxy may fetch.
 * With `pinnedHost` set, only that exact hostname is accepted; otherwise any *.r2.dev.
 */
export function isAllowedPosterFileUrl(url: string, pinnedHost?: string): boolean {
  return matches(url, PATH, pinnedHost);
}

/** Same rules as isAllowedPosterFileUrl, but also accepts PNG posters (download route only). */
export function isAllowedPosterDownloadUrl(url: string, pinnedHost?: string): boolean {
  return matches(url, DOWNLOAD_PATH, pinnedHost);
}

function matches(url: string, path: RegExp, pinnedHost?: string): boolean {
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
  return path.test(parsed.pathname);
}
