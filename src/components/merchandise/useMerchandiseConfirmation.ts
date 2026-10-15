"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "@/i18n/routing";
import { useMerchandise } from "./MerchandiseProvider";
import {
  beginOrderRequest,
  readOrderRequest,
  recoverOrderRequest,
  type OrderRecovery,
} from "@/lib/merchandiseOrderRequest";
import { merchandiseFailure } from "@/lib/merchandiseApi";
import type { QuoteDto } from "@/types/merchandise";
type ConfirmationState =
  | { phase: "checking" | "ready" | "confirming" | "completed" }
  | { phase: "recovery"; result: OrderRecovery };
export function useMerchandiseConfirmation(
  onReviewRequired: (message: string) => void,
) {
  const { api, eventCode, ownerId, token, store } = useMerchandise(),
    router = useRouter();
  const eventId = store.data?.eventId;
  const scope = useMemo(
    () => ({ eventCode, ownerId, token, eventId }),
    [eventCode, ownerId, token, eventId],
  );
  const live = useRef<object | null>(null),
    pending = useRef(false);
  const [state, setState] = useState<{
    scope: object;
    value: ConfirmationState;
  } | null>(null);
  useLayoutEffect(() => {
    live.current = scope;
    pending.current = false;
    return () => {
      live.current = null;
    };
  }, [scope]);
  const current = useCallback(() => live.current === scope, [scope]);
  const finish = useCallback(
    (result: OrderRecovery) => {
      if (!current()) return;
      if (result.kind === "completed") {
        setState({ scope, value: { phase: "completed" } });
        router.replace(`/souvenirs/orders/${result.orderId}`);
      } else if (result.kind === "failed") {
        onReviewRequired(result.message);
        setState({ scope, value: { phase: "ready" } });
      } else if (result.kind === "none")
        setState({ scope, value: { phase: "ready" } });
      else if (result.kind !== "cancelled")
        setState({ scope, value: { phase: "recovery", result } });
    },
    [current, scope, router, onReviewRequired],
  );
  const recover = useCallback(async () => {
    if (!token || !ownerId || pending.current || !current()) return;
    pending.current = true;
    setState({ scope, value: { phase: "checking" } });
    try {
      finish(
        await recoverOrderRequest({
          storage: window.sessionStorage,
          api,
          eventCode,
          buyerId: ownerId,
          token,
          isCurrent: current,
        }),
      );
    } catch {
      finish({
        kind: "unknown",
        error: merchandiseFailure(0, "MERCH_STORAGE_UNAVAILABLE", true),
      });
    } finally {
      if (current()) pending.current = false;
    }
  }, [api, eventCode, ownerId, token, current, scope, finish]);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void recover();
    });
    return () => {
      active = false;
    };
  }, [recover]);
  const confirm = useCallback(
    async (quote: QuoteDto) => {
      if (!token || !ownerId || pending.current || !current()) return;
      pending.current = true;
      setState({ scope, value: { phase: "confirming" } });
      try {
        if (readOrderRequest(window.sessionStorage, eventCode, ownerId)) {
          finish(
            await recoverOrderRequest({
              storage: window.sessionStorage,
              api,
              eventCode,
              buyerId: ownerId,
              token,
              isCurrent: current,
            }),
          );
          return;
        }
        const record = beginOrderRequest(
          window.sessionStorage,
          eventCode,
          ownerId,
          crypto.randomUUID(),
        );
        try {
          const result = await api.confirm(
            eventCode,
            token,
            {
              quoteToken: quote.quoteToken,
              expectedCartRevision: quote.cartRevision,
              recipient: quote.recipient,
            },
            record.key,
          );
          if (!current()) return;
          if (
            result.order.buyer.id !== ownerId ||
            result.order.eventId !== eventId
          )
            throw merchandiseFailure(0, "MERCH_BAD_RESPONSE", true);
          finish({
            kind: "completed",
            orderId: result.order.id,
            key: record.key,
          });
        } catch {
          if (current())
            finish(
              await recoverOrderRequest({
                storage: window.sessionStorage,
                api,
                eventCode,
                buyerId: ownerId,
                token,
                isCurrent: current,
              }),
            );
        }
      } catch {
        if (current())
          finish({
            kind: "unknown",
            error: merchandiseFailure(0, "MERCH_STORAGE_UNAVAILABLE", true),
          });
      } finally {
        if (current()) pending.current = false;
      }
    },
    [token, ownerId, current, scope, api, eventCode, eventId, finish],
  );
  return {
    state:
      state?.scope === scope ? state.value : { phase: "checking" as const },
    confirm,
    recover,
  };
}
