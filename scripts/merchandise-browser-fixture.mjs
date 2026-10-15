// Test-only adapter. Real merchandise routes in an owned schema of the single
// retained local DB; no application endpoint, real merchant or real email.
import { createServer } from "node:http";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { withMerchandiseFixture } from "../../conference-api/src/modules/merchandise/test-support.ts";
import { SIMULATOR_PROOF_VERSION } from "../../conference-api/src/modules/merchandise/payments/config.ts";
import { runMerchandiseJobsOnce } from "../../conference-api/src/modules/merchandise/jobs.ts";
import { settleInquiryResult } from "../../conference-api/src/modules/merchandise/payments/settlement.ts";
import {
  seedMerchandiseCatalog,
  initialDraftProducts,
} from "../../conference-api/src/modules/merchandise/catalog-seed.ts";
const requireApi = createRequire(
  new URL("../../conference-api/package.json", import.meta.url),
);
const sharp = requireApi("sharp");
const QRCode = requireApi("qrcode");
await withMerchandiseFixture(async (f) => {
  await f.sql`UPDATE events SET event_code='PRIS-2026' WHERE id=1`;
  f.eventCode = "PRIS-2026";
  await seedMerchandiseCatalog(f.eventCode, f.sql);
  f.buyerToken = f.app.jwt.sign(
    { id: 1, role: "general", email: "buyer@example.test" },
    { expiresIn: "1h" },
  );
  f.otherBuyerToken = f.app.jwt.sign(
    { id: 2, role: "general", email: "other@example.test" },
    { expiresIn: "1h" },
  );
  const put = f.media.putCatalog.bind(f.media);
  f.media.putCatalog = async (input) => {
    await put(input);
    return `http://127.0.0.1:3103/_fixture-media/${input.eventId}/${encodeURIComponent(input.key)}`;
  };
  let cartReads = 0,
    cartMutations = 0,
    initialized = false,
    metadata = null;
  let releaseProvider = null;
  let providerOptions = {};
  const issuedQr = async (input) => ({
    kind: "issued",
    referenceNo: input.referenceNo,
    orderNo: `SIM-${input.referenceNo}`,
    grossMinor: input.totalMinor,
    rawStatus: "success",
    rawCreatedAt: f.now().toISOString(),
    rawExpiresAt: providerOptions.explicitExpiry
      ? new Date(f.now().getTime() + 600000).toISOString()
      : "",
    qrBytes: await QRCode.toBuffer(`SIMULATION ONLY ${input.referenceNo}`, {
      type: "png",
    }),
    safeErrorCode: null,
  });
  const base = "/api/backoffice/events/1/merchandise",
    headers = { authorization: `Bearer ${f.adminToken}` };
  const admin = async (method, url, payload, key) => {
    const r = await f.http({
      method,
      url: base + url,
      headers: key ? { ...headers, "idempotency-key": key } : headers,
      payload,
    });
    assert(r.statusCode < 400, `${method} ${url}: ${r.statusCode}`);
    return r.json().data;
  };
  const buyerRequest = async (method, url, payload, token = f.buyerToken) => {
    const r = await f.http({
      method,
      url,
      headers: {
        authorization: `Bearer ${token}`,
        ...(method === "POST"
          ? { "idempotency-key": crypto.randomUUID() }
          : {}),
      },
      payload,
    });
    assert(r.statusCode < 400, `Synthetic buyer ${method}: ${r.statusCode}`);
    return r.json().data;
  };
  async function historyOrder(product, token = f.buyerToken) {
    const root = "/api/v1/merchandise/events/PRIS-2026";
    const cart = await buyerRequest("GET", `${root}/cart`, undefined, token);
    const added = await buyerRequest(
      "POST",
      `${root}/cart/items`,
      {
        productId: product.id,
        variantId: product.kind === "bundle" ? null : product.variants[0].id,
        bundleSelections: [],
        quantity: 1,
        expectedRevision: cart.revision,
      },
      token,
    );
    const quote = await buyerRequest(
      "POST",
      `${root}/checkout-quotes`,
      { expectedCartRevision: added.revision, recipient: f.recipient },
      token,
    );
    return (
      await buyerRequest(
        "POST",
        `${root}/orders`,
        {
          expectedCartRevision: added.revision,
          quoteToken: quote.quoteToken,
          recipient: f.recipient,
        },
        token,
      )
    ).order;
  }
  async function image(purpose, width, height, label) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#e3edfa"/><text x="50%" y="50%" font-family="sans-serif" font-size="${purpose === "banner" ? 34 : 14}" fill="#334c72" text-anchor="middle">${label}</text></svg>`;
    const pixels = await sharp(Buffer.from(svg)).png().toBuffer(),
      boundary = "synthetic-fixture-image";
    const r = await f.http({
      method: "POST",
      url: base + "/images",
      headers: {
        ...headers,
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: Buffer.concat([
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="purpose"\r\n\r\n${purpose}\r\n--${boundary}\r\nContent-Disposition: form-data; name="altTh"\r\n\r\nภาพสังเคราะห์สำหรับทดสอบเท่านั้น\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="fixture.png"\r\nContent-Type: image/png\r\n\r\n`,
        ),
        pixels,
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]),
    });
    assert.equal(r.statusCode, 201);
    return r.json().data.id;
  }
  async function catalog(options = {}) {
    if (initialized) return metadata;
    await admin("PATCH", "/store", {
      expectedVersion: 0,
      enabled: true,
      preorderOpensAt: "2026-10-14T03:00:00Z",
      preorderClosesAt: "2026-10-14T05:00:00Z",
      productionInfoTh: null,
      shippingInfoTh: null,
    });
    const category = await admin("POST", "/categories", {
      nameTh: "หมวดสังเคราะห์",
      sortOrder: 0,
      visible: true,
    });
    const imageId = await image("product", 320, 320, "SYNTHETIC PRODUCT");
    const products = [];
    for (const [index, [, nameTh]] of initialDraftProducts.entries())
      products.push(
        await f.publishSingle({
          kind: "single",
          nameTh,
          descriptionTh: "ข้อมูลสังเคราะห์สำหรับทดสอบ ไม่ใช่ข้อมูลขายจริง",
          sizeInfoTh: null,
          imageIds: [imageId],
          categoryId: category.id,
          sortOrder: index,
          optionMode: "none",
          basePriceMinor: "10000",
        }),
      );
    let bundle = await admin("POST", "/products", {
      kind: "bundle",
      nameTh: "ชุดสินค้าสังเคราะห์",
      descriptionTh: "ข้อมูลทดสอบเท่านั้น",
      sizeInfoTh: null,
      imageIds: [imageId],
      categoryId: null,
      sortOrder: 20,
      optionMode: "none",
      basePriceMinor: "22000",
    });
    bundle = await admin("PUT", `/products/${bundle.id}/components`, {
      expectedVersion: bundle.version,
      components: [products[2], products[4]].map((p, i) => ({
        productId: p.id,
        quantityPerBundle: 1,
        optionMode: "fixed",
        fixedVariantId: p.variants[0].id,
        allowedVariantIds: [],
        sortOrder: i,
      })),
    });
    bundle = await admin("POST", `/products/${bundle.id}/state`, {
      expectedVersion: bundle.version,
      publishState: "published",
      saleEnabled: true,
    });
    for (let n = 0; n < (options.banners ?? 1); n++) {
      const id = await image("banner", 1200, 500, `SYNTHETIC BANNER ${n + 1}`);
      await admin("POST", "/banners", {
        imageId: id,
        mobileImageId: null,
        destination: null,
        active: true,
        sortOrder: n,
      });
    }
    initialized = true;
    return (metadata = { category, products, bundle });
  }
  async function variantCatalog() {
    const current = await catalog({ banners: 0 });
    const common = {
      descriptionTh: "รายละเอียดสังเคราะห์\n<script>ไม่ใช่ HTML</script>",
      sizeInfoTh: "ข้อมูลขนาดสังเคราะห์",
      imageIds: [current.products[0].images[0].id],
      categoryId: null,
      sortOrder: 30,
    };
    let product = await admin("POST", "/products", {
      ...common,
      kind: "single",
      nameTh: "สินค้าตัวเลือกสังเคราะห์",
      optionMode: "size_color",
      basePriceMinor: "10000",
    });
    product = await admin("PUT", `/products/${product.id}/variants`, {
      expectedVersion: product.version,
      variants: [
        {
          sizeTh: "M",
          colorTh: "น้ำเงิน",
          isDefault: false,
          saleEnabled: true,
          priceOverrideMinor: null,
        },
        {
          sizeTh: "L",
          colorTh: "น้ำเงิน",
          isDefault: false,
          saleEnabled: true,
          priceOverrideMinor: "15000",
        },
        {
          sizeTh: "M",
          colorTh: "ส้ม",
          isDefault: false,
          saleEnabled: true,
          priceOverrideMinor: "13000",
        },
        {
          sizeTh: "L",
          colorTh: "ส้ม",
          isDefault: false,
          saleEnabled: false,
          priceOverrideMinor: null,
        },
      ],
    });
    product = await admin("POST", `/products/${product.id}/state`, {
      expectedVersion: product.version,
      publishState: "published",
      saleEnabled: true,
    });
    let bundle = await admin("POST", "/products", {
      ...common,
      kind: "bundle",
      nameTh: "ชุดเลือกตัวเลือกสังเคราะห์",
      optionMode: "none",
      basePriceMinor: "22000",
    });
    bundle = await admin("PUT", `/products/${bundle.id}/components`, {
      expectedVersion: bundle.version,
      components: [
        {
          productId: current.products[2].id,
          quantityPerBundle: 2,
          optionMode: "fixed",
          fixedVariantId: current.products[2].variants[0].id,
          allowedVariantIds: [],
          sortOrder: 0,
        },
        {
          productId: product.id,
          quantityPerBundle: 1,
          optionMode: "selectable",
          fixedVariantId: null,
          allowedVariantIds: product.variants
            .filter((v) => v.saleEnabled)
            .map((v) => v.id),
          sortOrder: 1,
        },
      ],
    });
    bundle = await admin("POST", `/products/${bundle.id}/state`, {
      expectedVersion: bundle.version,
      publishState: "published",
      saleEnabled: true,
    });
    return { product, bundle, noOptions: current.products[2] };
  }
  const server = createServer(async (req, res) => {
    const origin = req.headers.origin;
    if (origin && !/^http:\/\/(127\.0\.0\.1|localhost):3102$/.test(origin)) {
      res.writeHead(403).end();
      return;
    }
    res.setHeader(
      "access-control-allow-origin",
      origin ?? "http://127.0.0.1:3102",
    );
    res.setHeader(
      "access-control-allow-methods",
      "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    );
    res.setHeader(
      "access-control-allow-headers",
      "Authorization,Content-Type,Idempotency-Key",
    );
    res.setHeader("cache-control", "no-store");
    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }
    try {
      const url = new URL(req.url, "http://127.0.0.1:3103");
      if (req.method === "GET" && url.pathname.startsWith("/_fixture-media/")) {
        const [eventId, ...tail] = url.pathname
          .slice("/_fixture-media/".length)
          .split("/");
        const bytes = f.media.catalog.get(
          `${eventId}/${decodeURIComponent(tail.join("/"))}`,
        );
        if (!bytes) {
          res.writeHead(404).end();
          return;
        }
        res.setHeader("content-type", "image/png");
        res.end(bytes);
        return;
      }
      if (req.method === "GET" && url.pathname.endsWith("/cart")) cartReads++;
      if (req.method === "POST" && url.pathname.endsWith("/cart/items"))
        cartMutations++;
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const result = await f.http({
        method: req.method,
        url: req.url,
        headers: req.headers,
        ...(chunks.length ? { payload: Buffer.concat(chunks) } : {}),
      });
      for (const [name, value] of Object.entries(result.headers))
        if (value !== undefined) res.setHeader(name, value);
      res.writeHead(result.statusCode);
      res.end(result.rawPayload);
    } catch {
      res.writeHead(500, { "content-type": "application/json" }).end(
        JSON.stringify({
          success: false,
          code: "FIXTURE_FAILURE",
          error: "Local synthetic fixture failed",
        }),
      );
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(3103, "127.0.0.1", resolve);
  });
  process.send({
    ready: true,
    origin: "http://127.0.0.1:3103",
    buyerToken: f.buyerToken,
    otherBuyerToken: f.otherBuyerToken,
  });
  await new Promise((resolve) => {
    const close = () => {
      server.close(resolve);
      server.closeAllConnections();
    };
    process.on("message", async (message) => {
      if (message === "close") {
        close();
        return;
      }
      const { id, action, payload } = message;
      try {
        let data;
        if (action === "catalog") data = await catalog(payload);
        else if (action === "historySetup") {
          const current = await catalog({ banners: 0 }),
            count = payload?.count ?? 3;
          assert(Number.isInteger(count) && count > 0 && count <= 25);
          const orders = [];
          for (let index = 0; index < count; index++) {
            let order = await historyOrder(
              index === 1
                ? current.bundle
                : current.products[index % current.products.length],
            );
            if (!payload?.pendingOnly && index < 2) {
              f.provider.createQr = async (input) => {
                f.provider.creations.push(structuredClone(input));
                return issuedQr(input);
              };
              const result = await buyerRequest(
                "POST",
                `/api/v1/merchandise/orders/${order.id}/payment-attempts`,
                { expectedOrderRevision: order.effectiveRevision },
              );
              f.setNow(new Date(f.now().getTime() + 2000).toISOString());
              await settleInquiryResult(f.deps, result.payment.attempt.id, {
                kind: "paid",
                completeness: "complete",
                evidences: [
                  {
                    merchantIdentity: f.deps.paymentConfig.merchantIdentity,
                    referenceNo: result.payment.attempt.referenceNo,
                    orderNo: result.payment.attempt.orderNo,
                    transactionId: `SIM-HISTORY-${order.id}`,
                    paymentIdentity: `SIM-HISTORY-PAY-${order.id}`,
                    grossMinor: order.amounts.totalMinor,
                    currency: "THB",
                    rawStatus: "CP",
                    paidAt: f.now().toISOString(),
                  },
                ],
              });
              order = await buyerRequest(
                "GET",
                `/api/v1/merchandise/orders/${order.id}`,
              );
              assert.equal(order.paymentStatus, "paid");
              if (index === 1) {
                await admin(
                  "POST",
                  `/orders/${order.id}/shipments`,
                  {
                    expectedVersion: order.fulfillment.version,
                    carrier: "บริษัทขนส่งทดสอบ",
                    trackingId: "0000123456789",
                  },
                  crypto.randomUUID(),
                );
                order = await buyerRequest(
                  "GET",
                  `/api/v1/merchandise/orders/${order.id}`,
                );
              }
            }
            orders.push(order);
            f.setNow(new Date(f.now().getTime() + 2000).toISOString());
          }
          const other =
            payload?.includeOther === false
              ? null
              : await historyOrder(current.products[0], f.otherBuyerToken);
          data = { orders, other };
        } else if (action === "amendRecipient") {
          const order = await buyerRequest(
              "GET",
              `/api/v1/merchandise/orders/${payload.id}`,
            ),
            reason = "แก้ที่อยู่ตามคำขอผู้ซื้อในการทดสอบ";
          const quote = await admin(
            "POST",
            `/orders/${order.id}/revision-quotes`,
            {
              expectedRevision: order.effectiveRevision,
              reason,
              recipient: {
                ...order.effective.recipient,
                fullName: "ผู้รับแก้ไขทดสอบ",
                addressLine: "2 ที่อยู่แก้ไขทดสอบ",
              },
              lines: order.effective.items.map((item) => ({
                sourceItemId: item.id,
                quantity: item.quantity,
              })),
            },
          );
          assert.equal(quote.allowed, true);
          await admin(
            "POST",
            `/orders/${order.id}/revisions`,
            {
              expectedRevision: order.effectiveRevision,
              reason,
              revisionToken: quote.revisionToken,
            },
            crypto.randomUUID(),
          );
          data = await buyerRequest(
            "GET",
            `/api/v1/merchandise/orders/${order.id}`,
          );
        } else if (action === "ship") {
          const order = await buyerRequest(
            "GET",
            `/api/v1/merchandise/orders/${payload.id}`,
          );
          data = await admin(
            "POST",
            `/orders/${order.id}/shipments`,
            {
              expectedVersion: order.fulfillment.version,
              carrier: payload.carrier,
              trackingId: payload.trackingId,
            },
            crypto.randomUUID(),
          );
        } else if (action === "variantCatalog") data = await variantCatalog();
        else if (action === "provider") {
          providerOptions = payload ?? {};
          f.provider.createQr = async (input) => {
            f.provider.creations.push(structuredClone(input));
            if (payload?.hold)
              await new Promise((resolve) => {
                releaseProvider = resolve;
              });
            return issuedQr(input);
          };
          data = { simulated: true };
        } else if (action === "clock") {
          f.setNow(payload.now);
          data = { now: f.now().toISOString() };
        } else if (action === "disableStore") {
          const settings = await admin("GET", "/store");
          data = await admin("PATCH", "/store", {
            expectedVersion: settings.version,
            enabled: false,
            preorderOpensAt: settings.preorderOpensAt,
            preorderClosesAt: settings.preorderClosesAt,
            productionInfoTh: settings.productionInfoTh,
            shippingInfoTh: settings.shippingInfoTh,
          });
        } else if (action === "work") {
          data = await runMerchandiseJobsOnce(f.deps);
        } else if (action === "inquiry") {
          f.provider.inquire = async (input) => {
            f.provider.inquiries.push(structuredClone(input));
            if (payload.kind === "unpaid")
              return {
                kind: "definitively_unpaid",
                proofVersion: SIMULATOR_PROOF_VERSION,
                checkedAt: f.now().toISOString(),
              };
            if (payload.kind === "review_required")
              return {
                kind: "review_required",
                reason: "SYNTHETIC_REVIEW_REQUIRED",
              };
            if (payload.kind !== "paid")
              return { kind: "unknown", reason: "SYNTHETIC_UNAVAILABLE" };
            const [row] =
              await f.sql`SELECT o.total_minor FROM merch_orders o JOIN merch_payment_attempts p ON p.order_id=o.id WHERE p.reference_no=${input.referenceNo}`;
            return {
              kind: "paid",
              completeness: "complete",
              evidences: [
                {
                  merchantIdentity: input.merchantIdentity,
                  referenceNo: input.referenceNo,
                  orderNo: input.orderNo,
                  transactionId: `SIM-${input.referenceNo}`,
                  paymentIdentity: `SIM-PAY-${input.referenceNo}`,
                  grossMinor: String(row.total_minor),
                  currency: "THB",
                  rawStatus: "CP",
                  paidAt: payload.paidAt ?? f.now().toISOString(),
                },
              ],
            };
          };
          data = { simulated: true };
        } else if (action === "releaseProvider") {
          releaseProvider?.();
          releaseProvider = null;
          data = { released: true };
        } else if (action === "sale") {
          const product = await admin("GET", `/products/${payload.id}`);
          data = await admin("POST", `/products/${product.id}/state`, {
            expectedVersion: product.version,
            publishState: product.publishState,
            saleEnabled: payload.enabled,
          });
        } else if (action === "addCart") {
          const buyerHeaders = { authorization: `Bearer ${f.buyerToken}` };
          const current = await f.http({
            method: "GET",
            url: "/api/v1/merchandise/events/PRIS-2026/cart",
            headers: buyerHeaders,
          });
          const result = await f.http({
            method: "POST",
            url: "/api/v1/merchandise/events/PRIS-2026/cart/items",
            headers: {
              ...buyerHeaders,
              "idempotency-key": crypto.randomUUID(),
            },
            payload: {
              ...payload,
              expectedRevision: current.json().data.revision,
            },
          });
          assert(
            result.statusCode < 400,
            `Synthetic cart setup ${result.statusCode}`,
          );
          data = result.json().data;
        } else if (action === "confirm") {
          const root = "/api/v1/merchandise/events/PRIS-2026",
            buyerHeaders = { authorization: `Bearer ${f.buyerToken}` };
          const current = (
            await f.http({
              method: "GET",
              url: `${root}/cart`,
              headers: buyerHeaders,
            })
          ).json().data;
          const quote = await f.http({
            method: "POST",
            url: `${root}/checkout-quotes`,
            headers: buyerHeaders,
            payload: {
              expectedCartRevision: current.revision,
              recipient: f.recipient,
            },
          });
          assert.equal(quote.statusCode, 200);
          const result = await f.http({
            method: "POST",
            url: `${root}/orders`,
            headers: {
              ...buyerHeaders,
              "idempotency-key": crypto.randomUUID(),
            },
            payload: {
              expectedCartRevision: current.revision,
              quoteToken: quote.json().data.quoteToken,
              recipient: f.recipient,
            },
          });
          assert.equal(result.statusCode, 201);
          data = result.json().data.order;
        } else if (action === "price") {
          const product = await admin("GET", `/products/${payload.id}`);
          data = await admin("PATCH", `/products/${product.id}`, {
            expectedVersion: product.version,
            kind: product.kind,
            nameTh: payload.name ?? product.nameTh,
            descriptionTh: product.descriptionTh,
            sizeInfoTh: product.sizeInfoTh,
            imageIds: product.images.map((i) => i.id),
            categoryId: product.categoryId,
            sortOrder: product.sortOrder,
            optionMode: product.optionMode,
            basePriceMinor: payload.price,
          });
        } else if (action === "inspect") {
          const r = await f.http({
            method: "GET",
            url: "/api/v1/merchandise/events/PRIS-2026/cart",
            headers: { authorization: `Bearer ${f.buyerToken}` },
          });
          data = {
            cartReads,
            cartMutations,
            unitCount: r.json().data.unitCount,
            attemptCount: Number(
              (
                await f.sql`SELECT count(*) AS count FROM merch_payment_attempts`
              )[0].count,
            ),
            providerCreations: f.provider.creations.length,
            providerInquiries: f.provider.inquiries.length,
            cart: r.json().data,
            orderCount: Number(
              (await f.sql`SELECT count(*) AS count FROM merch_orders`)[0]
                .count,
            ),
          };
        } else if (action === "closeStore") {
          f.setNow("2026-10-14T06:00:00Z");
          data = { closed: true };
        } else throw Error("Unsupported fixture action");
        process.send({ id, data });
      } catch {
        process.send({
          id,
          error: `Synthetic fixture action ${action} failed`,
        });
      }
    });
    process.once("disconnect", close);
  });
});
if (process.connected) process.disconnect();
