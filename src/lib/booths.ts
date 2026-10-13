export type BoothType = "symposium" | "premium" | "standard";
export interface BoothOption {
  id: number;
  eventId: number;
  name: string;
  type: BoothType;
}
export interface BoothMembership {
  id: number;
  userId: number;
  eventId: number;
  booth: BoothOption;
  mealCouponEligible: boolean | null;
  qualificationSequence: number | null;
  firstTicketConfirmedAt: string | null;
}
export function isBoothOption(x: unknown): x is BoothOption {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    Number.isSafeInteger(r.id) &&
    Number(r.id) > 0 &&
    Number.isSafeInteger(r.eventId) &&
    Number(r.eventId) > 0 &&
    typeof r.name === "string" &&
    ["symposium", "premium", "standard"].includes(String(r.type))
  );
}
export async function loadBooths(
  api: string,
  eventCode: string,
  signal?: AbortSignal,
): Promise<BoothOption[]> {
  if (!eventCode.trim()) throw new Error("Event code is required");
  const items = new Map<number, BoothOption>();
  let pages = 1;
  for (let page = 1; page <= pages; page++) {
    const res = await fetch(
      `${api.replace(/\/$/, "")}/api/public/events/${encodeURIComponent(eventCode)}/booths?page=${page}&limit=100`,
      { signal, cache: "no-store" },
    );
    if (!res.ok) throw new Error("Unable to load Booths");
    const body = await res.json();
    if (
      body.success !== true ||
      !Array.isArray(body.booths) ||
      !body.booths.every(isBoothOption) ||
      !Number.isSafeInteger(body.pagination?.totalPages) ||
      body.pagination.totalPages < 0
    )
      throw new Error("Invalid Booth response");
    pages = body.pagination.totalPages;
    for (const row of body.booths as BoothOption[]) items.set(row.id, row);
  }
  return [...items.values()];
}
export async function loadOwnBoothMembership(
  api: string,
  eventCode: string,
  token: string,
  signal?: AbortSignal,
): Promise<BoothMembership | null> {
  const res = await fetch(
    `${api.replace(/\/$/, "")}/api/users/me/booth-membership?${new URLSearchParams({ eventCode })}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal,
      cache: "no-store",
    },
  );
  if (!res.ok)
    throw new Error("Unable to load eligibility", { cause: res.status });
  const body = await res.json();
  const m = body.membership;
  if (body.success !== true || m === undefined)
    throw new Error("Invalid membership response");
  if (m === null) return null;
  if (
    !isBoothOption(m.booth) ||
    !Number.isSafeInteger(m.userId) ||
    m.eventId !== m.booth.eventId ||
    (m.mealCouponEligible !== null && typeof m.mealCouponEligible !== "boolean")
  )
    throw new Error("Invalid membership response");
  return m;
}
