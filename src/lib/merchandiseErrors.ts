import type { MerchandiseApiError } from "./merchandiseApi";

export type MerchandiseErrorAction =
  | "login"
  | "reload_cart_review"
  | "go_cart"
  | "store_closed"
  | "new_key"
  | "verifying"
  | "check_failed"
  | "payment_unavailable"
  | "rate_limited"
  | "field_errors"
  | "not_found"
  | "buyer_forbidden"
  | "show_message";

export function errorAction(e: MerchandiseApiError): MerchandiseErrorAction {
  const { status } = e,
    code = e.body.code;
  if (status === 401) return "login";
  if (status === 403 && code === "MERCH_BUYER_REQUIRED")
    return "buyer_forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status === 409) {
    if (code === "MERCH_CART_CHANGED") return "reload_cart_review";
    if (code === "MERCH_PREORDER_CLOSED") return "store_closed";
    if (code === "MERCH_PAYMENT_VERIFYING") return "verifying";
  }
  if (status === 422) {
    if (code === "MERCH_CART_INVALID" || code === "MERCH_CART_EMPTY")
      return "go_cart";
    if (code === "MERCH_IDEMPOTENCY_KEY_REUSED") return "new_key";
  }
  if (status === 503) {
    if (code === "MERCH_PAYMENT_CHECK_FAILED") return "check_failed";
    if (code === "MERCH_PAYMENT_UNAVAILABLE") return "payment_unavailable";
  }
  if (status === 400 && code === "VALIDATION_ERROR") return "field_errors";
  return "show_message";
}
