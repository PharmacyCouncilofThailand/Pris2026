import type { PaymentView } from "../types/merchandise";
export interface DeadlineAnchor {
  serverEpochMs: number;
  receivedMonotonicMs: number;
}
export function deadlineRemainingMs(
  expiresAt: string,
  anchor: DeadlineAnchor,
  monotonicNowMs: number,
): number {
  const deadline = Date.parse(expiresAt);
  if (
    ![
      deadline,
      anchor.serverEpochMs,
      anchor.receivedMonotonicMs,
      monotonicNowMs,
    ].every(Number.isFinite)
  )
    throw new Error("เวลาหมดอายุยังไม่ยืนยัน");
  return Math.max(
    0,
    deadline -
      anchor.serverEpochMs -
      Math.max(0, monotonicNowMs - anchor.receivedMonotonicMs),
  );
}
export function formatPaymentRemaining(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) throw new Error("Invalid remaining time");
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export function mayRequestQr(payment: PaymentView): boolean {
  return (
    payment.canRequestNewQr &&
    ["not_created", "qr_expired_open"].includes(payment.state)
  );
}
// R11 reads persisted DB state; this is not a provider Inquiry interval. It matches
// the 15-second status journey spacing exercised by the upstream A21 load test.
export const MERCHANDISE_ORDER_REFRESH_MS = 15_000;
