import test from "node:test";
import assert from "node:assert/strict";
import { applyOwnerChange } from "./merchandiseSession";

function memory(initial: Record<string, string>): Storage {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  } as Storage;
}
const INTENT = "pris_merchandise_intent";
const mine = "pris_merchandise_checkout:11:PRIS-2026";
const theirs = "pris_merchandise_checkout:99:PRIS-2026";
const seed = () => memory({ [INTENT]: "{}", [mine]: "{}", [theirs]: "{}" });

test("switching to another buyer drops the intent and the other buyer's checkout data", () => {
  const s = seed();
  applyOwnerChange(s, 99, 11, false);
  assert.equal(s.getItem(INTENT), null);
  assert.notEqual(s.getItem(mine), null);
  assert.equal(s.getItem(theirs), null);
});

test("explicit logout drops the intent; an expired token keeps it", () => {
  const out = seed();
  applyOwnerChange(out, 11, null, true);
  assert.equal(out.getItem(INTENT), null);
  assert.notEqual(out.getItem(theirs), null); // no real buyerId: foreign sweep is skipped
  const expired = seed();
  applyOwnerChange(expired, 11, null, false);
  assert.notEqual(expired.getItem(INTENT), null);
});

test("first sign-in keeps the intent made while anonymous", () => {
  const s = seed();
  applyOwnerChange(s, null, 11, false);
  assert.notEqual(s.getItem(INTENT), null);
  applyOwnerChange(s, undefined, 11, false);
  assert.notEqual(s.getItem(INTENT), null);
  assert.equal(s.getItem(theirs), null);
});
