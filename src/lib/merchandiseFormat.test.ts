import test from "node:test";
import assert from "node:assert/strict";
import {
  formatMinorBaht,
  formatMerchandiseTime,
  isMinor,
  isIsoUtc,
} from "./merchandiseFormat";
test("money remains exact beyond safe integers and never treats missing prices as zero", () => {
  assert.equal(
    formatMinorBaht("900719925474099301"),
    "฿9,007,199,254,740,993.01",
  );
  assert.equal(formatMinorBaht("0"), "฿0.00");
  for (const value of ["", "01", "-1", "1.5", "1e3", "9".repeat(31)])
    assert.equal(isMinor(value), false);
  assert.throws(() => formatMinorBaht(""));
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
