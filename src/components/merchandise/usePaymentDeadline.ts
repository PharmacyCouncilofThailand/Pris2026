"use client";
import { useEffect, useState } from "react";
import type { PaymentView } from "@/types/merchandise";
import { anchorFrom, deadlineRemainingMs } from "@/lib/merchandisePayment";

/**
 * Milliseconds left on the active QR, measured against the server clock of the
 * latest PaymentView (anchored to performance.now() on receipt), never the
 * device clock. Null when there is no active QR deadline.
 */
export function usePaymentDeadline(payment: PaymentView): number | null {
  const expiresAt =
    payment.state === "qr_active" ? (payment.attempt?.expiresAt ?? null) : null;
  const [clock, setClock] = useState<{
    payment: PaymentView;
    remaining: number;
  } | null>(null);
  useEffect(() => {
    if (!expiresAt) return;
    let active = true;
    const anchor = anchorFrom(payment, performance.now());
    const tick = () => {
      if (active)
        setClock({
          payment,
          remaining: deadlineRemainingMs(expiresAt, anchor, performance.now()),
        });
    };
    void Promise.resolve().then(tick);
    const timer = setInterval(tick, 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [payment, expiresAt]);
  if (!expiresAt) return null;
  return clock?.payment === payment
    ? clock.remaining
    : Math.max(0, Date.parse(expiresAt) - Date.parse(payment.serverNow));
}
