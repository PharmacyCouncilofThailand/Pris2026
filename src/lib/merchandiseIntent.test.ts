import test from "node:test";
import assert from "node:assert/strict";
import {
  writePurchaseIntent,
  readPurchaseIntent,
  clearPurchaseIntent,
  purchaseIntentReturnPath,
  resumePurchaseIntent,
  clearForeignPurchaseIntent,
  resolveIntentSelection,
  type PurchaseIntent,
} from "./merchandiseIntent";
import { createMerchandiseApi } from "./merchandiseApi";
import { ids, product, store, cart } from "../../tests/merchandise/data";
function storage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    key: (i) => [...m.keys()][i] ?? null,
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
    removeItem: (k) => {
      m.delete(k);
    },
  };
}
const pending = (): PurchaseIntent => ({
  id: ids.item,
  eventCode: "PRIS-2026",
  returnPath: `/souvenirs/products/${ids.product}`,
  selection: {
    productId: ids.product,
    variantId: ids.variant,
    bundleSelections: [],
  },
  quantity: 1,
});
const json = (data: unknown) => Response.json({ success: true, data });
test("pending intent is bounded non-PII, event-scoped and rejected if tampered", () => {
  const s = storage();
  writePurchaseIntent(s, pending());
  assert.deepEqual(readPurchaseIntent(s, "PRIS-2026"), pending());
  assert.match(
    purchaseIntentReturnPath(pending()),
    new RegExp("intentId=" + ids.item),
  );
  for (const bad of [
    { ...pending(), quantity: 0 },
    { ...pending(), quantity: 1.5 },
    { ...pending(), returnPath: "//evil.test" },
    { ...pending(), email: "private@test" },
    {
      ...pending(),
      selection: {
        ...pending().selection,
        bundleSelections: [
          { componentId: ids.item, variantId: ids.variant },
          { componentId: ids.item, variantId: ids.variant },
        ],
      },
    },
  ])
    assert.throws(() => writePurchaseIntent(s, bad as PurchaseIntent));
  assert.equal(readPurchaseIntent(s, "OTHER"), null);
  clearPurchaseIntent(s);
  assert.equal(s.length, 0);
});
test("resume checks fresh public/owner state, coalesces StrictMode and persists identical unknown retry payload", async () => {
  const s = storage();
  writePurchaseIntent(s, pending());
  let unknown = true,
    adds = 0;
  const bodies: string[] = [],
    keys: string[] = [],
    calls: string[] = [];
  const api = createMerchandiseApi({
    fetcher: async (url, init) => {
      const p = String(url);
      calls.push(p);
      if (p.endsWith("/store"))
        return json({ ...store, state: unknown ? "open" : "closed" });
      if (p.includes("/products/")) return json(product);
      if (p.endsWith("/cart")) return json(cart);
      adds++;
      bodies.push(String(init?.body));
      keys.push(new Headers(init?.headers).get("idempotency-key")!);
      if (unknown) throw Error("response lost");
      return json(cart);
    },
  });
  const options = {
    storage: s,
    api,
    eventCode: "PRIS-2026",
    token: "test-token",
    buyerId: 11,
    isCurrent: () => true,
  };
  const [a, b] = await Promise.all([
    resumePurchaseIntent(options),
    resumePurchaseIntent(options),
  ]);
  assert.equal(a.kind, "error");
  assert.equal(b.kind, "error");
  assert.equal(adds, 1);
  assert.equal(
    readPurchaseIntent(s, "PRIS-2026")?.expectedRevision,
    cart.revision,
  );
  unknown = false;
  const result = await resumePurchaseIntent(options);
  assert.equal(result.kind, "added");
  assert.equal(adds, 2);
  assert.equal(bodies[0], bodies[1]);
  assert.equal(keys[0], `intent:${ids.item}`);
  assert.equal(keys[0], keys[1]);
  assert.equal(s.length, 0);
  assert(calls.some((c) => c.endsWith("/cart")));
});

test("an account or selection change during a pending read cancels before POST", async () => {
  for (const change of ["logout", "selection"] as const) {
    const s = storage();
    writePurchaseIntent(s, pending());
    let active = true,
      adds = 0,
      resolveProduct: ((response: Response) => void) | undefined;
    const api = createMerchandiseApi({
      fetcher: async (url) => {
        if (String(url).endsWith("/store")) return json(store);
        if (String(url).includes("/products/"))
          return new Promise<Response>((resolve) => {
            resolveProduct = resolve;
          });
        adds++;
        return json(cart);
      },
    });
    const result = resumePurchaseIntent({
      storage: s,
      api,
      eventCode: "PRIS-2026",
      token: "token",
      buyerId: 11,
      isCurrent: () => active,
    });
    while (!resolveProduct) await new Promise((r) => setTimeout(r, 0));
    if (change === "logout") {
      active = false;
      clearForeignPurchaseIntent(s, null);
    } else writePurchaseIntent(s, { ...pending(), buyerId: 11, quantity: 2 });
    resolveProduct(json(product));
    assert.equal((await result).kind, "cancelled");
    assert.equal(adds, 0);
  }
});
test("selection resolution fills only the actual default/fixed options and never substitutes selectable choices", () => {
  const base = {
    productId: ids.product,
    variantId: null,
    bundleSelections: [],
  };
  assert.equal(resolveIntentSelection(product, base)?.variantId, ids.variant);
  assert.equal(
    resolveIntentSelection({ ...product, optionMode: "color" }, base),
    null,
  );
  assert.equal(
    resolveIntentSelection(
      {
        ...product,
        variants: [{ ...product.variants[0], saleEnabled: false }],
      },
      base,
    ),
    null,
  );
  const bundle = {
    ...product,
    kind: "bundle" as const,
    components: [
      {
        id: ids.item,
        productId: ids.product,
        nameTh: "ส่วนประกอบสังเคราะห์",
        quantityPerBundle: 1,
        optionMode: "fixed" as const,
        fixedVariantId: ids.variant,
        allowedVariants: product.variants,
      },
    ],
  };
  assert.deepEqual(resolveIntentSelection(bundle, base)?.bundleSelections, [
    { componentId: ids.item, variantId: ids.variant },
  ]);
  assert.equal(
    resolveIntentSelection(
      {
        ...bundle,
        components: [
          {
            ...bundle.components[0],
            optionMode: "selectable",
            fixedVariantId: null,
          },
        ],
      },
      base,
    ),
    null,
  );
  assert.equal(
    resolveIntentSelection(bundle, {
      ...base,
      bundleSelections: [{ componentId: ids.item, variantId: ids.order }],
    }),
    null,
  );
});
test("owner changes, stale session, closed store, missing selection and blocked storage cannot add", async () => {
  const cases = ["owner", "stale", "closed", "choice", "storage"] as const;
  for (const which of cases) {
    const s = storage();
    writePurchaseIntent(s, {
      ...pending(),
      ...(which === "owner" ? { buyerId: 22 } : {}),
      ...(which === "choice"
        ? {
            selection: {
              productId: ids.product,
              variantId: null,
              bundleSelections: [],
            },
          }
        : {}),
    });
    let adds = 0;
    if (which === "storage")
      s.setItem = () => {
        throw Error("blocked");
      };
    const api = createMerchandiseApi({
      fetcher: async (url) => {
        const p = String(url);
        if (p.endsWith("/store"))
          return json({
            ...store,
            state: which === "closed" ? "closed" : "open",
          });
        if (p.includes("/products/"))
          return json({
            ...product,
            optionMode: which === "choice" ? "color" : "none",
          });
        if (p.endsWith("/cart")) return json(cart);
        adds++;
        return json(cart);
      },
    });
    const r = await resumePurchaseIntent({
      storage: s,
      api,
      eventCode: "PRIS-2026",
      token: "token",
      buyerId: 11,
      isCurrent: () => which !== "stale",
    });
    assert.equal(adds, 0, which);
    assert.notEqual(r.kind, "added", which);
    if (which === "choice") assert.equal(r.kind, "needs_selection");
  }
});
