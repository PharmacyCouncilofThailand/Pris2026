"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MerchandiseApiError } from "@/lib/merchandiseApi";
import { errorAction } from "@/lib/merchandiseErrors";
import { CHECK_COOLDOWN_MS, ORDER_POLL_MS } from "@/lib/merchandisePayment";
import type {
  OrderDetail,
  PaymentResult,
  PaymentView,
} from "@/types/merchandise";
import { useMerchandise } from "./MerchandiseProvider";
import { usePaymentDeadline } from "./usePaymentDeadline";

export type PaymentBusy = "creating" | "checking" | null;
const RATE_LIMIT_LOCK_MS = 10_000;
const hidden = () => document.hidden || document.visibilityState === "hidden";
const needsLogin = (error: unknown) =>
  error instanceof MerchandiseApiError && errorAction(error) === "login";

/**
 * Keeps one order's payment current: polls the order while a QR is live or
 * being verified, checks payment on return to the tab and on local expiry, and
 * turns payment API failures into a PaymentView or a notice (spec 7.3, 7.4, 9).
 */
export function usePaymentPolling(
  orderId: string,
  initial: OrderDetail,
  receivedAt?: { monotonicMs: number; wallMs: number },
) {
  const { api, token } = useMerchandise();
  const [order, setOrder] = useState(initial);
  const [busy, setBusy] = useState<PaymentBusy>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const latest = useRef(order);
  const lockedRef = useRef(false);
  const inflight = useRef(false);
  const seq = useRef(0);
  const lastCheck = useRef(-Infinity);
  const expiredKey = useRef<string | null>(null);
  const controllers = useRef(new Set<AbortController>());
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    latest.current = order;
  });
  useEffect(() => {
    const live = controllers.current;
    return () => {
      for (const controller of live) controller.abort();
      live.clear();
      if (lockTimer.current) clearTimeout(lockTimer.current);
    };
  }, []);

  const patchPayment = useCallback(
    (change: (view: PaymentView) => PaymentView) =>
      setOrder((previous) => ({
        ...previous,
        payment: change(previous.payment),
      })),
    [],
  );
  const refresh = useCallback(async () => {
    if (!token) return;
    const controller = new AbortController();
    controllers.current.add(controller);
    try {
      const next = await api.order(token, orderId, controller.signal);
      if (!controller.signal.aborted) setOrder(next);
    } catch (error) {
      if (!controller.signal.aborted && needsLogin(error))
        setUnauthorized(true);
    } finally {
      controllers.current.delete(controller);
    }
  }, [api, token, orderId]);

  const fail = useCallback(
    async (error: unknown) => {
      if (!(error instanceof MerchandiseApiError)) {
        setNotice("ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง");
        return;
      }
      switch (errorAction(error)) {
        case "login":
          setUnauthorized(true);
          return;
        case "verifying": {
          const seconds = Number(error.body.details?.retryAfterSeconds);
          patchPayment((view) => ({
            ...view,
            state: "verifying",
            canCheck: false,
            canRequestNewQr: false,
            retryAfterSeconds:
              Number.isFinite(seconds) && seconds >= 0
                ? seconds
                : CHECK_COOLDOWN_MS / 1000,
          }));
          return;
        }
        case "store_closed":
          patchPayment((view) => ({
            ...view,
            state: "qr_expired_closed",
            canCheck: false,
            canRequestNewQr: false,
            retryAfterSeconds: null,
          }));
          return;
        case "check_failed":
          patchPayment((view) => ({
            ...view,
            state: "check_failed",
            canCheck: true,
            canRequestNewQr: false,
            retryAfterSeconds: null,
          }));
          return;
        case "payment_unavailable":
          setNotice("ระบบชำระเงินยังไม่พร้อม กรุณาลองใหม่ภายหลัง");
          return;
        case "rate_limited":
          setNotice("ทำรายการถี่เกินไป กรุณารอสักครู่");
          lockedRef.current = true;
          setLocked(true);
          if (lockTimer.current) clearTimeout(lockTimer.current);
          lockTimer.current = setTimeout(() => {
            lockedRef.current = false;
            setLocked(false);
          }, RATE_LIMIT_LOCK_MS);
          return;
        default:
          setNotice(error.message);
          // Unknown outcome: read the order again, never guess paid/unpaid.
          if (error.uncertain || error.status === 0) await refresh();
      }
    },
    [patchPayment, refresh],
  );

  const act = useCallback(
    async (
      kind: Exclude<PaymentBusy, null>,
      call: (
        token: string,
        orderId: string,
        signal?: AbortSignal,
      ) => Promise<PaymentResult>,
    ) => {
      if (!token || inflight.current || lockedRef.current) return;
      inflight.current = true;
      seq.current++;
      lastCheck.current = performance.now();
      setBusy(kind);
      setNotice(null);
      const controller = new AbortController();
      controllers.current.add(controller);
      try {
        const { payment } = await call(token, orderId, controller.signal);
        if (controller.signal.aborted) return;
        patchPayment(() => payment);
        // The paid order record (paidAt, shipping) comes from the order itself.
        if (payment.state === "paid") await refresh();
      } catch (error) {
        if (!controller.signal.aborted) await fail(error);
      } finally {
        controllers.current.delete(controller);
        inflight.current = false;
        seq.current++;
        if (!controller.signal.aborted) setBusy(null);
      }
    },
    [token, orderId, patchPayment, refresh, fail],
  );
  const check = useCallback(
    () => act("checking", api.checkPayment),
    [act, api],
  );
  const requestQr = useCallback(
    () => act("creating", api.requestQr),
    [act, api],
  );
  useEffect(() => {
    checkRef.current = check;
  }, [check]);

  // Local deadline: hide the QR at once, then ask the server exactly once.
  const remainingMs = usePaymentDeadline(
    order.payment,
    order.payment === initial.payment ? receivedAt : undefined,
  );
  const expiredLocally =
    order.payment.state === "qr_active" && remainingMs === 0;
  const attempt = order.payment.attempt;
  useEffect(() => {
    if (!expiredLocally || !attempt) return;
    const key = `${attempt.id}|${attempt.expiresAt}`;
    if (expiredKey.current === key) return;
    expiredKey.current = key;
    void checkRef.current();
  }, [expiredLocally, attempt]);

  // GET the order every 10s while a QR is live or being verified.
  const state = order.payment.state;
  const polling = state === "qr_active" || state === "verifying";
  useEffect(() => {
    if (!token || !polling) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const mine = new Set<AbortController>();
    const poll = async () => {
      if (inflight.current) return;
      const at = seq.current;
      const controller = new AbortController();
      mine.add(controller);
      try {
        const next = await api.order(token, orderId, controller.signal);
        if (!controller.signal.aborted && at === seq.current) setOrder(next);
      } catch (error) {
        if (!controller.signal.aborted && needsLogin(error))
          setUnauthorized(true);
      } finally {
        mine.delete(controller);
      }
    };
    const start = () => {
      if (!timer) timer = setInterval(() => void poll(), ORDER_POLL_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => (hidden() ? stop() : start());
    if (!hidden()) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
      for (const controller of mine) controller.abort();
    };
  }, [api, token, orderId, polling]);

  // Back from the bank app: check, at most once per cooldown.
  useEffect(() => {
    const onVisibility = () => {
      if (hidden()) return;
      const current = latest.current.payment.state;
      if (
        current !== "qr_active" &&
        current !== "verifying" &&
        current !== "check_failed"
      )
        return;
      if (performance.now() - lastCheck.current < CHECK_COOLDOWN_MS) return;
      void checkRef.current();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // A verifying view tells us when to ask again.
  const view = order.payment;
  useEffect(() => {
    if (view.state !== "verifying" || view.retryAfterSeconds === null) return;
    const delay = Math.max(1, view.retryAfterSeconds) * 1000;
    const timer = setTimeout(() => void checkRef.current(), delay);
    return () => clearTimeout(timer);
  }, [view]);

  return {
    order,
    busy,
    expiredLocally,
    remainingMs,
    requestQr,
    check,
    notice,
    locked,
    unauthorized,
  };
}
