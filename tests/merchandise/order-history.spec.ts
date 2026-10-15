import { test, expect } from "./live-fixture";
import type { OrderDetail } from "../../src/types/merchandise";
import { mkdir } from "node:fs/promises";
type Setup = { orders: OrderDetail[]; other: OrderDetail | null };
const listApi = /\/events\/PRIS-2026\/orders(?:\?|$)/;
test("empty owner history has the approved empty state and shop action", async ({
  page,
  merchandise,
}) => {
  await merchandise.login(page);
  await page.goto("/th/souvenirs/orders");
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
  expect(
    (await page.getByRole("contentinfo").boundingBox())!.y,
  ).toBeGreaterThanOrEqual(page.viewportSize()!.height);
  await expect(
    page.getByRole("link", { name: "เลือกสินค้า", exact: true }),
  ).toHaveAttribute("href", "/th/souvenirs");
});

test("history contains only the signed-in buyer and event, with payment and delivery shown separately and no N+1 detail reads", async ({
  page,
  merchandise,
}) => {
  const { orders, other } = await merchandise.command<Setup>("historySetup");
  await merchandise.login(page);
  let details = 0;
  page.on("request", (r) => {
    if (/\/api\/v1\/merchandise\/orders\/[0-9a-f-]+$/.test(r.url())) details++;
  });
  await page.goto("/th/souvenirs/orders");
  await expect(page.locator(".merch-history-row")).toHaveCount(3);
  const paid = page
    .locator(".merch-history-row")
    .filter({ hasText: orders[0].orderNumber });
  await expect(paid).toContainText("ชำระเงินสำเร็จ");
  await expect(paid).toContainText("รอจัดส่ง");
  const shipped = page
    .locator(".merch-history-row")
    .filter({ hasText: orders[1].orderNumber });
  await expect(shipped).toContainText("ชำระเงินสำเร็จ");
  await expect(shipped).toContainText("จัดส่งแล้ว");
  const pending = page
    .locator(".merch-history-row")
    .filter({ hasText: orders[2].orderNumber });
  await expect(pending).toContainText("รอชำระเงิน");
  await expect(pending).toContainText("ยังไม่พร้อมจัดส่ง");
  await expect(
    page.getByRole("heading", { name: other!.orderNumber, exact: true }),
  ).toHaveCount(0);
  expect(details).toBe(0);
  const unrelated = await page.request.get(
    merchandise.origin + "/api/v1/merchandise/events/MERCH-OTHER/orders",
    { headers: { authorization: `Bearer ${merchandise.buyerToken}` } },
  );
  expect((await unrelated.json()).data.items).toEqual([]);
});
test("history pagination persists through direct reload and locale switching", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("historySetup", {
    count: 11,
    pendingOnly: true,
    includeOther: false,
  });
  await merchandise.login(page);
  await page.goto("/th/souvenirs/orders");
  await expect(page.locator(".merch-history-row")).toHaveCount(10);
  await page.getByRole("link", { name: "หน้าถัดไป", exact: true }).click();
  await expect(page).toHaveURL(/\/th\/souvenirs\/orders\?page=2$/);
  await expect(page.locator(".merch-history-row")).toHaveCount(1);
  const number = await page.locator(".merch-history-row h2").textContent();
  await page.reload();
  await expect(page.locator(".merch-history-row h2")).toHaveText(number!);
  await page
    .getByRole("button", { name: "เปลี่ยนภาษาเป็นภาษาอังกฤษ", exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/souvenirs\/orders\?page=2$/);
  await expect(page.locator(".merch-history-row h2")).toHaveText(number!);
});
test("anonymous login returns to the requested history page without guest access", async ({
  page,
  merchandise,
}) => {
  await merchandise.mockLogin(page);
  await page.goto("/th/souvenirs/orders?page=2");
  await expect(
    page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
  ).toBeVisible();
  expect(new URL(page.url()).searchParams.get("redirect")).toBe(
    "/souvenirs/orders?page=2",
  );
  await page.getByLabel("อีเมล", { exact: true }).fill("buyer@example.test");
  await page
    .getByLabel("รหัสผ่าน", { exact: true })
    .fill("synthetic-not-a-real-password");
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page).toHaveURL(/\/th\/souvenirs\/orders\?page=2$/);
  await expect(
    page.getByRole("heading", {
      name: "ไม่พบคำสั่งซื้อในหน้านี้",
      exact: true,
    }),
  ).toBeVisible();
});
test("invalid history query does not make an owner history request", async ({
  page,
  merchandise,
}) => {
  await merchandise.login(page);
  let reads = 0;
  page.on("request", (r) => {
    if (listApi.test(r.url())) reads++;
  });
  await page.goto("/th/souvenirs/orders?page=1&page=2");
  await expect(
    page.getByText("พารามิเตอร์หน้าประวัติไม่ถูกต้อง", { exact: true }),
  ).toBeVisible();
  expect(reads).toBe(0);
});
test("transport failure is retryable and is never presented as an empty history", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("historySetup");
  await merchandise.login(page);
  await page.route(listApi, (route) => route.abort("failed"));
  await page.goto("/th/souvenirs/orders");
  await expect(
    page.getByRole("button", { name: "ลองโหลดอีกครั้ง", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีคำสั่งซื้อ", exact: true }),
  ).toHaveCount(0);
  await page.unroute(listApi);
  await page
    .getByRole("button", { name: "ลองโหลดอีกครั้ง", exact: true })
    .click();
  await expect(page.locator(".merch-history-row")).toHaveCount(3);
});
test("foreign-event summary transport is rejected rather than displayed", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("historySetup");
  await merchandise.login(page);
  await page.route(listApi, async (route) => {
    const response = await route.fetch(),
      body = await response.json();
    body.data.items[0].eventId = 999;
    await route.fulfill({ response, json: body });
  });
  await page.goto("/th/souvenirs/orders");
  await expect(
    page.getByRole("button", { name: "ลองโหลดอีกครั้ง", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".merch-history-row")).toHaveCount(0);
});
test("an expired owner read offers forced reauthentication with the history page intact", async ({
  page,
  merchandise,
}) => {
  await merchandise.login(page);
  await merchandise.mockLogin(page);
  await page.route(listApi, (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        success: false,
        code: "MERCH_AUTH_REQUIRED",
        error: "Synthetic expired token response",
        requestId: "test",
      }),
    }),
  );
  await page.goto("/th/souvenirs/orders?page=2");
  await page
    .getByRole("link", { name: "เข้าสู่ระบบอีกครั้ง", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
  ).toBeVisible();
  const query = new URL(page.url()).searchParams;
  expect(query.get("reauth")).toBe("merchandise");
  expect(query.get("redirect")).toBe("/souvenirs/orders?page=2");
});
test("account replacement never merges owner history or grants access to a foreign order", async ({
  page,
  merchandise,
}) => {
  const { orders, other } = await merchandise.command<Setup>("historySetup");
  await merchandise.login(page);
  await page.goto("/th/souvenirs/orders");
  await expect(page.locator(".merch-history-row")).toHaveCount(3);
  await page.evaluate((token) => {
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
  }, merchandise.otherBuyerToken);
  await page.reload();
  await expect(page.locator(".merch-history-row")).toHaveCount(1);
  await expect(page.locator(".merch-history-row h2")).toHaveText(
    other!.orderNumber,
  );
  await page.goto(`/th/souvenirs/orders/${orders[0].id}`);
  await expect(
    page.getByText("ไม่พบคำสั่งซื้อที่คุณเข้าถึงได้", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("address")).toHaveCount(0);
});
test("historical snapshots and Bundle components remain stable after catalog changes; audited recipient amendments retain the original", async ({
  page,
  merchandise,
}) => {
  const { orders } = await merchandise.command<Setup>("historySetup");
  const original = orders[0],
    item = original.effective.items[0];
  await merchandise.command("price", {
    id: item.productId,
    price: "90000",
    name: "ชื่อสินค้าแก้ไขภายหลัง",
  });
  const changed = await merchandise.command<OrderDetail>("amendRecipient", {
    id: original.id,
  });
  expect(changed.amounts).toEqual(original.amounts);
  await merchandise.command("closeStore");
  await merchandise.login(page);
  await page.goto(`/th/souvenirs/orders/${original.id}`);
  await expect(page.locator(".merch-review-section address")).toContainText(
    "ผู้รับแก้ไขทดสอบ",
  );
  await expect(
    page.getByText("ชื่อสินค้าแก้ไขภายหลัง", { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".merch-paid-item")).toContainText(item.nameTh);
  await expect(page.locator(".merch-paid-item")).toContainText("฿100.00");
  await page.getByText("ดูข้อมูลเดิมเมื่อสั่งซื้อ", { exact: true }).click();
  await expect(page.locator(".merch-order-original address")).toContainText(
    original.original.recipient.fullName,
  );
  await expect(page.locator(".merch-order-original address")).toContainText(
    original.original.recipient.addressLine,
  );
  await expect(page.locator("input,textarea,select")).toHaveCount(0);
  await page.goto(`/th/souvenirs/orders/${orders[1].id}`);
  for (const part of orders[1].effective.items[0].components)
    await expect(page.locator(".merch-paid-item")).toContainText(part.nameTh);
  await expect(
    page.getByRole("heading", { name: "รายละเอียดคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
});
for (const denied of [false, true])
  test(`shipped details retain leading zeroes and ${denied ? "report denied" : "confirm successful"} mocked clipboard writes`, async ({
    page,
    merchandise,
  }) => {
    const { orders } = await merchandise.command<Setup>("historySetup");
    await page.addInitScript((denied) => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            if (denied) throw Error("Synthetic denied clipboard");
            (window as unknown as { copiedTracking: string }).copiedTracking =
              text;
          },
        },
      });
    }, denied);
    await merchandise.login(page);
    await page.goto(`/th/souvenirs/orders/${orders[1].id}`);
    await expect(page.locator(".merch-tracking strong")).toHaveText(
      "0000123456789",
    );
    await page
      .getByRole("button", { name: "คัดลอกเลขติดตามพัสดุ", exact: true })
      .click();
    await expect(
      page.getByText(
        denied
          ? "คัดลอกไม่สำเร็จ กรุณาเลือกและคัดลอกเลขติดตามพัสดุที่แสดง"
          : "คัดลอกเลขติดตามพัสดุแล้ว",
        { exact: true },
      ),
    ).toBeVisible();
    if (!denied)
      expect(
        await page.evaluate(
          () =>
            (window as unknown as { copiedTracking: string }).copiedTracking,
        ),
      ).toBe("0000123456789");
    await expect(page.locator(".merch-order-delivery a")).toHaveCount(0);
    await expect(page.getByText(/กรุณาถ่ายวิดีโอขณะแกะพัสดุ/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /ขอ QR ใหม่|ชำระเงิน|แก้ไข/ }),
    ).toHaveCount(0);
  });
test("returning to an already-paid order refreshes a new shipment without another payment attempt", async ({
  page,
  merchandise,
}) => {
  const { orders } = await merchandise.command<Setup>("historySetup");
  await merchandise.login(page);
  await page.goto(`/th/souvenirs/orders/${orders[0].id}`);
  await expect(
    page.getByRole("heading", { name: "ชำระเงินสำเร็จ", exact: true }),
  ).toBeVisible();
  const before = await merchandise.command<{ providerCreations: number }>(
    "inspect",
  );
  await merchandise.command("ship", {
    id: orders[0].id,
    carrier: "ขนส่งทดสอบหลังกลับหน้า",
    trackingId: "00000002",
  });
  await page.evaluate(() => window.dispatchEvent(new Event("pageshow")));
  await expect(page.locator(".merch-tracking strong")).toHaveText("00000002");
  await expect(
    page.getByRole("heading", { name: "รายละเอียดคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
  expect(
    (await merchandise.command<{ providerCreations: number }>("inspect"))
      .providerCreations,
  ).toBe(before.providerCreations);
});
test("approved empty, history and shipped layouts adapt across mobile tablet and desktop", async ({
  page,
  merchandise,
}, info) => {
  await merchandise.login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/th/souvenirs/orders");
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
  if (info.project.name === "chromium") {
    await mkdir("docs/verification/merchandise/visual", { recursive: true });
    await page.screenshot({
      path: "docs/verification/merchandise/visual/p11-empty-mobile.png",
    });
  }
  const { orders } = await merchandise.command<Setup>("historySetup");
  await page.reload();
  await expect(page.locator(".merch-history-row")).toHaveCount(3);
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
    if (width === 1440) {
      const list = await page.locator(".merch-history-list").boundingBox();
      const heading = await page
        .getByRole("heading", { name: "คำสั่งซื้อของฉัน", exact: true })
        .boundingBox();
      expect(list!.width).toBe(900);
      expect(list!.x).toBe(heading!.x);
    }
    if (info.project.name === "chromium")
      await page.screenshot({
        path: `docs/verification/merchandise/visual/p11-history-${name}.png`,
      });
  }
  await page.goto(`/th/souvenirs/orders/${orders[1].id}`);
  await expect(page.locator(".merch-tracking strong")).toBeVisible();
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
    await expect(page.locator(".merch-cart-bar")).toHaveCount(0);
    if (info.project.name === "chromium")
      await page.screenshot({
        path: `docs/verification/merchandise/visual/p11-shipped-${name}.png`,
      });
  }
});
