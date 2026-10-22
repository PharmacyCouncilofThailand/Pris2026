import { test, expect, login } from "./fixtures";
import { makeStore, makeSingle } from "./data";

test("storefront calls the fake store API", async ({ page, fake }) => {
  fake.store = makeStore({ state: "open" });
  fake.products = [makeSingle()];
  await login(page);
  await page.goto("/th/souvenirs");
  await expect
    .poll(() =>
      fake.calls.some(
        (c) => c.method === "GET" && c.path.endsWith("/events/PRIS-2026/store"),
      ),
    )
    .toBe(true);
});

test("order endpoint mirrors API statuses and errors", async ({ page, fake }) => {
  fake.store = makeStore({ state: "open" });
  fake.products = [makeSingle()];
  await page.goto("/th/about");
  const call = (method: string, path: string, body?: unknown, key?: string) =>
    page.evaluate(
      async ([m, p, b, k]) => {
        const r = await fetch(`http://127.0.0.1:3103/api/v1/merchandise${p}`, {
          method: m as string,
          headers: {
            "Content-Type": "application/json",
            ...(k ? { "Idempotency-Key": k as string } : {}),
          },
          body: b ? JSON.stringify(b) : undefined,
        });
        return { status: r.status, json: await r.json() };
      },
      [method, path, body ?? null, key ?? null],
    );
  const ev = "/events/PRIS-2026";
  const recipient = { fullName: "a", phone: "0812345678", addressLine: "x", subdistrict: "x", district: "x", province: "x", postalCode: "10100", company: null, deliveryNote: null };

  const empty = await call("POST", `${ev}/orders`, { cartVersion: fake.cart.cartVersion, recipient }, "k-empty");
  expect(empty.status).toBe(422);
  expect(empty.json.code).toBe("MERCH_CART_EMPTY");

  const add = await call("POST", `${ev}/cart/items`, { productId: fake.products[0].id, variantId: null, bundleSelections: [], quantity: 1 });
  const body = { cartVersion: add.json.data.cartVersion, recipient };
  const noKey = await call("POST", `${ev}/orders`, body);
  expect(noKey.status).toBe(400);
  expect(noKey.json.code).toBe("VALIDATION_ERROR");
  expect(noKey.json.details.fieldErrors["Idempotency-Key"]).toBeTruthy();

  const created = await call("POST", `${ev}/orders`, body, "k-1");
  expect(created.status).toBe(201);
  expect(created.json.data.replayed).toBe(false);
  const replay = await call("POST", `${ev}/orders`, body, "k-1");
  expect(replay.status).toBe(201);
  expect(replay.json.data.replayed).toBe(true);
  expect(replay.json.data.order.id).toBe(created.json.data.order.id);
  const reuse = await call("POST", `${ev}/orders`, { ...body, recipient: { ...recipient, fullName: "b" } }, "k-1");
  expect(reuse.status).toBe(422);
  expect(reuse.json.code).toBe("MERCH_IDEMPOTENCY_KEY_REUSED");
});
