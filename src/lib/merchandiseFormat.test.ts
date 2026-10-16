import test from "node:test";
import assert from "node:assert/strict";
import {
  formatMinorBaht,
  formatMerchandiseTime,
  isMinor,
  isIsoUtc,
} from "./merchandiseFormat";
test("integer satang are formatted as baht and invalid amounts are rejected", () => {
  assert.equal(formatMinorBaht(125000), "฿1,250.00");
  assert.equal(formatMinorBaht(5), "฿0.05");
  assert.equal(formatMinorBaht(0), "฿0.00");
  assert.equal(isMinor(0), true);
  assert.equal(isMinor(5000), true);
  for (const value of [1.5, -1, "5000", NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, null])
    assert.equal(isMinor(value), false);
  assert.throws(() => formatMinorBaht(-1));
  assert.throws(() => formatMinorBaht(1.5));
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
