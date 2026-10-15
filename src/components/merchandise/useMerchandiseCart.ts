"use client";
import { useCallback, useMemo } from "react";
import { merchandiseFailure } from "@/lib/merchandiseApi";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseResource } from "./useMerchandiseResource";
export function useMerchandiseCart() {
  const { api, eventCode, token, ownerIdentity, store } = useMerchandise(),
    eventId = store.data?.eventId;
  const scope = useMemo(
    () =>
      token && eventId ? { eventCode, eventId, ownerIdentity, token } : null,
    [token, eventCode, eventId, ownerIdentity],
  );
  const load = useCallback(
    async (signal: AbortSignal) => {
      if (!token || !eventId)
        throw merchandiseFailure(401, "MERCH_AUTH_REQUIRED");
      const data = await api.cart(eventCode, token, signal);
      if (data.eventId !== eventId)
        throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
      return data;
    },
    [api, eventCode, token, eventId],
  );
  return useMerchandiseResource(scope, load);
}
