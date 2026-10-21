import test from "node:test";
import assert from "node:assert/strict";
import {
  formatBaht,
  formatMerchandiseTime,
  isBaht,
  isIsoUtc,
  shippingFeeLabel,
} from "./merchandiseFormat";
test("whole baht are formatted with two decimals and invalid amounts are rejected", () => {
  assert.equal(formatBaht(6), "฿6.00");
  assert.equal(formatBaht(1250), "฿1,250.00");
  assert.equal(formatBaht(2_000_000), "฿2,000,000.00");
  assert.equal(formatBaht(0), "฿0.00");
  assert.equal(isBaht(0), true);
  assert.equal(isBaht(50), true);
  for (const value of [1.5, -1, "50", NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, null])
    assert.equal(isBaht(value), false);
  assert.throws(() => formatBaht(-1));
  assert.throws(() => formatBaht(6.5));
});
test("only explicit valid UTC instants are formatted in Thai time", () => {
  assert.equal(isIsoUtc("2026-10-14T17:00:00.000Z"), true);
  for (const value of [
    "2026-02-30T00:00:00Z",
    "2026-10-14T17:00:00",
    "2026-10-14T24:00:00Z",
  ])
    assert.equal(isIsoUtc(value), false);
  assert.match(formatMerchandiseTime("2026-10-14T17:00:00.000Z"), /15/);
  assert.equal(formatMerchandiseTime(null), "—");
});
test("shipping fee label", () => {
  assert.equal(shippingFeeLabel(0), "จัดส่งฟรี");
  assert.equal(shippingFeeLabel(50), "ค่าจัดส่ง ฿50.00 ต่อออเดอร์");
  assert.equal(shippingFeeLabel(120), "ค่าจัดส่ง ฿120.00 ต่อออเดอร์");
});
