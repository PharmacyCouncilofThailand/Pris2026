import test from "node:test";
import assert from "node:assert/strict";
import {
  storeResponse,
  productResponse,
  pageResponse,
  cartResponse,
  orderSummaryResponse,
  orderResponse,
  createOrderResponse,
  paymentResponse,
} from "./merchandiseResponse";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const NOW = "2026-10-16T01:00:00.000Z";
const image = { id: id(1), url: "https://cdn.example.test/a.png", width: 10, height: 10 };
const validStore = {
  eventId: 1,
  eventCode: "PRIS-2026",
  state: "open",
  opensAt: null,
  closesAt: NOW,
  productionInfoTh: null,
  shippingInfoTh: "ส่งภายใน 7 วัน",
  shippingMinor: 5000,
  currency: "THB",
  serverNow: NOW,
  categories: [{ id: id(2), nameTh: "เสื้อ", sortOrder: 1 }],
  banners: [{ id: id(3), image, linkUrl: null }],
};
const variant = {
  id: id(4),
  sizeTh: "M",
  colorTh: null,
  priceMinor: null,
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
  price: { kind: "exact", amountMinor: 25000 },
  purchasable: true,
  unavailableCodes: [],
};
const amounts = { subtotalMinor: 25000, shippingMinor: 5000, totalMinor: 30000, currency: "THB" };
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
      unitPriceMinor: 25000,
      lineTotalMinor: 25000,
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
  attempt: { id: id(7), referenceNo: "R1", expiresAt: NOW, qrPayload: "000201" },
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
  shipping: { status: "not_shipped", carrier: null, trackingId: null, shippedAt: null },
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
      unitPriceMinor: 25000,
      lineTotalMinor: 25000,
      components: [],
    },
  ],
  productionInfoTh: null,
  shippingInfoTh: null,
  payment,
};

test("store", () => {
  assert.equal(storeResponse(validStore), true);
  assert.equal(storeResponse({ ...validStore, shippingMinor: "5000" }), false);
  assert.equal(storeResponse({ ...validStore, state: "unconfigured" }), false);
  assert.equal(storeResponse({ ...validStore, extra: 1 }), true);
});
test("product and page", () => {
  assert.equal(productResponse(product), true);
  assert.equal(
    productResponse({ ...product, price: { kind: "exact", amountMinor: "100" } }),
    false,
  );
  assert.equal(productResponse({ ...product, price: null }), true);
  const page = { items: [product], pagination: { page: 1, limit: 100, total: 1, totalPages: 1 } };
  assert.equal(pageResponse(productResponse)(page), true);
  assert.equal(pageResponse(productResponse)({ ...page, items: [{}] }), false);
});
test("cart", () => {
  assert.equal(cartResponse(cart), true);
  assert.equal(cartResponse({ ...cart, amounts: null }), true);
  assert.equal(cartResponse({ ...cart, amounts: { ...amounts, shippingMinor: 100 } }), false);
});
test("order and payment", () => {
  assert.equal(orderResponse(order), true);
  assert.equal(orderSummaryResponse(order), true);
  assert.equal(
    orderResponse({
      ...order,
      payment: { ...payment, attempt: { ...payment.attempt, qrPayload: null } },
    }),
    false,
  );
  assert.equal(
    orderResponse({
      ...order,
      payment: { ...payment, attempt: { ...payment.attempt, qrPayload: "" } },
    }),
    false,
  );
  assert.equal(orderResponse({ ...order, payment: { ...payment, state: "refunded" } }), false);
  assert.equal(
    orderResponse({ ...order, payment: { ...payment, state: "paid", attempt: null } }),
    true,
  );
  assert.equal(createOrderResponse({ order, replayed: false }), true);
  assert.equal(createOrderResponse({ order }), false);
  assert.equal(paymentResponse({ payment }), true);
  assert.equal(paymentResponse({ payment: { ...payment, state: "refunded" } }), false);
});
