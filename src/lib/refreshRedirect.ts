import { eventReturnQuery } from "./localizedRedirect";

export function shouldRedirectReload(pathname: string, search = ""): boolean {
  const normalized =
    pathname.replace(/^\/(th|en)(?=\/|$)/, "").replace(/\/$/, "") || "/";
  const directReturn = eventReturnQuery(
    `?redirect=${encodeURIComponent(normalized + (normalized === "/presentation-submission" ? search : ""))}`,
  );
  if (
    normalized === "/" ||
    normalized === "/sessions/confirm" ||
    directReturn
  ) {
    return false;
  }
  const authJourney =
    normalized === "/login" ||
    normalized === "/signup" ||
    normalized.startsWith("/signup/");
  return !(authJourney && eventReturnQuery(search));
}
