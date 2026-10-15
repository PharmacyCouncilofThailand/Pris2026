"use client";
import { useEffect, useMemo, useState } from "react";
import type { PaymentView } from "@/types/merchandise";
import { deadlineRemainingMs } from "@/lib/merchandisePayment";
export function usePaymentDeadline(payment: PaymentView) {
  const attemptId = payment.attempt?.id,
    expiresAt = payment.state === "paid" ? null : payment.attempt?.expiresAt,
    serverNow = payment.serverNow;
  const key = useMemo(
    () => (expiresAt && attemptId ? { attemptId, expiresAt, serverNow } : null),
    [attemptId, expiresAt, serverNow],
  );
  const [clock, setClock] = useState<{ key: object; remaining: number } | null>(
    null,
  );
  useEffect(() => {
    if (!key) return;
    const anchor = {
      serverEpochMs: Date.parse(key.serverNow),
      receivedMonotonicMs: performance.now(),
    };
    let active = true;
    const tick = () => {
      if (active)
        setClock({
          key,
          remaining: deadlineRemainingMs(
            key.expiresAt,
            anchor,
            performance.now(),
          ),
        });
    };
    void Promise.resolve().then(tick);
    const timer = setInterval(tick, 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [key]);
  return key
    ? clock?.key === key
      ? clock.remaining
      : Math.max(0, Date.parse(key.expiresAt) - Date.parse(key.serverNow))
    : null;
}
