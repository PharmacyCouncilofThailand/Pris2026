import { eventReturnQuery } from "./localizedRedirect";

export interface EntryTicket {
  registrationId: number;
  eventId: number;
  regCode: string;
  ticketName: string;
  eventName: string | null;
  eventStartDate: string | null;
  eventEndDate: string | null;
  eventLocation: string | null;
  details: string[];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function ticketReturnQuery(search: string): { redirect: "/ticket" } | undefined {
  return eventReturnQuery(search)?.redirect === "/ticket"
    ? { redirect: "/ticket" }
    : undefined;
}

export async function loadEntryTickets(
  apiOrigin: string, token: string, eventCode: string, signal?: AbortSignal,
): Promise<EntryTicket[]> {
  const response = await fetch(apiOrigin.replace(/\/$/, "") + "/api/payments/my-tickets", {
    headers: { Accept: "application/json", Authorization: "Bearer " + token },
    cache: "no-store", signal,
  });
  if (!response.ok) throw new Error("Ticket request failed", { cause: response.status });
  const body: unknown = await response.json();
  if (!record(body) || body.success !== true || !Array.isArray(body.data)) {
    throw new Error("Invalid ticket response");
  }
  return body.data.filter((row) => record(row) && row.eventCode === eventCode && row.status === "confirmed")
    .map((value) => {
      const row = value as Record<string, unknown>;
      if (typeof row.registrationId !== "number" || !Number.isInteger(row.registrationId)
        || row.registrationId < 1 || typeof row.eventId !== "number" || !Number.isInteger(row.eventId)
        || row.eventId < 1 || typeof row.regCode !== "string" || !row.regCode.trim()
        || typeof row.ticketName !== "string" || !row.ticketName.trim()) {
        throw new Error("Invalid confirmed registration");
      }
      const labels: unknown[] = Array.isArray(row.includes) ? [...row.includes] : [];
      for (const key of ["workshops", "adminGrantedSessions"]) {
        const sessions = row[key];
        if (Array.isArray(sessions)) for (const session of sessions) {
          if (record(session)) labels.push(session.sessionName || session.name);
        }
      }
      if (record(row.galaTicket)) labels.push(row.galaTicket.name);
      return {
        registrationId: row.registrationId, eventId: row.eventId, regCode: row.regCode, ticketName: row.ticketName,
        eventName: typeof row.eventName === "string" ? row.eventName : null,
        eventStartDate: typeof row.eventStartDate === "string" ? row.eventStartDate : null,
        eventEndDate: typeof row.eventEndDate === "string" ? row.eventEndDate : null,
        eventLocation: typeof row.eventLocation === "string" ? row.eventLocation : null,
        details: [...new Set(labels.filter((label): label is string => typeof label === "string" && !!label.trim()))],
      };
    });
}
