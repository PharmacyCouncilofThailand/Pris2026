import test from "node:test";
import assert from "node:assert/strict";
import {
  createMerchandiseApi,
  merchandiseEventBase,
  MerchandiseApiError,
} from "./merchandiseApi";
import {
  store,
  product,
  cart,
  order,
  quote,
  ids,
  pageOf,
  now,
} from "../../tests/merchandise/data";
test("public store requests use canonical event routes without owner credentials", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const api = createMerchandiseApi({
    baseUrl: "https://api.example.test/",
    fetcher: async (url, init) => {
      calls.push({ url: String(url), init });
      return Response.json({ success: true, data: store });
    },
  });
  assert.deepEqual(await api.store("PRIS-2026"), store);
  assert.equal(
    calls[0].url,
    "https://api.example.test/api/v1/merchandise/events/PRIS-2026/store",
  );
  assert.equal(new Headers(calls[0].init?.headers).has("Authorization"), false);
  assert.equal(calls[0].init?.cache, "no-store");
  assert.equal(calls[0].init?.credentials, "omit");
  assert.equal(
    merchandiseEventBase("PRIS-2026"),
    "/api/v1/merchandise/events/PRIS-2026",
  );
  assert.throws(() => merchandiseEventBase("../other"));
});
function responseApi(body: unknown, status = 200, headers?: HeadersInit) {
  return createMerchandiseApi({
    baseUrl: "https://api.example.test",
    fetcher: async () =>
      typeof body === "string"
        ? new Response(body, { status, headers })
        : Response.json(body, { status }),
  });
}
test("all owner methods preserve canonical verbs, bodies, credentials, CAS and caller-owned intent keys", async () => {
  const requests: { url: string; init: RequestInit }[] = [];
  const api = createMerchandiseApi({
    baseUrl: "https://api.example.test",
    fetcher: async (url, init = {}) => {
      requests.push({ url: String(url), init });
      const path = new URL(String(url)).pathname;
      let result: unknown = cart;
      if (path.endsWith("/checkout-quotes")) result = quote;
      else if (path.endsWith("/payment-attempts"))
        result = {
          orderId: ids.order,
          payment: order.payment,
          replayed: false,
        };
      else if (path.endsWith("/payment-checks"))
        result = {
          orderId: ids.order,
          payment: order.payment,
          coalesced: false,
        };
      else if (path.includes("/order-requests/"))
        result = {
          state: "completed",
          orderId: ids.order,
          error: null,
          serverNow: now,
        };
      else if (path.endsWith("/orders"))
        result =
          init.method === "POST"
            ? { order, replayed: false }
            : pageOf([orderSummary()]);
      else if (path.endsWith("/orders/" + ids.order)) result = order;
      return Response.json({ success: true, data: result });
    },
  });
  const token = "synthetic-account-token",
    signal = new AbortController().signal;
  await api.cart("PRIS-2026", token, signal);
  await api.add(
    "PRIS-2026",
    token,
    {
      productId: ids.product,
      variantId: ids.variant,
      bundleSelections: [],
      quantity: 2,
      expectedRevision: 1,
    },
    "add-intent-1",
    signal,
  );
  await api.update(
    "PRIS-2026",
    token,
    ids.item,
    {
      variantId: ids.variant,
      bundleSelections: [],
      quantity: 3,
      expectedRevision: 1,
    },
    signal,
  );
  await api.remove("PRIS-2026", token, ids.item, 1, signal);
  await api.quote(
    "PRIS-2026",
    token,
    { expectedCartRevision: 1, recipient: quote.recipient },
    signal,
  );
  await api.confirm(
    "PRIS-2026",
    token,
    {
      expectedCartRevision: 1,
      recipient: quote.recipient,
      quoteToken: quote.quoteToken,
    },
    "confirm-intent-1",
    signal,
  );
  await api.orders("PRIS-2026", token, { page: 2, limit: 20 }, signal);
  await api.order(ids.order, token, signal);
  await api.createAttempt(
    ids.order,
    token,
    { expectedOrderRevision: 1 },
    "attempt-intent-1",
    signal,
  );
  await api.checkPayment(ids.order, token, signal);
  await api.orderRequest("PRIS-2026", token, "confirm-intent-1", signal);
  assert.deepEqual(
    requests.map((r) => r.init.method),
    [
      "GET",
      "POST",
      "PATCH",
      "DELETE",
      "POST",
      "POST",
      "GET",
      "GET",
      "POST",
      "POST",
      "GET",
    ],
  );
  assert.deepEqual(
    requests.map((r) => new URL(r.url).pathname),
    [
      "/api/v1/merchandise/events/PRIS-2026/cart",
      "/api/v1/merchandise/events/PRIS-2026/cart/items",
      `/api/v1/merchandise/events/PRIS-2026/cart/items/${ids.item}`,
      `/api/v1/merchandise/events/PRIS-2026/cart/items/${ids.item}`,
      "/api/v1/merchandise/events/PRIS-2026/checkout-quotes",
      "/api/v1/merchandise/events/PRIS-2026/orders",
      "/api/v1/merchandise/events/PRIS-2026/orders",
      `/api/v1/merchandise/orders/${ids.order}`,
      `/api/v1/merchandise/orders/${ids.order}/payment-attempts`,
      `/api/v1/merchandise/orders/${ids.order}/payment-checks`,
      "/api/v1/merchandise/events/PRIS-2026/order-requests/confirm-intent-1",
    ],
  );
  for (const r of requests) {
    assert.equal(
      new Headers(r.init.headers).get("authorization"),
      `Bearer ${token}`,
    );
    assert.equal(r.init.signal, signal);
    assert.equal(r.init.cache, "no-store");
    assert.equal(r.init.credentials, "omit");
    assert.equal(new Headers(r.init.headers).has("X-Merchant-Id"), false);
  }
  assert.equal(
    new Headers(requests[1].init.headers).get("idempotency-key"),
    "add-intent-1",
  );
  assert.equal(
    new Headers(requests[5].init.headers).get("idempotency-key"),
    "confirm-intent-1",
  );
  assert.equal(
    new Headers(requests[8].init.headers).get("idempotency-key"),
    "attempt-intent-1",
  );
  assert.deepEqual(JSON.parse(requests[3].init.body as string), {
    expectedRevision: 1,
  });
});
function orderSummary() {
  const {
    buyer: _buyer,
    original: _original,
    effective: _effective,
    payment: _payment,
    ...summary
  } = order;
  void [_buyer, _original, _effective, _payment];
  return summary;
}
test("catalog filters are encoded and public results reject draft/private fields and mismatched resource identities", async () => {
  let requested = "";
  const api = createMerchandiseApi({
    fetcher: async (url) => {
      requested = String(url);
      return Response.json({ success: true, data: pageOf([product]) });
    },
  });
  await api.products("PRIS-2026", {
    search: "แก้ว & ผ้า",
    categoryId: ids.item,
    kind: "bundle",
    page: 2,
    limit: 20,
  });
  assert.equal(new URL(requested).searchParams.get("search"), "แก้ว & ผ้า");
  for (const value of [
    { ...product, publishState: "draft" },
    { ...product, buyerEmail: "do-not-expose@example.test" },
    { ...product, id: ids.order },
    { ...product, basePriceMinor: 100 },
  ])
    await assert.rejects(
      responseApi({ success: true, data: value }).product(
        "PRIS-2026",
        ids.product,
      ),
      MerchandiseApiError,
    );
  await assert.rejects(
    responseApi({
      success: true,
      data: { ...store, eventCode: "OTHER" },
    }).store("PRIS-2026"),
    MerchandiseApiError,
  );
  await assert.rejects(
    responseApi({ success: true, data: { ...order, id: ids.item } }).order(
      ids.order,
      "token",
    ),
    MerchandiseApiError,
  );
});
test("malformed canonical amounts, times, quantities and paid states fail closed", async () => {
  for (const value of [
    { ...cart, unitCount: "999" },
    { ...cart, items: [{ ...cart.items[0], quantity: 1.5 }] },
    { ...cart, amounts: { ...cart.amounts!, totalMinor: "25001" } },
    { ...cart, serverNow: "2026-02-30T00:00:00Z" },
  ])
    await assert.rejects(
      responseApi({ success: true, data: value }).cart("PRIS-2026", "token"),
      MerchandiseApiError,
    );
  for (const value of [
    { ...order, paymentStatus: "paid" },
    { ...order, payment: { ...order.payment, state: "paid" } },
    { ...order, attempts: [] },
  ])
    await assert.rejects(
      responseApi({ success: true, data: value }).order(ids.order, "token"),
      MerchandiseApiError,
    );
  await assert.rejects(
    responseApi({
      success: true,
      data: { status: "success", orderNo: "synthetic" },
    }).createAttempt(
      ids.order,
      "token",
      { expectedOrderRevision: 1 },
      "intent",
    ),
    MerchandiseApiError,
  );
});
test("error status and conflict metadata survive without rendering raw provider or HTML messages", async () => {
  for (const status of [401, 409, 422, 503])
    await assert.rejects(
      responseApi(
        {
          success: false,
          code: "MERCH_SYNTHETIC_FAILURE",
          error: "<script>private-provider-payload</script>",
          requestId: "req-123",
          details: { resourceVersion: 9 },
        },
        status,
      ).cart("PRIS-2026", "token"),
      (error: unknown) => {
        assert.ok(error instanceof MerchandiseApiError);
        assert.equal(error.status, status);
        assert.equal(error.body.code, "MERCH_SYNTHETIC_FAILURE");
        assert.equal(error.body.details?.resourceVersion, 9);
        assert.doesNotMatch(error.message, /script|private-provider/);
        return true;
      },
    );
  await assert.rejects(
    responseApi("<html>upstream error</html>", 503, {
      "content-type": "text/html",
    }).confirm(
      "PRIS-2026",
      "token",
      {
        expectedCartRevision: 1,
        recipient: quote.recipient,
        quoteToken: quote.quoteToken,
      },
      "intent",
    ),
    (error: unknown) =>
      error instanceof MerchandiseApiError &&
      error.uncertain &&
      !error.message.includes("html"),
  );
  await assert.rejects(
    responseApi("<html>wrong success</html>", 200, {
      "content-type": "text/html",
    }).store("PRIS-2026"),
    MerchandiseApiError,
  );
});
test("owner checks happen before network access; network ambiguity keeps the caller intent recoverable", async () => {
  let count = 0;
  const api = createMerchandiseApi({
    fetcher: async () => {
      count++;
      throw new TypeError("offline");
    },
  });
  await assert.rejects(
    api.cart("PRIS-2026", ""),
    (e: unknown) => e instanceof MerchandiseApiError && e.status === 401,
  );
  assert.equal(count, 0);
  await assert.rejects(
    api.confirm(
      "PRIS-2026",
      "token",
      {
        expectedCartRevision: 1,
        recipient: quote.recipient,
        quoteToken: quote.quoteToken,
      },
      "intent",
    ),
    (e: unknown) =>
      e instanceof MerchandiseApiError &&
      e.uncertain &&
      e.body.code === "MERCH_NETWORK_UNKNOWN",
  );
  assert.throws(
    () =>
      api.add(
        "PRIS-2026",
        "token",
        {
          productId: ids.product,
          variantId: ids.variant,
          bundleSelections: [],
          quantity: 1,
          expectedRevision: 0,
        },
        "../invalid",
      ),
    MerchandiseApiError,
  );
  assert.equal(count, 1);
});
test("QR endpoints are private binary PNGs and never accept JSON or HTML as an image", async () => {
  const bytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aGisAAAAASUVORK5CYII=",
    "base64",
  );
  let request: RequestInit | undefined;
  const api = createMerchandiseApi({
    fetcher: async (_, init) => {
      request = init;
      return new Response(bytes, { headers: { "content-type": "image/png" } });
    },
  });
  assert.equal(
    (await api.qr(ids.order, ids.attempt, "token")).size,
    bytes.length,
  );
  assert.equal(
    new Headers(request?.headers).get("authorization"),
    "Bearer token",
  );
  await assert.rejects(
    responseApi({ success: true, data: {} }).qr(
      ids.order,
      ids.attempt,
      "token",
    ),
    MerchandiseApiError,
  );
  const bad = createMerchandiseApi({
    fetcher: async () =>
      new Response("not a PNG", { headers: { "content-type": "image/png" } }),
  });
  await assert.rejects(
    bad.qr(ids.order, ids.attempt, "token"),
    MerchandiseApiError,
  );
});
