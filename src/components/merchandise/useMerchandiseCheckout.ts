"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { MerchandiseApiError, merchandiseFailure } from "@/lib/merchandiseApi";
import {
  clearCheckout,
  ensureCheckoutKey,
  readCheckout,
  saveRecipientDraft,
} from "@/lib/merchandiseCheckoutKey";
import { errorAction } from "@/lib/merchandiseErrors";
import {
  emptyRecipient,
  validateRecipient,
  type RecipientDraft,
  type RecipientErrors,
} from "@/lib/merchandiseRecipient";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import { canCheckout } from "@/lib/merchandiseSelection";
import type { CartDto, Recipient } from "@/types/merchandise";
import { useMerchandise } from "./MerchandiseProvider";
import { primeOrder } from "./useMerchandiseOrder";

export type CheckoutStep = "recipient" | "review";
export type CheckoutStatus = "idle" | "submitting" | "uncertain" | "error";

export const UNCERTAIN_MESSAGE = "ยังไม่ทราบผลการยืนยัน";
export const CART_CHANGED_MESSAGE =
  "ตะกร้ามีการเปลี่ยนแปลง กรุณาตรวจสอบอีกครั้ง";
export const CLOSED_MESSAGE = "ปิดรับพรีออเดอร์แล้ว";
export const STORAGE_MESSAGE =
  "เบราว์เซอร์ไม่อนุญาตให้เก็บข้อมูลคำขอ กรุณาเปิดการใช้ storage ของเบราว์เซอร์แล้วลองอีกครั้ง";
const CHECKOUT_PATH = "/souvenirs/checkout";
const RATE_LIMIT_MS = 10_000;

const storageOrNull = (): Storage | null => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};
const noDefaults: CartDto["buyerDefaults"] = {
  fullName: "",
  phone: null,
  email: "",
};

function mergeDraft(
  base: RecipientDraft,
  saved: RecipientDraft | null,
): RecipientDraft {
  if (!saved) return base;
  const out = { ...base };
  for (const k of Object.keys(base) as (keyof RecipientDraft)[])
    if (typeof saved[k] === "string") out[k] = saved[k];
  return out;
}

/** Map API `details.fieldErrors` (keys like "recipient.phone") onto form fields. */
function fieldErrorsFrom(e: MerchandiseApiError): RecipientErrors {
  const raw = e.body.details?.fieldErrors;
  const out: RecipientErrors = {};
  if (typeof raw !== "object" || raw === null) return out;
  const known = Object.keys(emptyRecipient(noDefaults));
  for (const [path, messages] of Object.entries(raw)) {
    const field = path.split(".").pop() ?? "";
    const text = Array.isArray(messages) ? messages[0] : messages;
    if (known.includes(field) && typeof text === "string")
      out[field as keyof Recipient] = text;
  }
  return out;
}

export function useMerchandiseCheckout() {
  const {
    api,
    eventCode,
    token,
    ownerId,
    cart: cartResource,
    store,
    setCart,
  } = useMerchandise();
  const router = useRouter();
  const [boot] = useState(() => {
    const storage = storageOrNull();
    return storage && ownerId !== null
      ? readCheckout(storage, eventCode, ownerId)
      : { key: null, draft: null };
  });
  // A leftover key + draft means a confirmation never finished (login detour,
  // refresh, lost response): resume it with the same key instead of a new one.
  const resumed = boot.key !== null && boot.draft !== null;
  const [step, setStep] = useState<CheckoutStep>(
    resumed ? "review" : "recipient",
  );
  const [draft, setDraftState] = useState<RecipientDraft>(() =>
    mergeDraft(
      emptyRecipient(cartResource.data?.buyerDefaults ?? noDefaults),
      boot.draft,
    ),
  );
  const [errors, setErrors] = useState<RecipientErrors>({});
  const [reviewCart, setReviewCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<CheckoutStatus>(
    resumed ? "uncertain" : "idle",
  );
  const [message, setMessage] = useState<string | null>(
    resumed ? UNCERTAIN_MESSAGE : null,
  );
  const [closed, setClosed] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const draftRef = useRef(draft),
    reviewRef = useRef<CartDto | null>(null),
    inflight = useRef(false),
    loadSeq = useRef(0),
    lastBody = useRef<{ cartVersion: string; recipient: Recipient } | null>(
      null,
    ),
    mounted = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    draftRef.current = draft;
    reviewRef.current = reviewCart;
  });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const goLogin = useCallback(
    () => router.push(merchandiseLoginPath(CHECKOUT_PATH, true)),
    [router],
  );

  /** GET the cart afresh; its cartVersion is what the order will be bound to. */
  const loadReview = useCallback(async () => {
    if (!token) return;
    const seq = ++loadSeq.current;
    setLoading(true);
    try {
      const fresh = await api.cart(eventCode, token);
      if (!mounted.current || seq !== loadSeq.current) return;
      setReviewCart(fresh);
      reviewRef.current = fresh;
      setCart(fresh);
    } catch (error) {
      if (!mounted.current || seq !== loadSeq.current) return;
      if (error instanceof MerchandiseApiError && error.status === 401) {
        goLogin();
        return;
      }
      setStatus((s) => (s === "uncertain" ? s : "error"));
      setMessage(
        error instanceof MerchandiseApiError
          ? error.message
          : merchandiseFailure().message,
      );
    } finally {
      if (mounted.current && seq === loadSeq.current) setLoading(false);
    }
  }, [api, eventCode, token, setCart, goLogin]);

  useEffect(() => {
    if (resumed) void loadReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDraft = useCallback(
    (next: RecipientDraft) => {
      setDraftState(next);
      draftRef.current = next;
      setErrors({});
      const storage = storageOrNull();
      if (storage && ownerId !== null)
        saveRecipientDraft(storage, eventCode, ownerId, next);
    },
    [eventCode, ownerId],
  );

  const toReview = useCallback(() => {
    const result = validateRecipient(draftRef.current);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setStatus("idle");
    setMessage(null);
    setStep("review");
    void loadReview();
  }, [loadReview]);

  const back = useCallback(() => {
    if (inflight.current || status === "uncertain") return;
    loadSeq.current++;
    setLoading(false);
    setStep("recipient");
    setStatus("idle");
    setMessage(null);
  }, [status]);

  const submit = useCallback(
    async (reuseBody: boolean) => {
      const review = reviewRef.current;
      if (
        inflight.current ||
        !token ||
        !review ||
        !store.data ||
        !canCheckout(review, store.data)
      )
        return;
      inflight.current = true;
      try {
        let body = reuseBody ? lastBody.current : null;
        if (!body) {
          const result = validateRecipient(draftRef.current);
          if (!result.ok) {
            setErrors(result.errors);
            setStep("recipient");
            setStatus("idle");
            return;
          }
          body = { cartVersion: review.cartVersion, recipient: result.value };
        }
        const storage = storageOrNull();
        let key: string;
        try {
          if (!storage || ownerId === null)
            throw merchandiseFailure(0, "MERCH_STORAGE_UNAVAILABLE");
          saveRecipientDraft(storage, eventCode, ownerId, draftRef.current);
          // The key must be durable before the request can possibly be sent.
          key = ensureCheckoutKey(storage, eventCode, ownerId);
        } catch {
          setStatus("error");
          setMessage(STORAGE_MESSAGE);
          return;
        }
        lastBody.current = body;
        setStatus("submitting");
        setMessage(null);
        try {
          const { order } = await api.createOrder(eventCode, token, key, body);
          primeOrder(order);
          clearCheckout(storage!, eventCode, ownerId!);
          lastBody.current = null;
          if (mounted.current) {
            router.replace(`/souvenirs/orders/${order.id}`);
          }
          // The cart is now empty on the server; drop the stale copy so a
          // Back navigation to /souvenirs/cart cannot show or reuse it.
          cartResource.reload();
        } catch (error) {
          await fail(error, storage!, ownerId!);
        }
      } finally {
        inflight.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      api,
      eventCode,
      token,
      ownerId,
      store.data,
      router,
      cartResource,
      loadReview,
    ],
  );

  async function fail(error: unknown, storage: Storage, buyerId: number) {
    if (!mounted.current) return;
    const e =
      error instanceof MerchandiseApiError
        ? error
        : merchandiseFailure(0, "MERCH_NETWORK_UNKNOWN", true);
    // Lost response or malformed 2xx: the order may exist. Keep key + body.
    if (e.uncertain || e.body.code === "MERCH_BAD_RESPONSE") {
      setStatus("uncertain");
      setMessage(UNCERTAIN_MESSAGE);
      return;
    }
    const action = errorAction(e);
    const drop = () =>
      clearCheckout(storage, eventCode, buyerId, { keepDraft: true });
    if (action === "login") {
      // Key and draft stay: the retry after login must reuse them.
      setStatus("error");
      setMessage(e.message);
      goLogin();
      return;
    }
    if (action === "rate_limited") {
      setStatus("error");
      setMessage("ทำรายการถี่เกินไป กรุณารอสักครู่");
      setBlocked(true);
      timer.current = setTimeout(() => setBlocked(false), RATE_LIMIT_MS);
      return;
    }
    drop();
    lastBody.current = null;
    switch (action) {
      case "reload_cart_review":
        setStatus("idle");
        setMessage(CART_CHANGED_MESSAGE);
        await loadReview();
        return;
      case "store_closed":
        setClosed(true);
        setStatus("error");
        setMessage(CLOSED_MESSAGE);
        return;
      case "new_key":
        setStatus("idle");
        setMessage("กรุณากดยืนยันคำสั่งซื้ออีกครั้ง");
        return;
      case "go_cart":
        setStatus("error");
        setMessage(e.message);
        cartResource.reload();
        router.push("/souvenirs/cart");
        return;
      case "field_errors": {
        const found = fieldErrorsFrom(e);
        setErrors(found);
        setStep("recipient");
        setStatus("idle");
        setMessage(Object.keys(found).length ? null : e.message);
        return;
      }
      case "buyer_forbidden":
        setStatus("error");
        setMessage("บัญชีนี้ใช้ซื้อสินค้าไม่ได้");
        return;
      case "not_found":
        setStatus("error");
        setMessage("ไม่พบข้อมูล");
        return;
      default:
        setStatus("error");
        setMessage(e.message);
    }
  }

  const confirm = useCallback(() => submit(false), [submit]);
  const retry = useCallback(() => submit(true), [submit]);

  return {
    step,
    draft,
    setDraft,
    errors,
    toReview,
    back,
    cart: step === "review" ? reviewCart : (cartResource.data ?? null),
    status,
    message,
    confirm,
    retry,
    loading,
    closed,
    blocked,
    reloadReview: loadReview,
  };
}
