"use client";
import { useCallback, useMemo } from "react";
import { merchandiseFailure } from "@/lib/merchandiseApi";
import type { OrderDetail } from "@/types/merchandise";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseResource } from "./useMerchandiseResource";
export function useMerchandiseOrder(orderId: string, enabled = true) {
  const { api, token, ownerIdentity } = useMerchandise();
  const scope = useMemo(
    () => (token && enabled ? { ownerIdentity, token, orderId } : null),
    [token, enabled, ownerIdentity, orderId],
  );
  const load = useCallback(
    (signal: AbortSignal) => {
      if (!token) throw merchandiseFailure(401, "MERCH_AUTH_REQUIRED");
      return api.order(token, orderId, signal);
    },
    [api, token, orderId],
  );
  return useMerchandiseResource(scope, load);
}

// A just-created order handed from checkout to the order page so it need not
// reload immediately. Read once, then gone (the qrPayload never reaches storage).
export type PrimedOrder = {
  order: OrderDetail;
  receivedAt: { monotonicMs: number; wallMs: number };
};
const primed = new Map<string, PrimedOrder>();
export function primeOrder(order: OrderDetail): void {
  primed.set(order.id.toLowerCase(), {
    order,
    receivedAt: { monotonicMs: performance.now(), wallMs: Date.now() },
  });
}
export function takePrimedOrder(orderId: string): PrimedOrder | null {
  const key = orderId.toLowerCase();
  const order = primed.get(key) ?? null;
  primed.delete(key);
  return order;
}
