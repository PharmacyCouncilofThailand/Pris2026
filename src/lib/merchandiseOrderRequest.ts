import {
  MerchandiseApiError,
  merchandiseFailure,
  type MerchandiseApi,
} from "./merchandiseApi";
import { isMerchandiseId } from "./merchandiseRoutes";
import type { OrderRequestDto, PaymentView } from "../types/merchandise";
const PREFIX = "pris_merchandise_order_request:";
const ATTEMPT_PREFIX = "pris_merchandise_attempt_request:";
export interface OrderRequestRecord {
  key: string;
  eventCode: string;
}
const scopeKey = (eventCode: string, buyerId: number) => {
  if (
    !/^[A-Za-z0-9_-]{1,50}$/.test(eventCode) ||
    !Number.isSafeInteger(buyerId) ||
    buyerId <= 0
  )
    throw merchandiseFailure(422, "MERCH_INVALID_REQUEST_KEY");
  return `${PREFIX}${buyerId}:${eventCode}`;
};
// A denied/corrupt read is not evidence that no pending confirmation exists.
export function readOrderRequest(
  storage: Storage,
  eventCode: string,
  buyerId: number,
): OrderRequestRecord | null {
  const name = scopeKey(eventCode, buyerId);
  try {
    const raw = storage.getItem(name);
    if (raw === null) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw Error("invalid");
    const record = value as Record<string, unknown>;
    if (
      Object.keys(record).length !== 2 ||
      record.eventCode !== eventCode ||
      !isMerchandiseId(record.key)
    )
      throw Error("invalid");
    return { key: record.key, eventCode };
  } catch {
    throw merchandiseFailure(0, "MERCH_STORAGE_UNAVAILABLE", true);
  }
}
export function beginOrderRequest(
  storage: Storage,
  eventCode: string,
  buyerId: number,
  key: string,
): OrderRequestRecord {
  if (!isMerchandiseId(key))
    throw merchandiseFailure(422, "MERCH_INVALID_REQUEST_KEY");
  if (readOrderRequest(storage, eventCode, buyerId))
    throw merchandiseFailure(409, "MERCH_PENDING_REQUEST", true);
  const value = { key, eventCode };
  try {
    storage.setItem(scopeKey(eventCode, buyerId), JSON.stringify(value));
  } catch {
    throw merchandiseFailure(0, "MERCH_STORAGE_UNAVAILABLE", true);
  }
  return value;
}
export function acknowledgeOrderRequest(
  storage: Storage,
  eventCode: string,
  buyerId: number,
  expectedKey: string,
): void {
  if (readOrderRequest(storage, eventCode, buyerId)?.key !== expectedKey)
    return;
  try {
    storage.removeItem(scopeKey(eventCode, buyerId));
  } catch {
    throw merchandiseFailure(0, "MERCH_STORAGE_UNAVAILABLE", true);
  }
}
export function clearOtherOrderRequests(
  storage: Storage,
  buyerId: number | null,
): void {
  const remove: string[] = [];
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (
      key &&
      [PREFIX, ATTEMPT_PREFIX].some(
        (prefix) =>
          key.startsWith(prefix) &&
          (buyerId === null || !key.startsWith(`${prefix}${buyerId}:`)),
      )
    )
      remove.push(key);
  }
  for (const key of remove) storage.removeItem(key);
}
export interface AttemptRequestRecord {
  key: string;
  expectedOrderRevision: number;
  previousAttemptId?: string | null;
}
export function attemptResultKnown(
  record: AttemptRequestRecord,
  payment: PaymentView,
): boolean {
  if (payment.state === "paid") return true;
  return (
    record.previousAttemptId !== undefined &&
    !!payment.attempt &&
    payment.attempt.id !== record.previousAttemptId &&
    ([
      "qr_active",
      "qr_expired_open",
      "qr_expired_closed",
      "qr_expired_unavailable",
    ].includes(payment.state) ||
      payment.attempt.creationStatus === "failed")
  );
}
const attemptScopeKey = (
  eventCode: string,
  buyerId: number,
  orderId: string,
) => {
  if (!isMerchandiseId(orderId))
    throw merchandiseFailure(422, "MERCH_INVALID_ID");
  return (
    scopeKey(eventCode, buyerId).replace(PREFIX, ATTEMPT_PREFIX) + `:${orderId}`
  );
};
export function readAttemptRequest(
  storage: Storage,
  eventCode: string,
  buyerId: number,
  orderId: string,
): AttemptRequestRecord | null {
  const name = attemptScopeKey(eventCode, buyerId, orderId);
  try {
    const raw = storage.getItem(name);
    if (raw === null) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw Error("invalid");
    const record = value as Record<string, unknown>;
    if (
      Object.keys(record).some(
        (key) =>
          !["key", "expectedOrderRevision", "previousAttemptId"].includes(key),
      ) ||
      ("previousAttemptId" in record &&
        record.previousAttemptId !== null &&
        !isMerchandiseId(record.previousAttemptId)) ||
      !isMerchandiseId(record.key) ||
      typeof record.expectedOrderRevision !== "number" ||
      !Number.isSafeInteger(record.expectedOrderRevision) ||
      record.expectedOrderRevision < 0
    )
      throw Error("invalid");
    return {
      key: record.key,
      expectedOrderRevision: record.expectedOrderRevision,
      ...("previousAttemptId" in record
        ? { previousAttemptId: record.previousAttemptId as string | null }
        : {}),
    };
  } catch {
    throw merchandiseFailure(0, "MERCH_STORAGE_UNAVAILABLE", true);
  }
}
export function beginAttemptRequest(
  storage: Storage,
  eventCode: string,
  buyerId: number,
  orderId: string,
  revision: number,
  key: string,
  previousAttemptId: string | null = null,
): AttemptRequestRecord {
  const existing = readAttemptRequest(storage, eventCode, buyerId, orderId);
  if (existing) return existing;
  if (
    !isMerchandiseId(key) ||
    (previousAttemptId !== null && !isMerchandiseId(previousAttemptId)) ||
    !Number.isSafeInteger(revision) ||
    revision < 0
  )
    throw merchandiseFailure(422, "MERCH_INVALID_REQUEST_KEY");
  const value = { key, expectedOrderRevision: revision, previousAttemptId };
  try {
    storage.setItem(
      attemptScopeKey(eventCode, buyerId, orderId),
      JSON.stringify(value),
    );
  } catch {
    throw merchandiseFailure(0, "MERCH_STORAGE_UNAVAILABLE", true);
  }
  return value;
}
export function acknowledgeAttemptRequest(
  storage: Storage,
  eventCode: string,
  buyerId: number,
  orderId: string,
  expectedKey: string,
): void {
  if (
    readAttemptRequest(storage, eventCode, buyerId, orderId)?.key !==
    expectedKey
  )
    return;
  try {
    storage.removeItem(attemptScopeKey(eventCode, buyerId, orderId));
  } catch {
    throw merchandiseFailure(0, "MERCH_STORAGE_UNAVAILABLE", true);
  }
}
export type OrderRecovery =
  | { kind: "none" | "cancelled" | "processing" }
  | { kind: "completed"; orderId: string; key: string }
  | { kind: "failed"; message: string }
  | { kind: "unknown"; error?: MerchandiseApiError };
const inquiries = new WeakMap<
  Storage,
  Map<string, { token: string; promise: Promise<OrderRequestDto> }>
>();
export async function recoverOrderRequest({
  storage,
  eventCode,
  buyerId,
  token,
  api,
  isCurrent,
}: {
  storage: Storage;
  eventCode: string;
  buyerId: number;
  token: string;
  api: MerchandiseApi;
  isCurrent(): boolean;
}): Promise<OrderRecovery> {
  if (!isCurrent()) return { kind: "cancelled" };
  let record: OrderRequestRecord | null;
  try {
    record = readOrderRequest(storage, eventCode, buyerId);
  } catch (error) {
    return {
      kind: "unknown",
      error:
        error instanceof MerchandiseApiError ? error : merchandiseFailure(),
    };
  }
  if (!record) return { kind: "none" };
  const map = inquiries.get(storage) ?? new Map();
  inquiries.set(storage, map);
  const name = `${scopeKey(eventCode, buyerId)}:${record.key}`,
    existing = map.get(name);
  let promise: Promise<OrderRequestDto>;
  if (existing?.token === token) promise = existing.promise;
  else {
    promise = api.orderRequest(eventCode, token, record.key).finally(() => {
      if (map.get(name)?.promise === promise) map.delete(name);
    });
    map.set(name, { token, promise });
  }
  try {
    const value = await promise;
    if (
      !isCurrent() ||
      readOrderRequest(storage, eventCode, buyerId)?.key !== record.key
    )
      return { kind: "cancelled" };
    if (value.state === "completed" && value.orderId)
      return { kind: "completed", orderId: value.orderId, key: record.key };
    if (value.state === "failed") {
      acknowledgeOrderRequest(storage, eventCode, buyerId, record.key);
      return {
        kind: "failed",
        message: merchandiseFailure(
          409,
          value.error?.code ?? "MERCH_QUOTE_CHANGED",
        ).message,
      };
    }
    return { kind: value.state === "processing" ? "processing" : "unknown" };
  } catch (error) {
    if (!isCurrent()) return { kind: "cancelled" };
    return {
      kind: "unknown",
      error:
        error instanceof MerchandiseApiError ? error : merchandiseFailure(),
    };
  }
}
