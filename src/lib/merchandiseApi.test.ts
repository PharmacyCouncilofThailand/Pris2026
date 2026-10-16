import test from "node:test";
import assert from "node:assert/strict";
import {
  createMerchandiseApi,
  merchandiseEventBase,
  MerchandiseApiError,
} from "./merchandiseApi";

const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const NOW = "2026-10-16T01:00:00.000Z";
const image = {
  id: id(1),
  url: "https://cdn.example.test/a.png",
  width: 10,
  height: 10,
};
const validStore = {
  eventId: 1,
  eventCode: "PRIS-2026",
  state: "open",
  opensAt: null,
  closesAt: NOW,
  productionInfoTh: null,
  shippingInfoTh: "ส่งภายใน 7 วัน",
  shippingBaht: 50,
  currency: "THB",
  serverNow: NOW,
  categories: [{ id: id(2), nameTh: "เสื้อ", sortOrder: 1 }],
  banners: [{ id: id(3), image, linkUrl: null }],
};
const variant = {
  id: id(4),
  sizeTh: "M",
  colorTh: null,
  priceBaht: null,
  saleEnabled: true,
};
const product = {
  id: id(5),
  kind: "single",
  nameTh: "เสื้อยืด",
  descriptionTh: null,
  sizeChartTh: null,
  images: [image],
  categoryId: id(2),
  sortOrder: 0,
  hasOptions: true,
  variants: [variant],
  components: [],
  price: { kind: "exact", amountBaht: 250 },
  purchasable: true,
  unavailableCodes: [],
};
const amounts = {
  subtotalBaht: 250,
  shippingBaht: 50,
  totalBaht: 300,
  currency: "THB",
};
const cart = {
  cartVersion: "v1",
  items: [
    {
      id: id(6),
      productId: id(5),
      variantId: id(4),
      bundleSelections: [],
      quantity: 1,
      product,
      unitPriceBaht: 250,
      lineTotalBaht: 250,
      valid: true,
      issueCodes: [],
    },
  ],
  amounts,
  buyerDefaults: { fullName: "A B", phone: null, email: "a@b.test" },
  serverNow: NOW,
};
const payment = {
  state: "qr_active",
  attempt: {
    id: id(7),
    referenceNo: "R1",
    expiresAt: NOW,
    qrPayload: "000201",
  },
  canRequestNewQr: false,
  canCheck: true,
  retryAfterSeconds: null,
  serverNow: NOW,
};
const order = {
  id: id(8),
  orderNumber: "PRIS-0001",
  createdAt: NOW,
  paymentStatus: "pending",
  paidAt: null,
  shipping: {
    status: "not_shipped",
    carrier: null,
    trackingId: null,
    shippedAt: null,
  },
  amounts,
  buyer: { name: "A", email: "a@b.test", phone: null },
  recipient: {
    fullName: "A B",
    phone: "0812345678",
    addressLine: "1 ถ.",
    subdistrict: "ก",
    district: "ข",
    province: "ค",
    postalCode: "10110",
    company: null,
    deliveryNote: null,
  },
  items: [
    {
      id: id(9),
      kind: "single",
      nameTh: "เสื้อยืด",
      sizeTh: "M",
      colorTh: null,
      quantity: 1,
      unitPriceBaht: 250,
      lineTotalBaht: 250,
      components: [],
    },
  ],
  productionInfoTh: null,
  shippingInfoTh: null,
  payment,
};

const O = id(8);
type Call = { url: string; init: RequestInit };
function client(respond: (call: Call) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const api = createMerchandiseApi({
    baseUrl: "https://api.example.test/",
    fetcher: async (url, init = {}) => {
      const call = { url: String(url), init };
      calls.push(call);
      return respond(call);
    },
  });
  return { api, calls };
}
const ok = (data: unknown, status = 200) =>
  Response.json({ success: true, data }, { status });
const rejects = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    assert.ok(e instanceof MerchandiseApiError, String(e));
    return e;
  }
  assert.fail("expected rejection");
};
const base = "https://api.example.test/api/v1/merchandise";

test("store is public and event base is validated", async () => {
  const { api, calls } = client(() => ok(validStore));
  assert.equal((await api.store("PRIS-2026")).eventCode, "PRIS-2026");
  assert.equal(calls[0].url, `${base}/events/PRIS-2026/store`);
  assert.equal(new Headers(calls[0].init.headers).has("Authorization"), false);
  assert.equal(calls[0].init.cache, "no-store");
  assert.throws(() => merchandiseEventBase("../x"));
});
test("createOrder sends idempotency key and bearer token", async () => {
  const { api, calls } = client(() => ok({ order, replayed: false }, 201));
  const body = { cartVersion: "v1", recipient: order.recipient };
  const result = await api.createOrder("PRIS-2026", "t", "k-1", body);
  assert.equal(result.replayed, false);
  assert.equal(result.order.id, O);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].url, `${base}/events/PRIS-2026/orders`);
  const h = new Headers(calls[0].init.headers);
  assert.equal(h.get("Idempotency-Key"), "k-1");
  assert.equal(h.get("Authorization"), "Bearer t");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), body);
});
test("createOrder rejects a bad key without calling fetch", async () => {
  const { api, calls } = client(() => ok({ order, replayed: false }));
  await assert.rejects(() =>
    api.createOrder("PRIS-2026", "t", "a b", {
      cartVersion: "v1",
      recipient: order.recipient,
    } as never),
  );
  assert.equal(calls.length, 0);
});
test("network failure is uncertain; 503 uncertain; 409 not", async () => {
  const net = createMerchandiseApi({
    baseUrl: "https://api.example.test",
    fetcher: async () => {
      throw new TypeError("fetch failed");
    },
  });
  const e1 = await rejects(net.cart("PRIS-2026", "t"));
  assert.equal(e1.uncertain, true);
  const e2 = await rejects(
    client(() =>
      Response.json(
        { success: false, code: "X", error: "e", requestId: "r" },
        { status: 503 },
      ),
    ).api.cart("PRIS-2026", "t"),
  );
  assert.equal(e2.status, 503);
  assert.equal(e2.uncertain, true);
  const e3 = await rejects(
    client(() =>
      Response.json(
        {
          success: false,
          code: "MERCH_CART_CHANGED",
          error: "ตะกร้าเปลี่ยน",
          requestId: "r1",
          details: { a: 1 },
        },
        { status: 409 },
      ),
    ).api.cart("PRIS-2026", "t"),
  );
  assert.equal(e3.uncertain, false);
  assert.equal(e3.body.code, "MERCH_CART_CHANGED");
  assert.equal(e3.body.error, "ตะกร้าเปลี่ยน");
  assert.equal(e3.message, "ตะกร้าเปลี่ยน");
  assert.equal(e3.body.requestId, "r1");
  assert.deepEqual(e3.body.details, { a: 1 });
});
test("unparseable failure body falls back by status", async () => {
  const e = await rejects(
    client(() => new Response("<html>", { status: 404 })).api.cart(
      "PRIS-2026",
      "t",
    ),
  );
  assert.equal(e.status, 404);
  assert.equal(e.body.error, "ไม่พบข้อมูลที่ต้องการ");
});
test("caller abort rethrows the AbortError", async () => {
  const ac = new AbortController();
  const api = createMerchandiseApi({
    baseUrl: "https://api.example.test",
    fetcher: async () => {
      ac.abort();
      throw new DOMException("aborted", "AbortError");
    },
  });
  await assert.rejects(
    () => api.cart("PRIS-2026", "t", ac.signal),
    (e: unknown) =>
      !(e instanceof MerchandiseApiError) && (e as Error).name === "AbortError",
  );
});
test("invalid 200 body becomes MERCH_BAD_RESPONSE", async () => {
  const e = await rejects(
    client(() => ok({ nope: 1 })).api.cart("PRIS-2026", "t"),
  );
  assert.equal(e.body.code, "MERCH_BAD_RESPONSE");
  assert.equal(e.uncertain, false);
});
test("products query omits unset filters", async () => {
  const page = {
    items: [product],
    pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
  };
  const { api, calls } = client(() => ok(page));
  await api.products("PRIS-2026", { limit: 100 });
  assert.ok(calls[0].url.endsWith("/products?limit=100"));
  assert.ok(!calls[0].url.includes("search"));
});
test("cart verbs and paths", async () => {
  const { api, calls } = client(() => ok(cart));
  const input = {
    productId: id(5),
    variantId: id(4),
    bundleSelections: [],
    quantity: 1,
  };
  await api.addCartItem("PRIS-2026", "t", input);
  await api.updateCartItem("PRIS-2026", "t", id(6), { quantity: 2 });
  await api.removeCartItem("PRIS-2026", "t", id(6));
  assert.deepEqual(
    calls.map((c) => c.init.method),
    ["POST", "PATCH", "DELETE"],
  );
  assert.equal(calls[0].url, `${base}/events/PRIS-2026/cart/items`);
  assert.equal(calls[1].url, `${base}/events/PRIS-2026/cart/items/${id(6)}`);
  assert.deepEqual(JSON.parse(String(calls[1].init.body)), { quantity: 2 });
  assert.equal(calls[2].init.body, undefined);
  await assert.rejects(() => api.updateCartItem("PRIS-2026", "t", "bad", {}));
});
test("orders, order, payment endpoints", async () => {
  const pay = { payment };
  const { api, calls } = client((c) => {
    if (c.url.includes("/payment-")) return ok(pay);
    if (c.url.includes("/events/"))
      return ok({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    return ok(order);
  });
  await api.orders("PRIS-2026", "t", { page: 2 });
  assert.equal((await api.order("t", O)).id, O);
  await api.requestQr("t", O);
  await api.checkPayment("t", O);
  assert.equal(calls[0].url, `${base}/events/PRIS-2026/orders?page=2`);
  assert.equal(calls[1].url, `${base}/orders/${O}`);
  assert.equal(calls[2].init.method, "POST");
  assert.equal(calls[2].url, `${base}/orders/${O}/payment-attempts`);
  assert.equal(calls[3].init.method, "POST");
  assert.equal(calls[3].url, `${base}/orders/${O}/payment-checks`);
});
test("missing token is a 401 before fetching", async () => {
  const { api, calls } = client(() => ok(cart));
  const e = await rejects(
    Promise.resolve().then(() => api.cart("PRIS-2026", " ")),
  );
  assert.equal(e.status, 401);
  assert.equal(calls.length, 0);
});

test("ngrok warning header is sent only when NEXT_PUBLIC_API_NGROK=1", async () => {
  const saved = process.env.NEXT_PUBLIC_API_NGROK;
  try {
    process.env.NEXT_PUBLIC_API_NGROK = "1";
    const on = client(() => ok(validStore));
    await on.api.store("PRIS-2026");
    assert.equal(
      new Headers(on.calls[0].init.headers).get("ngrok-skip-browser-warning"),
      "true",
    );
    delete process.env.NEXT_PUBLIC_API_NGROK;
    const off = client(() => ok(validStore));
    await off.api.store("PRIS-2026");
    assert.equal(
      new Headers(off.calls[0].init.headers).has("ngrok-skip-browser-warning"),
      false,
    );
  } finally {
    if (saved === undefined) delete process.env.NEXT_PUBLIC_API_NGROK;
    else process.env.NEXT_PUBLIC_API_NGROK = saved;
  }
});
