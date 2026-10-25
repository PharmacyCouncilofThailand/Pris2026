import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialKioskState,
  kioskReducer,
  secondsUntilReset,
  canRefreshRoster,
  type KioskState,
} from "./posterKioskState";

const results = (over: Partial<KioskState> = {}): KioskState => ({
  mode: "results",
  query: "RDU",
  viewingTrackingId: null,
  lastActivityAt: 1000,
  ...over,
});
const viewing = (over: Partial<KioskState> = {}): KioskState => ({
  mode: "viewing",
  query: "RDU",
  viewingTrackingId: "PRIS-2026-P018",
  lastActivityAt: 1000,
  ...over,
});

test("typing enters results and clearing returns to idle", () => {
  const s1 = kioskReducer(initialKioskState, { type: "query", query: "RDU", now: 10 });
  assert.equal(s1.mode, "results");
  assert.equal(s1.query, "RDU");
  const s2 = kioskReducer(s1, { type: "query", query: "", now: 20 });
  assert.equal(s2.mode, "idle");
  assert.equal(s2.query, "");
});

test("view opens once and ignores a second view", () => {
  const s1 = kioskReducer(results(), { type: "view", trackingId: "PRIS-2026-P018", now: 2000 });
  const s2 = kioskReducer(s1, { type: "view", trackingId: "PRIS-2026-P077", now: 3000 });
  assert.equal(s2.mode, "viewing");
  assert.equal(s2.viewingTrackingId, "PRIS-2026-P018");
});

test("close resets to a fresh idle", () => {
  const s = kioskReducer(viewing({ lastActivityAt: 5000 }), { type: "close" });
  assert.deepEqual(s, { ...initialKioskState, lastActivityAt: 5000 });
  assert.equal(s.query, "");
  assert.equal(s.viewingTrackingId, null);
});

test("view is ignored in idle", () => {
  const s = kioskReducer(initialKioskState, { type: "view", trackingId: "PRIS-2026-P018", now: 5 });
  assert.deepEqual(s, initialKioskState);
});

test("sixty seconds without activity resets results and viewing", () => {
  for (const s of [results(), viewing()]) {
    const reset = kioskReducer(s, { type: "tick", now: 61_000 });
    assert.equal(reset.mode, "idle");
    assert.equal(reset.query, "");
    assert.equal(reset.viewingTrackingId, null);
    assert.equal(kioskReducer(s, { type: "tick", now: 60_999 }), s);
  }
});

test("activity postpones the reset", () => {
  const s = kioskReducer(results(), { type: "activity", now: 55_000 });
  assert.equal(kioskReducer(s, { type: "tick", now: 61_000 }), s);
});

test("idle never resets", () => {
  assert.equal(kioskReducer(initialKioskState, { type: "tick", now: 10_000_000 }), initialKioskState);
});

test("countdown only in the last ten seconds", () => {
  const s = results();
  assert.equal(secondsUntilReset(s, s.lastActivityAt + 49_000), null);
  assert.equal(secondsUntilReset(s, s.lastActivityAt + 51_000), 9);
  assert.equal(secondsUntilReset(initialKioskState, 55_000), null);
});

test("roster refresh only in idle", () => {
  assert.equal(canRefreshRoster(initialKioskState), true);
  assert.equal(canRefreshRoster(results()), false);
  assert.equal(canRefreshRoster(viewing()), false);
});
