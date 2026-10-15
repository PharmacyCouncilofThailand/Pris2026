"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMerchandise } from "./MerchandiseProvider";
import type { PaymentView } from "@/types/merchandise";
export function useOwnerQr(orderId: string, payment: PaymentView) {
  const { api, token } = useMerchandise();
  const attempt = payment.attempt;
  const attemptId = attempt?.id ?? null,
    expiresAt = attempt?.expiresAt ?? null;
  const valid =
    payment.state === "qr_active" &&
    attempt?.qrAvailable === true &&
    attempt.expiresAt !== null &&
    Date.parse(attempt.expiresAt) > Date.parse(payment.serverNow);
  const scope = useMemo(
    () =>
      token && valid && attemptId && expiresAt
        ? {
            token,
            orderId,
            attemptId,
            expiresAt,
          }
        : null,
    [token, valid, orderId, attemptId, expiresAt],
  );
  const [retry, setRetry] = useState(0);
  const key = useMemo(() => (scope ? { scope, retry } : null), [scope, retry]);
  const [result, setResult] = useState<{
    key: object;
    url: string | null;
    error: boolean;
  } | null>(null);
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    let active = true,
      url: string | null = null;
    void api
      .qr(
        key.scope.orderId,
        key.scope.attemptId,
        key.scope.token,
        controller.signal,
      )
      .then(
        (blob) => {
          if (!active || controller.signal.aborted) return;
          url = URL.createObjectURL(blob);
          setResult({ key, url, error: false });
        },
        () => {
          if (active && !controller.signal.aborted)
            setResult({ key, url: null, error: true });
        },
      );
    return () => {
      active = false;
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [key, api]);
  const reload = useCallback(() => setRetry((value) => value + 1), []);
  return {
    url: key && result?.key === key ? result.url : null,
    error: key && result?.key === key ? result.error : false,
    loading: Boolean(key && result?.key !== key),
    reload,
  };
}
