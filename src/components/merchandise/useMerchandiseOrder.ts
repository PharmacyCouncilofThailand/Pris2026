"use client";
import { useCallback, useMemo } from "react";
import { merchandiseFailure } from "@/lib/merchandiseApi";
import type { OrderDetail } from "@/types/merchandise";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseResource } from "./useMerchandiseResource";
export function useMerchandiseOrder(orderId: string) {
  const { api, eventCode, token, ownerIdentity, ownerId, store } =
      useMerchandise(),
    eventId = store.data?.eventId;
  const scope = useMemo(
    () =>
      token && eventId
        ? { eventCode, eventId, ownerIdentity, token, orderId }
        : null,
    [token, eventCode, eventId, ownerIdentity, orderId],
  );
  const load = useCallback(
    async (signal: AbortSignal) => {
      if (!token || !eventId)
        throw merchandiseFailure(401, "MERCH_AUTH_REQUIRED");
      const data = await api.order(orderId, token, signal);
      if (
        data.eventId !== eventId ||
        (ownerId !== null && data.buyer.id !== ownerId)
      )
        throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
      return data;
    },
    [api, token, eventId, ownerId, orderId],
  );
  return useMerchandiseResource(scope, load);
}

// A just-created order handed from checkout to the order page so it need not
// reload immediately. Read once, then gone (the qrPayload never reaches storage).
const primed = new Map<string, OrderDetail>();
export function primeOrder(order: OrderDetail): void {
  primed.set(order.id.toLowerCase(), order);
}
export function takePrimedOrder(orderId: string): OrderDetail | null {
  const key = orderId.toLowerCase();
  const order = primed.get(key) ?? null;
  primed.delete(key);
  return order;
}
