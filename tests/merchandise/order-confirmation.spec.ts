import { test, expect } from "./live-fixture";
import type { Page } from "@playwright/test";
import type { ProductDto, OrderDetail } from "../../src/types/merchandise";
import { mkdir } from "node:fs/promises";

test("denied confirmation storage blocks the POST instead of losing the recovery key", async ({
  page,
  merchandise,
}) => {
  await review(merchandise, page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("pris_merchandise_order_request:"))
        throw new DOMException("denied", "SecurityError");
      return original.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(
    page.getByText(
      "ไม่สามารถอ่านหรือเก็บข้อมูลคำขอได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์",
      { exact: true },
    ),
  ).toBeVisible();
  expect((await merchandise.command<Stats>("inspect")).orderCount).toBe(0);
});
test("private QR blob is revoked when the order view is left", async ({
  page,
  merchandise,
}) => {
  await page.addInitScript(() => {
    const native = URL.revokeObjectURL.bind(URL);
    const revoked: string[] = [];
    (
      window as unknown as { revokedMerchandiseUrls: string[] }
    ).revokedMerchandiseUrls = revoked;
    URL.revokeObjectURL = (url) => {
      revoked.push(url);
      native(url);
    };
  });
  await review(merchandise, page);
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(qr(page)).toBeVisible();
  const url = await qr(page).getAttribute("src");
  await page.locator("header a").first().click();
  await expect
    .poll(() =>
      page.evaluate(
        (value) =>
          (
            window as unknown as { revokedMerchandiseUrls: string[] }
          ).revokedMerchandiseUrls.includes(value!),
        url,
      ),
    )
    .toBe(true);
});
test("an actual pending provider call keeps confirmed data locked and creates no premature QR", async ({
  page,
  merchandise,
}, info) => {
  await review(merchandise, page, false);
  await merchandise.command("provider", { hold: true });
  try {
    await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
    await expect(
      page.getByText("กำลังเตรียม QR สำหรับออเดอร์เดิม", { exact: true }),
    ).toBeVisible();
    await expect(qr(page)).toHaveCount(0);
    await expect(page.locator("input,textarea")).toHaveCount(0);
    expect((await merchandise.command<Stats>("inspect")).orderCount).toBe(1);
    if (info.project.name === "chromium") {
      await page.setViewportSize({ width: 390, height: 844 });
      await mkdir("docs/verification/merchandise/visual", { recursive: true });
      await page.screenshot({
        path: "docs/verification/merchandise/visual/p09-creating-mobile.png",
      });
    }
  } finally {
    await merchandise.command("releaseProvider");
  }
  await expect(qr(page)).toBeVisible();
  expect((await merchandise.command<Stats>("inspect")).providerCreations).toBe(
    1,
  );
});
test("non-PNG QR responses fail closed and image retry does not create another payment attempt", async ({
  page,
  merchandise,
}) => {
  await review(merchandise, page);
  const pattern = /\/payment-attempts\/[^/]+\/qr$/;
  await page.route(pattern, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ invalid: "synthetic negative transport" }),
    }),
  );
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(
    page.getByText("โหลด QR ไม่สำเร็จ กรุณาตรวจสอบสถานะหรือลองโหลดอีกครั้ง", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(qr(page)).toHaveCount(0);
  await page.unroute(pattern);
  await page
    .getByRole("button", { name: "ลองโหลด QR อีกครั้ง", exact: true })
    .click();
  await expect(qr(page)).toBeVisible();
  expect((await merchandise.command<Stats>("inspect")).providerCreations).toBe(
    1,
  );
});
test("known attempt revision rejection allows a reviewed explicit retry with a fresh key", async ({
  page,
  merchandise,
}) => {
  await review(merchandise, page);
  const keys: string[] = [];
  let rejected = false;
  await page.route(
    /\/api\/v1\/merchandise\/orders\/[^/]+\/payment-attempts$/,
    async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      keys.push(route.request().headers()["idempotency-key"]);
      if (!rejected) {
        rejected = true;
        return route.fulfill({
          status: 409,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: JSON.stringify({
            success: false,
            code: "MERCH_VERSION_CONFLICT",
            error: "Synthetic known rejection before reservation",
            requestId: "test",
          }),
        });
      }
      return route.continue();
    },
  );
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(
    page.getByText(
      "ยังยืนยันผลสร้าง QR ไม่ได้ ระบบจะตรวจสอบออเดอร์เดิม กรุณาตรวจสอบอีกครั้ง",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "สร้าง QR สำหรับออเดอร์นี้",
      exact: true,
    }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "สร้าง QR สำหรับออเดอร์นี้", exact: true })
    .click();
  await expect(qr(page)).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[0] === keys[1]).toBe(false);
  expect((await merchandise.command<Stats>("inspect")).providerCreations).toBe(
    1,
  );
});
async function review(
  merchandise: {
    command<T = unknown>(action: string, payload?: unknown): Promise<T>;
    login(page: Page): Promise<void>;
  },
  page: Page,
  provider = true,
) {
  const { products } = await merchandise.command<{ products: ProductDto[] }>(
    "catalog",
    { banners: 0 },
  );
  const product = products[2];
  await merchandise.command("addCart", {
    productId: product.id,
    variantId: product.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  if (provider) await merchandise.command("provider");
  await merchandise.login(page);
  await page.goto("/th/souvenirs/checkout");
  await expect(
    page.getByRole("heading", { name: "ข้อมูลผู้รับ", exact: true }),
  ).toBeVisible();
  for (const [label, value] of [
    ["ชื่อ–นามสกุลผู้รับ", "ผู้รับทดสอบคำสั่งซื้อ"],
    ["เบอร์โทรผู้รับ", "0812345678"],
    ["ที่อยู่", "99 ที่อยู่ทดสอบเท่านั้น"],
    ["ตำบล/แขวง", "ทดสอบ"],
    ["อำเภอ/เขต", "ทดสอบ"],
    ["จังหวัด", "กรุงเทพมหานคร"],
    ["รหัสไปรษณีย์", "10100"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }),
  ).toBeEnabled();
}
const qr = (page: Page) =>
  page.getByRole("img", { name: /^QR สำหรับชำระเงินคำสั่งซื้อ/ });
type Stats = {
  orderCount: number;
  attemptCount: number;
  providerCreations: number;
};
test("P08 dependency: reviewed address confirms once, creates one private QR and locks all buyer fields", async ({
  page,
  merchandise,
}) => {
  await review(merchandise, page);
  let qrAuthCorrect = false;
  page.on("request", (request) => {
    if (/\/payment-attempts\/[^/]+\/qr$/.test(request.url()))
      qrAuthCorrect =
        request.headers()["authorization"] ===
        `Bearer ${merchandise.buyerToken}`;
  });
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).dblclick();
  await expect(page).toHaveURL(/\/souvenirs\/orders\/[0-9a-f-]+$/);
  await expect(qr(page)).toBeVisible();
  expect(await qr(page).getAttribute("src")).toMatch(/^blob:/);
  expect(qrAuthCorrect).toBe(true);
  await expect(page.locator("input, textarea, select")).toHaveCount(0);
  await expect(page.locator("address")).toContainText(
    "99 ที่อยู่ทดสอบเท่านั้น",
  );
  await expect(
    page.getByRole("button", { name: /แก้ไขข้อมูลผู้รับ/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "ชำระเงินสำเร็จ", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".merch-cart-badge")).toHaveText("0");
  const stats = await merchandise.command<Stats>("inspect");
  expect(stats.orderCount).toBe(1);
  expect(stats.attemptCount).toBe(1);
  expect(stats.providerCreations).toBe(1);
  const orderUrl = page.url();
  await page.reload();
  await expect(qr(page)).toBeVisible();
  expect(page.url()).toBe(orderUrl);
  expect((await merchandise.command<Stats>("inspect")).providerCreations).toBe(
    1,
  );
});
test("lost confirmed-order reply recovers through R41 to the same order without another POST", async ({
  page,
  merchandise,
}) => {
  await review(merchandise, page);
  let confirmations = 0;
  await page.route(
    merchandise.origin + "/api/v1/merchandise/events/PRIS-2026/orders",
    async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      confirmations++;
      await route.fetch();
      await route.abort("failed");
    },
  );
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(qr(page)).toBeVisible();
  expect(confirmations).toBe(1);
  expect((await merchandise.command<Stats>("inspect")).orderCount).toBe(1);
});
test("reload during confirmation recovers the already-created order using key/event metadata only", async ({
  page,
  merchandise,
}) => {
  await review(merchandise, page);
  let reached!: () => void;
  const committed = new Promise<void>((resolve) => {
    reached = resolve;
  });
  let held: import("@playwright/test").Route | null = null;
  await page.route(
    merchandise.origin + "/api/v1/merchandise/events/PRIS-2026/orders",
    async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      await route.fetch();
      held = route;
      reached();
    },
  );
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await committed;
  const saved = await page.evaluate(() => {
    const key = Object.keys(sessionStorage).find((key) =>
      key.startsWith("pris_merchandise_order_request:"),
    )!;
    return JSON.parse(sessionStorage.getItem(key)!);
  });
  expect(Object.keys(saved).sort()).toEqual(["eventCode", "key"]);
  await page.reload();
  if (held)
    await (held as import("@playwright/test").Route).abort().catch(() => {});
  await expect(qr(page)).toBeVisible();
  expect((await merchandise.command<Stats>("inspect")).orderCount).toBe(1);
});
test("unknown R41 not-found retains the original request and never creates a new order", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 0 });
  await merchandise.login(page);
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "pris_merchandise_order_request:1:PRIS-2026",
      JSON.stringify({
        key: "10000000-0000-4000-8000-000000000001",
        eventCode: "PRIS-2026",
      }),
    );
  });
  let posts = 0;
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      request.url().endsWith("/PRIS-2026/orders")
    )
      posts++;
  });
  await page.goto("/th/souvenirs/checkout");
  await expect(
    page.getByRole("heading", { name: "ยังยืนยันผลไม่สำเร็จ", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ตรวจสอบอีกครั้ง", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "ยังยืนยันผลไม่สำเร็จ", exact: true }),
  ).toBeVisible();
  expect(posts).toBe(0);
  expect((await merchandise.command<Stats>("inspect")).orderCount).toBe(0);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          sessionStorage.getItem("pris_merchandise_order_request:1:PRIS-2026")!,
        ).key,
    ),
  ).toBe("10000000-0000-4000-8000-000000000001");
});
test("lost payment-attempt reply reads the known QR and does not request a second provider creation", async ({
  page,
  merchandise,
}) => {
  await review(merchandise, page);
  let calls = 0;
  await page.route(
    /\/api\/v1\/merchandise\/orders\/[^/]+\/payment-attempts$/,
    async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      calls++;
      await route.fetch();
      await route.abort("failed");
    },
  );
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(qr(page)).toBeVisible();
  expect(calls).toBe(1);
  const stats = await merchandise.command<Stats>("inspect");
  expect(stats.orderCount).toBe(1);
  expect(stats.attemptCount).toBe(1);
  expect(stats.providerCreations).toBe(1);
});
test("another account cannot read the confirmed order or its private PNG", async ({
  page,
  merchandise,
}) => {
  await review(merchandise, page);
  let qrUrl = "";
  page.on("request", (request) => {
    if (/\/payment-attempts\/[^/]+\/qr$/.test(request.url()))
      qrUrl = request.url();
  });
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(qr(page)).toBeVisible();
  const response = await page.request.get(qrUrl, {
    headers: { authorization: `Bearer ${merchandise.otherBuyerToken}` },
  });
  expect([403, 404].includes(response.status())).toBe(true);
  await page.evaluate(
    ({ token }) => {
      localStorage.setItem("pris_token", token);
      localStorage.setItem(
        "pris_user",
        JSON.stringify({
          id: 2,
          firstName: "อื่น",
          lastName: "ทดสอบ",
          email: "other@example.test",
        }),
      );
    },
    { token: merchandise.otherBuyerToken },
  );
  await page.reload();
  await expect(
    page.getByText("ไม่พบคำสั่งซื้อที่คุณเข้าถึงได้", { exact: true }),
  ).toBeVisible();
  await expect(qr(page)).toHaveCount(0);
  await expect(
    page.getByText("ผู้รับทดสอบคำสั่งซื้อ", { exact: true }),
  ).toHaveCount(0);
});
test("known server quote failure returns to review instead of creating a stale order", async ({
  page,
  merchandise,
}) => {
  await review(merchandise, page);
  const { cart } = await merchandise.command<{
    cart: { items: { productId: string }[] };
  }>("inspect");
  await merchandise.command("price", {
    id: cart.items[0].productId,
    price: "12000",
  });
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(
    page.getByRole("heading", { name: "ข้อมูลผู้รับ", exact: true }),
  ).toBeVisible();
  expect((await merchandise.command<Stats>("inspect")).orderCount).toBe(0);
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }),
  ).toContainText("฿170.00");
});
test("confirmed order remains readonly while provider outcome is unknown; QR creation is not payment success", async ({
  page,
  merchandise,
}) => {
  await review(merchandise, page, false);
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(page).toHaveURL(/\/souvenirs\/orders\/[0-9a-f-]+$/);
  await expect(
    page.getByText("ข้อมูลถูกล็อกหลังยืนยันคำสั่งซื้อ", { exact: true }),
  ).toBeVisible();
  await expect(qr(page)).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "ชำระเงินสำเร็จ", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("input,textarea")).toHaveCount(0);
});
test("approved enabled review and private-QR layouts render at mobile and desktop widths", async ({
  page,
  merchandise,
}, info) => {
  await review(merchandise, page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  if (info.project.name === "chromium") {
    await mkdir("docs/verification/merchandise/visual", { recursive: true });
    await page.screenshot({
      path: "docs/verification/merchandise/visual/p09-enabled-review-mobile.png",
    });
  }
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(qr(page)).toBeVisible();
  for (const [name, width, height] of [
    ["mobile", 390, 844],
    ["tablet", 834, 1112],
    ["desktop", 1440, 1000],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await page.evaluate(() => scrollTo(0, 0));
    if (info.project.name === "chromium")
      await page.screenshot({
        path: `docs/verification/merchandise/visual/p09-qr-${name}.png`,
      });
  }
  const id = new URL(page.url()).pathname.split("/").at(-1)!;
  const response = await page.request.get(
    merchandise.origin + `/api/v1/merchandise/orders/${id}`,
    { headers: { authorization: `Bearer ${merchandise.buyerToken}` } },
  );
  const data = (await response.json()).data as OrderDetail;
  expect(data.paymentStatus).toBe("pending");
});
