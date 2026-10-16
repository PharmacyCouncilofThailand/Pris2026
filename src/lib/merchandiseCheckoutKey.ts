import { merchandiseFailure } from "./merchandiseApi";
import type { RecipientDraft } from "./merchandiseRecipient";

const PREFIX = "pris_merchandise_checkout:";
const name = (eventCode: string, buyerId: number) =>
  `${PREFIX}${buyerId}:${eventCode}`;

export interface CheckoutState {
  key: string | null;
  draft: RecipientDraft | null;
}
const empty = (): CheckoutState => ({ key: null, draft: null });

export function readCheckout(
  storage: Storage,
  eventCode: string,
  buyerId: number,
): CheckoutState {
  try {
    const v: unknown = JSON.parse(
      storage.getItem(name(eventCode, buyerId)) ?? "null",
    );
    if (typeof v !== "object" || v === null || Array.isArray(v)) return empty();
    const o = v as Record<string, unknown>;
    return {
      key:
        typeof o.key === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(o.key)
          ? o.key
          : null,
      draft:
        typeof o.draft === "object" &&
        o.draft !== null &&
        !Array.isArray(o.draft)
          ? (o.draft as RecipientDraft)
          : null,
    };
  } catch {
    return empty();
  }
}

export function ensureCheckoutKey(
  storage: Storage,
  eventCode: string,
  buyerId: number,
): string {
  const current = readCheckout(storage, eventCode, buyerId);
  if (current.key) return current.key;
  const key = crypto.randomUUID();
  const raw = JSON.stringify({ ...current, key });
  try {
    storage.setItem(name(eventCode, buyerId), raw);
    if (storage.getItem(name(eventCode, buyerId)) !== raw) throw new Error();
  } catch {
    throw merchandiseFailure(0, "MERCH_STORAGE_UNAVAILABLE");
  }
  return key;
}

export function saveRecipientDraft(
  storage: Storage,
  eventCode: string,
  buyerId: number,
  draft: RecipientDraft,
): void {
  try {
    const current = readCheckout(storage, eventCode, buyerId);
    storage.setItem(
      name(eventCode, buyerId),
      JSON.stringify({ ...current, draft }),
    );
  } catch {
    /* the draft is a convenience; losing it must not block the form */
  }
}

export function clearCheckout(
  storage: Storage,
  eventCode: string,
  buyerId: number,
  options: { keepDraft?: boolean } = {},
): void {
  try {
    const { draft } = readCheckout(storage, eventCode, buyerId);
    if (options.keepDraft && draft)
      storage.setItem(
        name(eventCode, buyerId),
        JSON.stringify({ key: null, draft }),
      );
    else storage.removeItem(name(eventCode, buyerId));
  } catch {
    /* ignore */
  }
}

export function clearForeignCheckouts(storage: Storage, buyerId: number): void {
  try {
    const own = `${PREFIX}${buyerId}:`;
    const doomed: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k?.startsWith(PREFIX) && !k.startsWith(own)) doomed.push(k);
    }
    for (const k of doomed) storage.removeItem(k);
  } catch {
    /* ignore */
  }
}
