import test from "node:test";
import assert from "node:assert/strict";
import {
  clearCheckout,
  clearForeignCheckouts,
  ensureCheckoutKey,
  readCheckout,
  saveRecipientDraft,
} from "./merchandiseCheckoutKey";
import { emptyRecipient } from "./merchandiseRecipient";
const mem = (): Storage => {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
  };
};
const draft = emptyRecipient({ fullName: "A", phone: null } as never);
const code = (c: string) => (e: unknown) =>
  (e as { body?: { code?: string } }).body?.code === c;
test("ensure is stable per buyer/event and differs across buyers", () => {
  const s = mem();
  const k = ensureCheckoutKey(s, "E", 7);
  assert.match(k, /^[A-Za-z0-9_-]{1,100}$/);
  assert.equal(ensureCheckoutKey(s, "E", 7), k);
  assert.notEqual(ensureCheckoutKey(s, "E", 8), k);
  assert.ok(s.getItem("pris_merchandise_checkout:7:E"));
});
test("storage that cannot write throws MERCH_STORAGE_UNAVAILABLE", () => {
  const s = mem();
  s.setItem = () => {
    throw new Error("denied");
  };
  assert.throws(
    () => ensureCheckoutKey(s, "E", 7),
    code("MERCH_STORAGE_UNAVAILABLE"),
  );
  const lost = mem();
  lost.setItem = () => {};
  assert.throws(
    () => ensureCheckoutKey(lost, "E", 7),
    code("MERCH_STORAGE_UNAVAILABLE"),
  );
});
test("corrupt JSON reads as empty", () => {
  const s = mem();
  s.setItem("pris_merchandise_checkout:7:E", "{bad");
  assert.deepEqual(readCheckout(s, "E", 7), { key: null, draft: null });
});
test("draft save/read and keepDraft clear", () => {
  const s = mem();
  const k = ensureCheckoutKey(s, "E", 7);
  saveRecipientDraft(s, "E", 7, draft);
  assert.deepEqual(readCheckout(s, "E", 7), { key: k, draft });
  clearCheckout(s, "E", 7, { keepDraft: true });
  assert.deepEqual(readCheckout(s, "E", 7), { key: null, draft });
  clearCheckout(s, "E", 7);
  assert.equal(s.getItem("pris_merchandise_checkout:7:E"), null);
});
test("clearForeignCheckouts removes other buyers only", () => {
  const s = mem();
  ensureCheckoutKey(s, "E", 7);
  ensureCheckoutKey(s, "E", 8);
  s.setItem("other", "x");
  clearForeignCheckouts(s, 7);
  assert.ok(s.getItem("pris_merchandise_checkout:7:E"));
  assert.equal(s.getItem("pris_merchandise_checkout:8:E"), null);
  assert.equal(s.getItem("other"), "x");
});
