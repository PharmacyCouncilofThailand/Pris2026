const SUPPORTED_LOCALE_PREFIX = /^\/(?:en|th)(?=\/|\?|#|$)/;

export function normalizeLocalizedRedirectPath(value: string | null | undefined): string {
  const redirect = value?.trim();

  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
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
