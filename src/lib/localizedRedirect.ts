const SUPPORTED_LOCALE_PREFIX = /^\/(?:en|th)(?=\/|\?|#|$)/;
const REWARD_PROOF_PATH = /^\/lucky-wheel\/rewards\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENT_RETURN_PATHS = new Set(["/ticket", "/lucky-wheel", "/lucky-wheel/claim", "/lucky-wheel/history"]);

export function normalizeLocalizedRedirectPath(value: string | null | undefined): string {
  const redirect = value?.trim();

  if (
    !redirect ||
    !redirect.startsWith("/") ||
    redirect.startsWith("//") ||
    redirect.includes("\\") ||
    /[\t\r\n]/.test(redirect)
  ) {
    return "/";
  }

  const withoutLocale = redirect.replace(SUPPORTED_LOCALE_PREFIX, "");

  if (!withoutLocale) {
    return "/";
  }

  if (withoutLocale.startsWith("?") || withoutLocale.startsWith("#")) {
    return `/${withoutLocale}`;
  }

  if (withoutLocale.startsWith("//")) {
    return "/";
  }

  const destination = new URL(withoutLocale, "https://internal.invalid");
  if (destination.origin !== "https://internal.invalid") return "/";
  const resolvedPath = destination.pathname.replace(/\/+$/, "");
  if (resolvedPath === "/poster-submission") {
    if (withoutLocale.split(/[?#]/)[0] !== "/poster-submission") return "/";
    return withoutLocale.includes("#") ? "/" : posterReturnPath(withoutLocale.slice("/poster-submission".length)) || "/";
  }

  return withoutLocale;
}

export function eventReturnQuery(
  search: string,
): { redirect: string } | undefined {
  const raw = new URLSearchParams(search).get("redirect");
  if (!raw || raw.includes("\\")) return undefined;

  const redirect = normalizeLocalizedRedirectPath(raw);
  if (redirect.split("?")[0] === "/poster-submission" && !redirect.includes("#")) {
    const path = posterReturnPath(redirect.slice("/poster-submission".length));
    return path ? { redirect: path } : undefined;
  }
  if (EVENT_RETURN_PATHS.has(redirect) || REWARD_PROOF_PATH.test(redirect)) {
    return { redirect };
  }
  return undefined;
}

export function posterReturnPath(search: string): string | null {
  const query = new URLSearchParams(search);
  if ([...query.keys()].some((key) => key !== "abstractId" && key !== "requestId")) return null;
  const abstractId = query.get("abstractId");
  const requestId = query.get("requestId");
  if (
    query.getAll("abstractId").length !== 1 || !abstractId || !/^\d+$/.test(abstractId) ||
    !Number.isSafeInteger(Number(abstractId)) || Number(abstractId) < 1
  ) return null;
  if (
    query.getAll("requestId").length > 1 ||
    (requestId !== null && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))
  ) return null;
  const normalized = new URLSearchParams({ abstractId: String(Number(abstractId)) });
  if (requestId) normalized.set("requestId", requestId);
  return `/poster-submission?${normalized}`;
}
