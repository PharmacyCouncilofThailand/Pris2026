import test from "node:test";
import assert from "node:assert/strict";
import {
  deadlineRemainingMs,
  formatPaymentRemaining,
  mayRequestQr,
} from "./merchandisePayment";
import type { PaymentView } from "../types/merchandise";
const serverEpochMs = Date.parse("2026-10-14T03:09:00.000Z");
test("reopening preserves the backend deadline instead of starting ten minutes again", () => {
  const anchor = { serverEpochMs, receivedMonotonicMs: 500 };
  assert.equal(
    deadlineRemainingMs("2026-10-14T03:10:00.000Z", anchor, 500),
    60_000,
  );
  assert.equal(
    deadlineRemainingMs("2026-10-14T03:10:00.000Z", anchor, 60_500),
    0,
  );
});
test("deadline uses only server time and monotonic elapsed, even with an incorrect wall clock", () => {
  const anchor = { serverEpochMs, receivedMonotonicMs: 500 };
  assert.equal(
    deadlineRemainingMs("2026-10-14T03:10:00Z", anchor, 30_500),
    30_000,
  );
  assert.equal(deadlineRemainingMs("2026-10-14T03:10:00Z", anchor, 1), 60_000);
  assert.equal(formatPaymentRemaining(59_001), "01:00");
  assert.equal(formatPaymentRemaining(0), "00:00");
});
test("invalid timestamps or monotonic anchors do not become a fresh deadline", () => {
  const anchor = { serverEpochMs, receivedMonotonicMs: 500 };
  assert.throws(() => deadlineRemainingMs("invalid", anchor, 1000));
  assert.throws(() =>
    deadlineRemainingMs(
      "2026-10-14T03:10:00Z",
      { ...anchor, serverEpochMs: NaN },
      1000,
    ),
  );
  assert.throws(() =>
    deadlineRemainingMs("2026-10-14T03:10:00Z", anchor, Infinity),
  );
});
test("new QR actions require an eligible server state as well as explicit permission", () => {
  const view = {
    state: "qr_expired_open",
    canRequestNewQr: true,
  } as PaymentView;
  assert.equal(mayRequestQr(view), true);
  assert.equal(mayRequestQr({ ...view, canRequestNewQr: false }), false);
  for (const state of [
    "verification_unknown",
    "checking",
    "paid",
    "review_required",
    "qr_active",
    "qr_expired_closed",
    "qr_expired_unavailable",
    "creating",
  ] as const)
    assert.equal(mayRequestQr({ ...view, state }), false);
});
