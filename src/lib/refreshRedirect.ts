export function shouldRedirectReload(pathname: string): boolean {
  const normalized = pathname
    .replace(/^\/(th|en)(?=\/|$)/, "")
    .replace(/\/$/, "") || "/";
  return normalized !== "/" && normalized !== "/sessions/confirm";
}
