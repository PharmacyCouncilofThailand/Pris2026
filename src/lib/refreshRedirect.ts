import { ticketReturnQuery } from "./entryTicket";

export function shouldRedirectReload(pathname: string, search = ""): boolean {
  const normalized = pathname.replace(/^\/(th|en)(?=\/|$)/, "").replace(/\/$/, "") || "/";
  if (["/", "/sessions/confirm", "/ticket"].includes(normalized)) return false;
  const authJourney = normalized === "/login" || normalized === "/signup" || normalized.startsWith("/signup/");
  return !(authJourney && ticketReturnQuery(search));
}
