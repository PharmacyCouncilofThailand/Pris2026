import { randomUUID } from "node:crypto";
import type { BrowserContext, Route } from "@playwright/test";
import type {
  CartDto,
  CartItemInput,
  CartLine,
  OrderDetail,
  PaymentView,
  ProductDto,
  Recipient,
  StoreDto,
} from "../../src/types/merchandise";
import { makeOrder, makeStore, qrActive } from "./data";

export interface RecordedCall {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
}
type Failure = { status: number; body?: unknown } | "network";
interface Pending {
  method: string;
  pattern: string | RegExp;
  response: Failure;
}
type Reply = { status: number; body: unknown };

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers":
    "Content-Type, Authorization, Idempotency-Key",
  "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
};
const BASE = "/api/v1/merchandise";
const EVENT = `${BASE}/events/PRIS-2026`;

export class FakeMerchApi {
  store: StoreDto = makeStore();
  products: ProductDto[] = [];
  cart: CartDto;
  orders = new Map<string, OrderDetail>();
  calls: RecordedCall[] = [];
  private pending: Pending[] = [];
  private versionSeq = 0;
  private orderSeq = 0;
  private keys = new Map<string, { fingerprint: string; orderId: string }>();

  constructor() {
    this.cart = this.emptyCart();
  }

  private emptyCart(): CartDto {
    return {
      cartVersion: this.nextVersion(),
      items: [],
      amounts: null,
      buyerDefaults: {
        fullName: "ผู้ซื้อ สังเคราะห์",
        phone: null,
        email: "buyer@example.test",
      },
      serverNow: new Date().toISOString(),
    };
  }
  private nextVersion() {
    return `v${++this.versionSeq}`;
  }
  private touchCart() {
    const items = this.cart.items;
    const ok = items.length > 0 && items.every((l) => l.valid);
    const subtotal = items.reduce((s, l) => s + (l.lineTotalMinor ?? 0), 0);
    this.cart = {
      ...this.cart,
      cartVersion: this.nextVersion(),
      amounts: ok
        ? {
            subtotalMinor: subtotal,
            shippingMinor: 5000,
            totalMinor: subtotal + 5000,
            currency: "THB",
          }
        : null,
      serverNow: new Date().toISOString(),
    };
  }

  failNext(method: string, pathPattern: string | RegExp, response: Failure) {
    this.pending.push({
      method: method.toUpperCase(),
      pattern: pathPattern,
      response,
    });
  }

  setPayment(orderId: string, view: Partial<PaymentView>) {
    const o = this.orders.get(orderId);
    if (!o) throw new Error(`FakeMerchApi: unknown order ${orderId}`);
    o.payment = { ...o.payment, ...view };
    if (view.state === "paid") {
      o.paymentStatus = "paid";
      o.paidAt = o.paidAt ?? new Date().toISOString();
    }
  }

  async install(context: BrowserContext, origin: string) {
    await context.route(`${origin}/**`, (route) => this.handle(route));
  }

  private failure(
    status: number,
    code: string,
    error: string,
    details?: Record<string, unknown>,
  ): Reply {
    return {
      status,
      body: {
        success: false,
        code,
        error,
        requestId: randomUUID(),
        ...(details ? { details } : {}),
      },
    };
  }
  private ok(data: unknown): Reply {
    return { status: 200, body: { success: true, data } };
  }

  private async handle(route: Route) {
    const req = route.request();
    const method = req.method();
    const url = new URL(req.url());
    const path = url.pathname;
    const send = (status: number, body?: unknown) =>
      route.fulfill({
        status,
        headers: CORS,
        ...(body === undefined
          ? { body: "" }
          : { contentType: "application/json", body: JSON.stringify(body) }),
      });
    if (method === "OPTIONS") return send(204);

    let body: unknown = null;
    const raw = req.postData();
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    }
    this.calls.push({ method, path, headers: req.headers(), body });

    const idx = this.pending.findIndex(
      (p) =>
        p.method === method &&
        (typeof p.pattern === "string"
          ? path.includes(p.pattern)
          : p.pattern.test(path)),
    );
    if (idx >= 0) {
      const [p] = this.pending.splice(idx, 1);
      if (p.response === "network") return route.abort("failed");
      return send(p.response.status, p.response.body);
    }

    if (path === "/auth/sso-verify" || path.startsWith("/api/auth/")) {
      return send(200, { success: true });
    }
    const r = path.startsWith(BASE)
      ? this.dispatch(method, path, url, req.headers(), body)
      : null;
    if (r) return send(r.status, r.body);
    const f = this.failure(
      404,
      "MERCH_NOT_FOUND",
      `ไม่พบเส้นทาง ${method} ${path}`,
    );
    return send(f.status, f.body);
  }

  private dispatch(
    method: string,
    path: string,
    url: URL,
    headers: Record<string, string>,
    body: unknown,
  ): Reply | null {
    const m = (re: RegExp) => path.match(re);
    if (method === "GET" && path === `${EVENT}/store`)
      return this.ok(this.store);
    if (method === "GET" && path === `${EVENT}/products`) {
      let items = this.products;
      const kind = url.searchParams.get("kind");
      const cat = url.searchParams.get("categoryId");
      if (kind) items = items.filter((p) => p.kind === kind);
      if (cat) items = items.filter((p) => p.categoryId === cat);
      return this.ok(this.paged(items, url, 100));
    }
    let g = m(new RegExp(`^${EVENT}/products/([^/]+)$`));
    if (method === "GET" && g) {
      const p = this.products.find((x) => x.id === g![1]);
      return p
        ? this.ok(p)
        : this.failure(404, "MERCH_PRODUCT_NOT_FOUND", "ไม่พบสินค้า");
    }
    if (method === "GET" && path === `${EVENT}/cart`) return this.ok(this.cart);
    if (method === "POST" && path === `${EVENT}/cart/items`)
      return this.addItem(body as CartItemInput);
    g = m(new RegExp(`^${EVENT}/cart/items/([^/]+)$`));
    if (g && (method === "PATCH" || method === "DELETE"))
      return this.editItem(method, g[1], body);
    if (method === "POST" && path === `${EVENT}/orders`)
      return this.createOrder(headers, body);
    if (method === "GET" && path === `${EVENT}/orders`) {
      const all = [...this.orders.values()].reverse().map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        paymentStatus: o.paymentStatus,
        paidAt: o.paidAt,
        shipping: o.shipping,
        amounts: o.amounts,
      }));
      return this.ok(this.paged(all, url, 20));
    }
    g = m(
      new RegExp(`^${BASE}/orders/([^/]+)(?:/(payment-checks|payment-attempts))?$`),
    );
    if (g) {
      const o = this.orders.get(g[1]);
      if (!o)
        return this.failure(404, "MERCH_ORDER_NOT_FOUND", "ไม่พบคำสั่งซื้อ");
      if (method === "GET" && !g[2]) return this.ok(o);
      if (method === "POST" && g[2]) return this.ok({ payment: o.payment });
    }
    return null;
  }

  private paged<T>(all: T[], url: URL, defLimit: number) {
    const limit = Number(url.searchParams.get("limit") ?? defLimit);
    const page = Number(url.searchParams.get("page") ?? 1);
    return {
      items: all.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: all.length,
        totalPages: Math.max(1, Math.ceil(all.length / limit)),
      },
    };
  }

  private addItem(input: CartItemInput): Reply {
    const product = this.products.find((p) => p.id === input?.productId);
    if (!product)
      return this.failure(404, "MERCH_PRODUCT_NOT_FOUND", "ไม่พบสินค้า");
    const sig = (l: CartItemInput | CartLine) =>
      JSON.stringify([
        l.productId,
        l.variantId,
        [...l.bundleSelections].sort((a, b) =>
          a.componentId.localeCompare(b.componentId),
        ),
      ]);
    const existing = this.cart.items.find((l) => sig(l) === sig(input));
    if (existing) {
      existing.quantity += input.quantity;
      this.reprice(existing);
    } else {
      const line: CartLine = {
        id: randomUUID(),
        productId: input.productId,
        variantId: input.variantId,
        bundleSelections: input.bundleSelections,
        quantity: input.quantity,
        product,
        unitPriceMinor: null,
        lineTotalMinor: null,
        valid: true,
        issueCodes: [],
      };
      this.reprice(line);
      this.cart.items.push(line);
    }
    this.touchCart();
    return this.ok(this.cart);
  }

  private editItem(method: string, id: string, body: unknown): Reply {
    const i = this.cart.items.findIndex((l) => l.id === id);
    if (i < 0)
      return this.failure(
        404,
        "MERCH_CART_ITEM_NOT_FOUND",
        "ไม่พบรายการในตะกร้า",
      );
    if (method === "DELETE") this.cart.items.splice(i, 1);
    else {
      const patch = (body ?? {}) as {
        quantity?: number;
        variantId?: string | null;
        bundleSelections?: CartLine["bundleSelections"];
      };
      const line = this.cart.items[i];
      if (patch.quantity !== undefined) line.quantity = patch.quantity;
      if (patch.variantId !== undefined) line.variantId = patch.variantId;
      if (patch.bundleSelections !== undefined)
        line.bundleSelections = patch.bundleSelections;
      this.reprice(line);
    }
    this.touchCart();
    return this.ok(this.cart);
  }

  private reprice(line: CartLine) {
    const p = line.product;
    let unit: number | null = null;
    if (p) {
      if (p.kind === "bundle") unit = p.price?.amountMinor ?? null;
      else {
        const v =
          p.variants.find((x) => x.id === line.variantId) ??
          (p.variants.length === 1 && !p.hasOptions ? p.variants[0] : undefined);
        unit = v && v.saleEnabled ? v.priceMinor : null;
      }
    }
    line.unitPriceMinor = unit;
    line.lineTotalMinor = unit === null ? null : unit * line.quantity;
    line.valid = unit !== null && !!p?.purchasable;
    line.issueCodes = line.valid ? [] : ["MERCH_ITEM_UNAVAILABLE"];
  }

  private createOrder(headers: Record<string, string>, body: unknown): Reply {
    const key = headers["idempotency-key"];
    if (!key || !/^[A-Za-z0-9_-]{1,100}$/.test(key))
      return this.failure(400, "VALIDATION_ERROR", "ข้อมูลไม่ถูกต้อง", {
        fieldErrors: {
          "Idempotency-Key": ["ต้องเป็นอักขระ A-Z a-z 0-9 _ - ยาว 1-100 ตัว"],
        },
      });
    const b = (body ?? {}) as { cartVersion?: string; recipient?: Recipient };
    const fingerprint = JSON.stringify(b);
    const prior = this.keys.get(key);
    if (prior) {
      if (prior.fingerprint !== fingerprint)
        return this.failure(
          422,
          "MERCH_IDEMPOTENCY_KEY_REUSED",
          "คีย์นี้ถูกใช้กับคำขอที่ต่างกัน",
        );
      return {
        status: 201,
        body: {
          success: true,
          data: { order: this.orders.get(prior.orderId)!, replayed: true },
        },
      };
    }
    if (this.store.state !== "open")
      return this.failure(
        409,
        "MERCH_PREORDER_CLOSED",
        "ปิดรับพรีออเดอร์แล้ว",
      );
    if (b.cartVersion !== this.cart.cartVersion)
      return this.failure(
        409,
        "MERCH_CART_CHANGED",
        "ตะกร้ามีการเปลี่ยนแปลง กรุณาตรวจสอบอีกครั้ง",
      );
    if (this.cart.items.length === 0)
      return this.failure(422, "MERCH_CART_EMPTY", "ตะกร้าว่าง");
    if (!this.cart.amounts)
      return this.failure(
        422,
        "MERCH_CART_INVALID",
        "ตะกร้ามีรายการที่ใช้ไม่ได้",
        {
          items: this.cart.items
            .filter((l) => !l.valid)
            .map((l) => ({
              id: l.id,
              productId: l.productId,
              issueCodes: l.issueCodes,
            })),
        },
      );
    const id = randomUUID();
    const order = makeOrder({
      id,
      orderNumber: `PRIS2026-M-${String(++this.orderSeq).padStart(6, "0")}`,
      amounts: this.cart.amounts,
      recipient: b.recipient as Recipient,
      items: this.cart.items.map((l) => {
        const v = l.product?.variants.find((x) => x.id === l.variantId);
        return {
          id: randomUUID(),
          kind: l.product?.kind ?? "single",
          nameTh: l.product?.nameTh ?? "",
          sizeTh: v?.sizeTh ?? null,
          colorTh: v?.colorTh ?? null,
          quantity: l.quantity,
          unitPriceMinor: l.unitPriceMinor ?? 0,
          lineTotalMinor: l.lineTotalMinor ?? 0,
          components: [],
        };
      }),
      payment: qrActive(),
    });
    this.orders.set(id, order);
    this.keys.set(key, { fingerprint, orderId: id });
    this.cart = { ...this.emptyCart(), buyerDefaults: this.cart.buyerDefaults };
    return {
      status: 201,
      body: { success: true, data: { order, replayed: false } },
    };
  }
}
