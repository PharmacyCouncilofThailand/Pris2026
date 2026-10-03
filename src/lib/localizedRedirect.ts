const SUPPORTED_LOCALE_PREFIX = /^\/(?:en|th)(?=\/|\?|#|$)/;
const REWARD_PROOF_PATH = /^\/lucky-wheel\/rewards\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENT_RETURN_PATHS = new Set(["/ticket", "/lucky-wheel", "/lucky-wheel/claim", "/lucky-wheel/history"]);

export function normalizeLocalizedRedirectPath(value: string | null | undefined): string {
  const redirect = value?.trim();

  if (
    !redirect ||
    !redirect.startsWith("/") ||
    redirect.startsWith("//") ||
    redirect.includes("\\")
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

  return withoutLocale;
}

export function eventReturnQuery(
  search: string,
): { redirect: string } | undefined {
  const raw = new URLSearchParams(search).get("redirect");
  if (!raw || raw.includes("\\")) return undefined;

  const redirect = normalizeLocalizedRedirectPath(raw);
  if (EVENT_RETURN_PATHS.has(redirect) || REWARD_PROOF_PATH.test(redirect)) {
    return { redirect };
  }
  return undefined;
}
