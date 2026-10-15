import { test, expect } from "./live-fixture";
import type { Page } from "@playwright/test";
import type { OrderDetail, ProductDto } from "../../src/types/merchandise";
import { mkdir } from "node:fs/promises";
type Fixture = {
  origin: string;
  buyerToken: string;
  command<T = unknown>(action: string, payload?: unknown): Promise<T>;
  login(page: Page): Promise<void>;
};
const qr = (page: Page) =>
  page.getByRole("img", { name: /^QR สำหรับชำระเงินคำสั่งซื้อ/ });
async function detail(
  f: Fixture,
  page: Page,
  id: string,
): Promise<OrderDetail> {
  const response = await page.request.get(
    `${f.origin}/api/v1/merchandise/orders/${id}`,
    { headers: { authorization: `Bearer ${f.buyerToken}` } },
  );
  expect(response.ok()).toBe(true);
  return (await response.json()).data;
}
async function wake(page: Page) {
  await page.evaluate(() => window.dispatchEvent(new Event("pageshow")));
}
async function start(
  f: Fixture,
  page: Page,
  options: { explicitExpiry?: boolean; now?: string } = {},
) {
  const { products } = await f.command<{ products: ProductDto[] }>("catalog", {
    banners: 0,
  });
  if (options.now) await f.command("clock", { now: options.now });
  const p = products[2];
  await f.command("addCart", {
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  await f.command("provider", options);
  const order = await f.command<OrderDetail>("confirm");
  await f.login(page);
  await page.goto(`/th/souvenirs/orders/${order.id}`);
  await expect(qr(page)).toBeVisible();
  return detail(f, page, order.id);
}
async function checkAndWork(
  f: Fixture,
  page: Page,
  now: string,
  onChecking?: () => Promise<void>,
) {
  await f.command("clock", { now });
  const response = page.waitForResponse(
    (r) =>
      r.request().method() === "POST" && r.url().endsWith("/payment-checks"),
  );
  await page
    .getByRole("button", { name: /^(ตรวจสอบการชำระเงิน|ตรวจสอบอีกครั้ง)$/ })
    .click();
  await response;
  await expect(
    page.getByRole("button", { name: "กำลังตรวจสอบ", exact: true }),
  ).toBeDisabled();
  await expect(page.locator("main.merch-order")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await onChecking?.();
  await f.command("work");
  await wake(page);
}
for (const explicitExpiry of [false, true])
  test(`persisted ${explicitExpiry ? "explicit" : "fallback"} deadline survives reload and locale without another attempt`, async ({
    page,
    merchandise,
  }) => {
    const first = await start(merchandise, page, { explicitExpiry });
    expect(
      Date.parse(first.payment.attempt!.expiresAt!) -
        Date.parse(first.payment.attempt!.providerCreatedAt!),
    ).toBe(600000);
    await merchandise.command("clock", { now: "2026-10-14T03:39:00Z" });
    await page.reload();
    await expect(qr(page)).toBeVisible();
    await expect(page.getByRole("timer")).toContainText(/0[01]:[0-5]\d/);
    await page.goto(`/en/souvenirs/orders/${first.id}`);
    await expect(qr(page)).toBeVisible();
    const next = await detail(merchandise, page, first.id);
    expect(next.payment.attempt!.id).toBe(first.payment.attempt!.id);
    expect(next.payment.attempt!.expiresAt).toBe(
      first.payment.attempt!.expiresAt,
    );
    expect(
      (await merchandise.command<{ providerCreations: number }>("inspect"))
        .providerCreations,
    ).toBe(1);
  });
test("verified expiry reissues a new reference and PNG for the same immutable order", async ({
  page,
  merchandise,
}) => {
  const first = await start(merchandise, page);
  const oldBlob = await qr(page).getAttribute("src");
  let checks = 0;
  page.on("request", (r) => {
    if (r.method() === "POST" && r.url().endsWith("/payment-checks")) checks++;
  });
  await merchandise.command("inquiry", { kind: "unpaid" });
  await checkAndWork(merchandise, page, "2026-10-14T03:40:01Z");
  await expect(page.getByText("QR หมดอายุ", { exact: true })).toBeVisible();
  expect(checks).toBe(1);
  await expect(qr(page)).toHaveCount(0);
  await page
    .getByRole("button", { name: "ขอ QR ใหม่", exact: true })
    .dblclick();
  await expect(qr(page)).toBeVisible();
  const next = await detail(merchandise, page, first.id);
  expect(next.id).toBe(first.id);
  expect(next.effective).toEqual(first.effective);
  expect(next.amounts).toEqual(first.amounts);
  expect(next.payment.attempt!.id).not.toBe(first.payment.attempt!.id);
  expect(next.payment.attempt!.referenceNo).not.toBe(
    first.payment.attempt!.referenceNo,
  );
  expect(await qr(page).getAttribute("src")).not.toBe(oldBlob);
  const stats = await merchandise.command<{
    orderCount: number;
    attemptCount: number;
    providerCreations: number;
  }>("inspect");
  expect(stats.orderCount).toBe(1);
  expect(stats.attemptCount).toBe(2);
  expect(stats.providerCreations).toBe(2);
});
test("an uncertain reissue retains its key when R11 still shows the previous expired attempt", async ({
  page,
  merchandise,
}) => {
  await start(merchandise, page);
  await merchandise.command("inquiry", { kind: "unpaid" });
  await checkAndWork(merchandise, page, "2026-10-14T03:40:01Z");
  const keys: string[] = [];
  await page.route(/\/payment-attempts$/, async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    keys.push(route.request().headers()["idempotency-key"]);
    if (keys.length === 1) return route.abort("failed");
    return route.continue();
  });
  await page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }).click();
  await expect(
    page.getByText(
      "ยังยืนยันผลสร้าง QR ไม่ได้ ระบบจะตรวจสอบออเดอร์เดิม กรุณาตรวจสอบอีกครั้ง",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator("main.merch-order")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }).click();
  await expect(qr(page)).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
  expect(
    (await merchandise.command<{ providerCreations: number }>("inspect"))
      .providerCreations,
  ).toBe(2);
});
test("an active pre-close QR stays payable after closing and accepts verified in-time payment", async ({
  page,
  merchandise,
}) => {
  const first = await start(merchandise, page, { now: "2026-10-14T04:59:00Z" });
  await merchandise.command("clock", { now: "2026-10-14T05:01:00Z" });
  await page.reload();
  await expect(qr(page)).toBeVisible();
  await merchandise.command("inquiry", {
    kind: "paid",
    paidAt: "2026-10-14T05:00:30Z",
  });
  await checkAndWork(merchandise, page, "2026-10-14T05:01:02Z");
  await expect(
    page.getByRole("heading", { name: "ชำระเงินสำเร็จ", exact: true }),
  ).toBeVisible();
  await expect(qr(page)).toHaveCount(0);
  expect((await detail(merchandise, page, first.id)).paidAt).toBe(
    "2026-10-14T05:00:30.000Z",
  );
  await expect(
    page.getByRole("button", { name: /ขอ QR ใหม่|ตรวจสอบการชำระเงิน/ }),
  ).toHaveCount(0);
});
test("closed and expired only shows the exact closure message after verified-unpaid evidence", async ({
  page,
  merchandise,
}) => {
  await start(merchandise, page);
  await merchandise.command("inquiry", { kind: "unknown" });
  await checkAndWork(merchandise, page, "2026-10-14T06:00:00Z");
  await expect(
    page.getByText("ตรวจสอบสถานะไม่สำเร็จ กรุณาลองตรวจสอบอีกครั้ง", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว", {
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
  ).toHaveCount(0);
  await merchandise.command("inquiry", { kind: "unpaid" });
  await checkAndWork(merchandise, page, "2026-10-14T06:00:05Z");
  await expect(
    page.getByText("หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
  ).toHaveCount(0);
});
test("transport failure hides the old QR and offers checking only until a verified result", async ({
  page,
  merchandise,
}) => {
  await start(merchandise, page);
  await page.route(/\/payment-checks$/, (route) => route.abort("failed"));
  await page
    .getByRole("button", { name: "ตรวจสอบการชำระเงิน", exact: true })
    .click();
  await expect(
    page.getByText("ตรวจสอบสถานะไม่สำเร็จ กรุณาลองตรวจสอบอีกครั้ง", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(qr(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
  ).toHaveCount(0);
  await page.unroute(/\/payment-checks$/);
  await merchandise.command("inquiry", {
    kind: "paid",
    paidAt: "2026-10-14T03:30:01Z",
  });
  await checkAndWork(merchandise, page, "2026-10-14T03:30:03Z");
  await expect(
    page.getByRole("heading", { name: "ชำระเงินสำเร็จ", exact: true }),
  ).toBeVisible();
});
test("zero countdown removes QR, checks once, and never interprets the timer as paid or unpaid", async ({
  page,
  merchandise,
}) => {
  await page.clock.install();
  await start(merchandise, page);
  let checks = 0;
  page.on("request", (r) => {
    if (r.method() === "POST" && r.url().endsWith("/payment-checks")) checks++;
  });
  await merchandise.command("clock", { now: "2026-10-14T03:40:01Z" });
  await page.clock.fastForward(601000);
  await expect(qr(page)).toHaveCount(0);
  await expect.poll(() => checks).toBe(1);
  await merchandise.command("work");
  await wake(page);
  await expect(
    page.getByText("ตรวจสอบสถานะไม่สำเร็จ กรุณาลองตรวจสอบอีกครั้ง", {
      exact: true,
    }),
  ).toBeVisible();
  await page.clock.fastForward(30000);
  expect(checks).toBe(1);
  await expect(
    page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "ชำระเงินสำเร็จ", exact: true }),
  ).toHaveCount(0);
});
test("disabled store expiry is unavailable rather than falsely described as preorder closed", async ({
  page,
  merchandise,
}) => {
  await start(merchandise, page);
  await merchandise.command("disableStore");
  await merchandise.command("inquiry", { kind: "unpaid" });
  await checkAndWork(merchandise, page, "2026-10-14T03:40:01Z");
  await expect(
    page.getByText(
      "QR หมดอายุ ขณะนี้ร้านยังไม่พร้อมรับชำระเงิน กรุณาติดต่อเจ้าหน้าที่",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText("หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว", {
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
  ).toHaveCount(0);
});
test("store closure between the displayed reissue action and R12 blocks the new QR without duplicating the order", async ({
  page,
  merchandise,
}) => {
  await start(merchandise, page);
  await merchandise.command("inquiry", { kind: "unpaid" });
  await checkAndWork(merchandise, page, "2026-10-14T03:40:01Z");
  await expect(
    page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
  ).toBeEnabled();
  await merchandise.command("clock", { now: "2026-10-14T06:00:00Z" });
  await page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }).click();
  await expect(
    page.getByText("หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว", {
      exact: true,
    }),
  ).toBeVisible();
  const stats = await merchandise.command<{
    orderCount: number;
    providerCreations: number;
  }>("inspect");
  expect(stats.orderCount).toBe(1);
  expect(stats.providerCreations).toBe(1);
});
test("device wall-clock changes do not restart or shorten the server-anchored timer", async ({
  page,
  merchandise,
}) => {
  await page.clock.install();
  await start(merchandise, page);
  await page.clock.setSystemTime(new Date("2099-01-01T00:00:00Z"));
  await page.clock.fastForward(30000);
  await expect(page.getByRole("timer")).toContainText(/09:[0-3]\d/);
  await expect(qr(page)).toBeVisible();
});
test("delayed verification accepts the actual paid time before expiry and cannot create a new attempt", async ({
  page,
  merchandise,
}) => {
  const first = await start(merchandise, page);
  await merchandise.command("inquiry", {
    kind: "paid",
    paidAt: "2026-10-14T03:39:59Z",
  });
  await checkAndWork(merchandise, page, "2026-10-14T06:00:00Z");
  await expect(
    page.getByRole("heading", { name: "ชำระเงินสำเร็จ", exact: true }),
  ).toBeVisible();
  const result = await detail(merchandise, page, first.id);
  expect(result.paidAt).toBe("2026-10-14T03:39:59.000Z");
  expect(result.payment.canRequestNewQr).toBe(false);
});
test("review-required evidence gives support without a paid claim or new QR", async ({
  page,
  merchandise,
}) => {
  await start(merchandise, page);
  await merchandise.command("inquiry", { kind: "review_required" });
  await checkAndWork(merchandise, page, "2026-10-14T03:30:02Z");
  await expect(
    page.getByText(
      "รายการนี้ต้องให้เจ้าหน้าที่ตรวจสอบ กรุณาติดต่อพร้อมเลขคำสั่งซื้อ",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.locator('main a[href^="mailto:pr@pharmacycouncil.org"]'),
  ).toBeVisible();
  await expect(qr(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
  ).toHaveCount(0);
});
test("an older in-flight DB read cannot restore a QR after payment checking has been queued", async ({
  page,
  merchandise,
}) => {
  const first = await start(merchandise, page);
  let release!: () => void,
    captured!: () => void,
    held = false;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const capturedRead = new Promise<void>((resolve) => {
    captured = resolve;
  });
  await page.route(
    `${merchandise.origin}/api/v1/merchandise/orders/${first.id}`,
    async (route) => {
      if (held) return route.continue();
      held = true;
      const response = await route.fetch();
      captured();
      await gate;
      try {
        await route.fulfill({ response });
      } catch {
        /* Aborted old read is expected after the fix. */
      }
    },
  );
  await wake(page);
  await capturedRead;
  const checked = page.waitForResponse((r) =>
    r.url().endsWith("/payment-checks"),
  );
  await page
    .getByRole("button", { name: "ตรวจสอบการชำระเงิน", exact: true })
    .click();
  await checked;
  release();
  await expect(page.locator("main.merch-order")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await expect(
    page.getByText("กำลังตรวจสอบการชำระเงิน", { exact: true }),
  ).toBeVisible();
  await expect(qr(page)).toHaveCount(0);
});
test("hidden pages pause DB polling and simultaneous return events coalesce without provider fanout", async ({
  page,
  merchandise,
}) => {
  await page.clock.install();
  const first = await start(merchandise, page);
  let reads = 0,
    checks = 0;
  page.on("request", (r) => {
    if (r.url().endsWith(`/orders/${first.id}`) && r.method() === "GET")
      reads++;
    if (r.url().endsWith("/payment-checks") && r.method() === "POST") checks++;
  });
  await page.evaluate(() =>
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    }),
  );
  await page.clock.fastForward(45000);
  expect(reads).toBe(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("pageshow"));
  });
  await expect.poll(() => reads).toBe(1);
  expect(checks).toBe(0);
});
test("approved unknown, expired and paid layouts remain readable across device classes", async ({
  page,
  merchandise,
}, info) => {
  await start(merchandise, page);
  await page.setViewportSize({ width: 390, height: 844 });
  if (info.project.name === "chromium") {
    await mkdir("docs/verification/merchandise/visual", { recursive: true });
    await page.screenshot({
      path: "docs/verification/merchandise/visual/p10-active-mobile.png",
    });
  }
  await merchandise.command("inquiry", { kind: "unknown" });
  await checkAndWork(merchandise, page, "2026-10-14T03:40:01Z", async () => {
    if (info.project.name === "chromium")
      await page.screenshot({
        path: "docs/verification/merchandise/visual/p10-checking-mobile.png",
      });
  });
  await expect(
    page.getByRole("button", { name: "ตรวจสอบอีกครั้ง", exact: true }),
  ).toBeEnabled();
  await page.setViewportSize({ width: 390, height: 844 });
  if (info.project.name === "chromium") {
    await mkdir("docs/verification/merchandise/visual", { recursive: true });
    await page.screenshot({
      path: "docs/verification/merchandise/visual/p10-unknown-mobile.png",
    });
  }
  await merchandise.command("inquiry", { kind: "unpaid" });
  await checkAndWork(merchandise, page, "2026-10-14T03:40:05Z");
  await expect(
    page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
  ).toBeEnabled();
  if (info.project.name === "chromium")
    await page.screenshot({
      path: "docs/verification/merchandise/visual/p10-expired-mobile.png",
    });
  await merchandise.command("clock", { now: "2026-10-14T06:00:00Z" });
  await wake(page);
  await expect(
    page.getByText("หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว", {
      exact: true,
    }),
  ).toBeVisible();
  if (info.project.name === "chromium")
    await page.screenshot({
      path: "docs/verification/merchandise/visual/p10-closed-mobile.png",
    });
  await merchandise.command("inquiry", {
    kind: "paid",
    paidAt: "2026-10-14T03:39:59Z",
  });
  await checkAndWork(merchandise, page, "2026-10-14T06:00:05Z");
  await expect(
    page.getByRole("heading", { name: "ชำระเงินสำเร็จ", exact: true }),
  ).toBeVisible();
  for (const [name, width, height] of [
    ["mobile", 390, 844],
    ["tablet", 834, 1112],
    ["desktop", 1440, 1000],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => scrollTo(0, 0));
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    if (info.project.name === "chromium")
      await page.screenshot({
        path: `docs/verification/merchandise/visual/p10-paid-${name}.png`,
      });
  }
});
