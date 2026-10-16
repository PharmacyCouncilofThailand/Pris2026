import test from "node:test";
import assert from "node:assert/strict";
import {
  anchorFrom,
  cappedRemainingMs,
  CHECK_COOLDOWN_MS,
  deadlineRemainingMs,
  formatPaymentRemaining,
  ORDER_POLL_MS,
  panelModel,
} from "./merchandisePayment";
import type { PaymentState, PaymentView } from "../types/merchandise";
const serverEpochMs = Date.parse("2026-10-14T03:09:00.000Z");
const none = { busy: null, expiredLocally: false } as const;
const view = (
  state: PaymentState,
  extra: Partial<PaymentView> = {},
): PaymentView => ({
  state,
  attempt: null,
  canRequestNewQr: false,
  canCheck: false,
  retryAfterSeconds: null,
  serverNow: "2026-10-14T03:09:00.000Z",
  ...extra,
});
const attempt = {
  id: "a",
  referenceNo: "r",
  expiresAt: "2026-10-14T03:19:00.000Z",
  qrPayload: "0002",
};

test("reopening preserves the backend deadline", () => {
  const anchor = { serverEpochMs, receivedMonotonicMs: 500 };
  assert.equal(
    deadlineRemainingMs("2026-10-14T03:10:00.000Z", anchor, 500),
    60_000,
  );
  assert.equal(
    deadlineRemainingMs("2026-10-14T03:10:00.000Z", anchor, 60_500),
    0,
  );
  assert.equal(deadlineRemainingMs("2026-10-14T03:10:00Z", anchor, 1), 60_000);
  assert.equal(formatPaymentRemaining(59_001), "01:00");
  assert.equal(formatPaymentRemaining(0), "00:00");
});
test("invalid timestamps do not become a fresh deadline", () => {
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
test("re-anchoring after serverNow advances 300s yields less remaining time", () => {
  const expiresAt = "2026-10-14T03:19:00.000Z";
  const a1 = anchorFrom(view("qr_active"), 1000);
  const a2 = anchorFrom(
    view("qr_active", { serverNow: "2026-10-14T03:14:00.000Z" }),
    1000,
  );
  assert.equal(deadlineRemainingMs(expiresAt, a1, 1000), 600_000);
  assert.equal(deadlineRemainingMs(expiresAt, a2, 1000), 300_000);
});
test("anchorFrom rejects an invalid serverNow", () => {
  assert.throws(() => anchorFrom(view("qr_active", { serverNow: "x" }), 1));
});
test("constants", () => {
  assert.equal(ORDER_POLL_MS, 10_000);
  assert.equal(CHECK_COOLDOWN_MS, 5_000);
});
test("panelModel covers all 8 states", () => {
  const m = (v: PaymentView) => panelModel(v, none, "PRIS-1");
  let p = m(view("awaiting_qr", { canRequestNewQr: true }));
  assert.deepEqual(
    [p.title, p.message, p.primary, p.showQr],
    ["รอสร้าง QR", "ยังไม่มี QR สำหรับชำระเงิน", "request_qr", false],
  );
  assert.equal(m(view("awaiting_qr")).primary, null);
  p = m(view("qr_active", { attempt, canCheck: true }));
  assert.deepEqual(
    [p.title, p.message, p.primary, p.showQr],
    [
      "รอชำระเงิน",
      "โอนแล้วระบบจะยืนยันให้อัตโนมัติ",
      "check",
      true,
    ],
  );
  assert.equal(m(view("qr_active", { attempt })).primary, null);
  assert.equal(
    m(
      view("qr_active", {
        attempt: { ...attempt, qrPayload: "" },
        canCheck: true,
      }),
    ).showQr,
    false,
  );
  assert.equal(
    m(view("qr_active", { attempt: { ...attempt, qrPayload: null } })).showQr,
    false,
  );
  p = m(view("verifying", { canCheck: true }));
  assert.deepEqual(
    [p.title, p.message, p.primary],
    ["กำลังตรวจสอบ", "กำลังตรวจสอบการชำระ กรุณารอสักครู่", null],
  );
  p = m(view("qr_expired_open", { canRequestNewQr: true }));
  assert.deepEqual(
    [p.title, p.message, p.primary],
    ["QR หมดอายุ", "QR หมดอายุ", "request_qr"],
  );
  assert.equal(m(view("qr_expired_open")).primary, null);
  p = m(view("qr_expired_closed", { canRequestNewQr: true, canCheck: true }));
  assert.deepEqual(
    [p.title, p.message, p.primary],
    [
      "หมดเวลาชำระเงิน",
      "หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว",
      null,
    ],
  );
  p = m(view("check_failed", { canCheck: true }));
  assert.deepEqual(
    [p.title, p.message, p.primary],
    ["ตรวจสอบไม่สำเร็จ", "ตรวจสอบไม่สำเร็จ กรุณาลองอีกครั้ง", "check"],
  );
  p = m(view("review"));
  assert.equal(p.title, "รอเจ้าหน้าที่ตรวจสอบ");
  assert.ok(
    p.message!.includes("pr@pharmacycouncil.org") &&
      p.message!.includes("PRIS-1"),
  );
  assert.equal(p.primary, null);
  p = m(view("paid"));
  assert.deepEqual(
    [p.title, p.message, p.primary],
    ["ชำระเงินสำเร็จ", "ชำระเงินสำเร็จ", null],
  );
});
test("local expiry and busy states", () => {
  const v = view("qr_active", { attempt, canCheck: true });
  let p = panelModel(v, { busy: null, expiredLocally: true }, "O");
  assert.equal(p.state, "verifying");
  assert.equal(p.showQr, false);
  p = panelModel(v, { busy: "creating", expiredLocally: false }, "O");
  assert.deepEqual(
    [p.state, p.title, p.showQr, p.primary],
    ["creating", "กำลังสร้าง QR", false, null],
  );
  p = panelModel(v, { busy: "checking", expiredLocally: false }, "O");
  assert.deepEqual(
    [p.state, p.title, p.primary],
    ["checking", "กำลังตรวจสอบ", null],
  );
});

test("qr_active without a payload hides the QR and offers a check", () => {
  const p = panelModel(
    view("qr_active", {
      attempt: { ...attempt, qrPayload: null },
      canCheck: true,
    }),
    none,
    "N1",
  );
  assert.equal(p.showQr, false);
  assert.equal(p.message, "ไม่สามารถแสดง QR ได้ กรุณากดตรวจสอบการชำระเงิน");
  assert.equal(p.primary, "check");
});
test("cappedRemainingMs follows the wall clock when the monotonic clock paused", () => {
  const anchor = { ...anchorFrom(view("qr_active"), 1000, 5_000_000) };
  // Monotonic clock advanced 1s only (device slept), wall clock advanced 400s.
  assert.equal(
    cappedRemainingMs(attempt.expiresAt, anchor, 2000, 5_400_000),
    200_000,
  );
  // Normal case: both agree.
  assert.equal(
    cappedRemainingMs(attempt.expiresAt, anchor, 11_000, 5_010_000),
    590_000,
  );
  // Past expiry by wall clock.
  assert.equal(
    cappedRemainingMs(attempt.expiresAt, anchor, 2000, 5_700_000),
    0,
  );
  // A backwards wall clock cannot extend the monotonic estimate.
  assert.equal(
    cappedRemainingMs(attempt.expiresAt, anchor, 11_000, 4_000_000),
    590_000,
  );
  // Without a wall anchor it is the monotonic value.
  assert.equal(
    cappedRemainingMs(
      attempt.expiresAt,
      anchorFrom(view("qr_active"), 1000),
      11_000,
      9e12,
    ),
    590_000,
  );
});
