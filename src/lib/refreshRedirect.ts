import { eventReturnQuery } from "./localizedRedirect";
import { isMerchandisePath, merchandiseReturnPath } from "./merchandiseRoutes";

export function shouldRedirectReload(pathname: string, search = ""): boolean {
  if (isMerchandisePath(pathname))
    return merchandiseReturnPath(pathname + search) === null;
  if (
    pathname.replace(/^\/(th|en)(?=\/|$)/, "") === "/auth/sso" &&
    merchandiseReturnPath(eventReturnQuery(search)?.redirect)
  )
    return false;
  const normalized =
    pathname.replace(/^\/(th|en)(?=\/|$)/, "").replace(/\/$/, "") || "/";
  const directReturn = eventReturnQuery(
    `?redirect=${encodeURIComponent(normalized + (normalized === "/presentation-submission" ? search : ""))}`,
  );
  if (
    normalized === "/" ||
    normalized === "/sessions/confirm" ||
    normalized === "/presentation-templates" ||
    normalized === "/poster-kiosk" ||
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
