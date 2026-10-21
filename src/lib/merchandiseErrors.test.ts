import test from "node:test";
import assert from "node:assert/strict";
import { merchandiseFailure } from "./merchandiseApi";
import { errorAction } from "./merchandiseErrors";

const rows: [number, string, string][] = [
  [401, "ANY", "login"],
  [401, "MERCH_AUTH_REQUIRED", "login"],
  [403, "MERCH_BUYER_REQUIRED", "buyer_forbidden"],
  [403, "OTHER", "show_message"],
  [404, "MERCH_ORDER_NOT_FOUND", "not_found"],
  [404, "X", "not_found"],
  [409, "MERCH_CART_CHANGED", "reload_cart_review"],
  [422, "MERCH_CART_INVALID", "go_cart"],
  [422, "MERCH_CART_EMPTY", "go_cart"],
  [409, "MERCH_PREORDER_CLOSED", "store_closed"],
  [422, "MERCH_IDEMPOTENCY_KEY_REUSED", "new_key"],
  [422, "MERCH_ORDER_TOO_LARGE", "show_message"],
  [422, "MERCH_CART_QUANTITY_LIMIT", "show_message"],
  [422, "MERCH_SELECTION_INVALID", "show_message"],
  [422, "MERCH_PRODUCT_UNAVAILABLE", "show_message"],
  [409, "MERCH_PAYMENT_VERIFYING", "verifying"],
  [503, "MERCH_PAYMENT_CHECK_FAILED", "check_failed"],
  [503, "MERCH_PAYMENT_UNAVAILABLE", "payment_unavailable"],
  [429, "RATE_LIMITED", "rate_limited"],
  [400, "VALIDATION_ERROR", "field_errors"],
  [418, "X", "show_message"],
  [500, "MERCH_BAD_RESPONSE", "show_message"],
];
for (const [status, code, action] of rows)
  test(`errorAction ${status} ${code} -> ${action}`, () => {
    assert.equal(errorAction(merchandiseFailure(status, code)), action);
  });
