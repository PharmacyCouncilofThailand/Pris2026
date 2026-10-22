import test from "node:test";
import assert from "node:assert/strict";
import {
  readPurchaseIntent,
  resumePurchaseIntent,
  savePurchaseIntent,
  type PurchaseIntent,
} from "./merchandiseIntent";
import { merchandiseFailure, type MerchandiseApi } from "./merchandiseApi";
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
const P = "11111111-1111-4111-8111-111111111111";
const V = "22222222-2222-4222-8222-222222222222";
const I = "33333333-3333-4333-8333-333333333333";
const intent: PurchaseIntent = {
  id: I,
  eventCode: "PRIS-2026",
  returnPath: `/souvenirs/products/${P}?intentId=${I}`,
  productId: P,
  selection: { variantId: V, bundleSelections: [] },
  quantity: 2,
};
test("save/read round trip, mismatch and invalid", () => {
  const s = mem();
  savePurchaseIntent(s, intent);
  assert.deepEqual(readPurchaseIntent(s, I), intent);
  assert.equal(readPurchaseIntent(s, P), null);
  s.setItem("pris_merchandise_intent", "{bad");
  assert.equal(readPurchaseIntent(s, I), null);
  s.setItem(
    "pris_merchandise_intent",
    JSON.stringify({ ...intent, returnPath: "https://evil" }),
  );
  assert.equal(readPurchaseIntent(s, I), null);
  s.setItem(
    "pris_merchandise_intent",
    JSON.stringify({ ...intent, eventCode: "bad code" }),
  );
  assert.equal(readPurchaseIntent(s, I), null);
});
test("resume calls addCartItem once and clears on success", async () => {
  const s = mem();
  savePurchaseIntent(s, intent);
  const calls: unknown[][] = [];
  const api = {
    addCartItem: async (...a: unknown[]) => (calls.push(a), { id: "cart" }),
  } as unknown as MerchandiseApi;
  const cart = await resumePurchaseIntent(api, "tok", intent, s);
  assert.deepEqual(cart, { id: "cart" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "PRIS-2026");
  assert.deepEqual(calls[0][2], {
    productId: P,
    variantId: V,
    bundleSelections: [],
    quantity: 2,
  });
  assert.equal(readPurchaseIntent(s, I), null);
});
test("resume clears the intent when the API rejects with 422", async () => {
  const s = mem();
  savePurchaseIntent(s, intent);
  const api = {
    addCartItem: async () => {
      throw merchandiseFailure(422, "MERCH_X");
    },
  } as unknown as MerchandiseApi;
  await assert.rejects(resumePurchaseIntent(api, "tok", intent, s));
  assert.equal(readPurchaseIntent(s, I), null);
});
