import { test, expect } from "./live-fixture";
import type { Page } from "@playwright/test";
import type { ProductDto, OrderDetail } from "../../src/types/merchandise";
type Fixture = {
  origin: string;
  buyerToken: string;
  adminToken: string;
  command<T = unknown>(action: string, payload?: unknown): Promise<T>;
  login(page: Page): Promise<void>;
};
type Audit = {
  emails: { recipient: string; subject: string; html: string }[];
  production: {
    productId: string;
    quantity: string;
    singleQuantity: string;
    bundleQuantity: string;
  }[];
  outbox: { order_id: string; event_type: string; state: string }[];
  orders: unknown[];
  duplicateReferences: number;
};
const qr = (page: Page) =>
  page.getByRole("img", { name: /^QR สำหรับชำระเงินคำสั่งซื้อ/ });
async function checkout(
  page: Page,
  lines: { product: ProductDto; quantity: number }[],
) {
  for (const { product, quantity } of lines) {
    await page.goto(`/th/souvenirs/products/${product.id}`);
    await page
      .getByLabel(product.kind === "bundle" ? "จำนวนชุด" : "จำนวน", {
        exact: true,
      })
      .fill(String(quantity));
    const added = page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.url().endsWith("/cart/items") &&
        r.ok(),
    );
    await page.getByRole("button", { name: /^เพิ่มลงตะกร้า/ }).click();
    await added;
    await expect(page).not.toHaveURL(/intentId=/);
  }
  await page.goto("/th/souvenirs/cart");
  await page.getByRole("button", { name: /^ดำเนินการต่อ/ }).click();
  await expect(
    page.getByRole("heading", { name: "ข้อมูลผู้รับ", exact: true }),
  ).toBeVisible();
  for (const [name, value] of [
    ["ชื่อ–นามสกุลผู้รับ", "ผู้รับตรวจรับ คนละบัญชี"],
    ["เบอร์โทรผู้รับ", "0812345678"],
    ["ที่อยู่", "99 ที่อยู่ตรวจรับสังเคราะห์"],
    ["ตำบล/แขวง", "ทดสอบ"],
    ["อำเภอ/เขต", "ทดสอบ"],
    ["จังหวัด", "กรุงเทพมหานคร"],
    ["รหัสไปรษณีย์", "10100"],
  ])
    await page.getByLabel(name, { exact: true }).fill(value);
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }),
  ).toBeEnabled();
  await page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }).click();
  await expect(qr(page)).toBeVisible();
  return page.url().split("/").pop()!;
}
async function readOrder(
  f: Fixture,
  page: Page,
  id: string,
): Promise<OrderDetail> {
  const r = await page.request.get(
    `${f.origin}/api/v1/merchandise/orders/${id}`,
    { headers: { authorization: `Bearer ${f.buyerToken}` } },
  );
  expect(r.ok()).toBe(true);
  return (await r.json()).data;
}
async function wake(page: Page) {
  await page.evaluate(() => window.dispatchEvent(new Event("pageshow")));
}
async function pay(f: Fixture, page: Page, paidAt?: string) {
  await f.command("inquiry", { kind: "paid", ...(paidAt ? { paidAt } : {}) });
  const checked = page.waitForResponse(
    (r) =>
      r.request().method() === "POST" &&
      r.url().endsWith("/payment-checks") &&
      r.ok(),
  );
  await page
    .getByRole("button", { name: "ตรวจสอบการชำระเงิน", exact: true })
    .click();
  await checked;
  await expect(
    page.getByRole("button", { name: "กำลังตรวจสอบ", exact: true }),
  ).toBeDisabled();
  await f.command("work");
  await wake(page);
  await expect(
    page.getByRole("heading", { name: "ชำระเงินสำเร็จ", exact: true }),
  ).toBeVisible();
}
async function adminPage(page: Page, f: Fixture) {
  const admin = await page
    .context()
    .browser()!
    .newPage({ viewport: { width: 1440, height: 1000 } });
  await admin.addInitScript((token) => {
    sessionStorage.setItem("backoffice_token", token);
    sessionStorage.setItem(
      "backoffice_user",
      JSON.stringify({
        id: 1,
        role: "admin",
        email: "admin@example.test",
        firstName: "Admin",
        lastName: "Test",
        assignedEvents: [],
      }),
    );
  }, f.adminToken);
  return admin;
}
const bo = process.env.PRIS_MERCHANDISE_BO_URL ?? "http://127.0.0.1:3105";

test("customer Bundle and single purchase flows through real Admin UI, record-only paid/shipped email and exact production snapshots", async ({
  page,
  merchandise,
}) => {
  test.setTimeout(60000);
  const { products, bundle } = await merchandise.command<{
    products: ProductDto[];
    bundle: ProductDto;
  }>("catalog", { banners: 1 });
  await merchandise.command("provider");
  await merchandise.login(page);
  const id = await checkout(page, [
    { product: bundle, quantity: 2 },
    { product: products[2], quantity: 2 },
  ]);
  const original = await readOrder(merchandise, page, id);
  expect(original.amounts).toEqual({
    subtotalMinor: "64000",
    shippingMinor: "5000",
    totalMinor: "69000",
    currency: "THB",
  });
  expect(original.effective.recipient.fullName).toBe("ผู้รับตรวจรับ คนละบัญชี");
  await pay(merchandise, page);
  let audit = await merchandise.command<Audit>("acceptanceAudit");
  expect(audit.emails).toHaveLength(1);
  expect(audit.emails[0].recipient).toBe("buyer@example.test");
  for (const text of [
    original.orderNumber,
    "ผู้รับตรวจรับ คนละบัญชี",
    "690.00",
    "50.00",
    "กรุณาถ่ายวิดีโอขณะแกะพัสดุ",
    "pr@pharmacycouncil.org",
  ])
    expect(audit.emails[0].html).toContain(text);
  expect(
    audit.production.find((r) => r.productId === products[2].id),
  ).toMatchObject({ quantity: "4", singleQuantity: "2", bundleQuantity: "2" });
  expect(
    audit.production.find((r) => r.productId === products[4].id),
  ).toMatchObject({ quantity: "2", singleQuantity: "0", bundleQuantity: "2" });
  expect(audit.production.some((r) => r.productId === bundle.id)).toBe(false);
  const admin = await adminPage(page, merchandise);
  try {
    await admin.goto(`${bo}/merchandise/orders/${id}?eventId=1`);
    await expect(
      admin.getByRole("region", { name: "ข้อมูลขณะสั่งซื้อ" }),
    ).toContainText("ผู้รับตรวจรับ คนละบัญชี");
    await admin
      .getByRole("button", { name: "จัดส่งสินค้า", exact: true })
      .click();
    await admin
      .getByLabel("บริษัทขนส่ง", { exact: true })
      .fill("ขนส่งตรวจรับ A");
    await admin.getByLabel("Tracking ID", { exact: true }).fill("0000PRIS-A");
    await admin
      .getByRole("button", { name: "ตรวจทานการจัดส่ง", exact: true })
      .click();
    await admin
      .getByRole("button", { name: "ยืนยันข้อมูลจัดส่ง", exact: true })
      .click();
    await expect(
      admin.getByRole("status").filter({ hasText: "บันทึกข้อมูลจัดส่งแล้ว" }),
    ).toBeVisible();
    await merchandise.command("work");
    await wake(page);
    await expect(
      page.getByRole("heading", { name: "รายละเอียดคำสั่งซื้อ", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".merch-tracking")).toContainText("0000PRIS-A");
    await merchandise.command("clock", { now: "2026-10-14T03:41:00Z" });
    await merchandise.command("inquiry", {
      kind: "paid",
      paidAt: original.payment.attempt!.providerCreatedAt,
    });
    await merchandise.command("postback", { id });
    await merchandise.command("postback", { id });
    await merchandise.command("work");
    await merchandise.command("work");
    audit = await merchandise.command<Audit>("acceptanceAudit");
    expect(audit.emails).toHaveLength(2);
    expect(audit.outbox).toHaveLength(2);
    expect(audit.orders).toHaveLength(1);
    expect(audit.duplicateReferences).toBe(0);
    expect(audit.emails[1].html).toContain("0000PRIS-A");
    expect(
      audit.production.find((r) => r.productId === products[2].id)?.quantity,
    ).toBe("4");
  } finally {
    await admin.close();
  }
});

test("two actual customer checkouts bulk ship through Admin with distinct tracking and exactly one notification per event", async ({
  page,
  merchandise,
}) => {
  test.setTimeout(60000);
  const { products } = await merchandise.command<{ products: ProductDto[] }>(
    "catalog",
    { banners: 0 },
  );
  await merchandise.command("provider");
  await merchandise.login(page);
  const orders: OrderDetail[] = [];
  for (const product of [products[2], products[4]]) {
    const id = await checkout(page, [{ product, quantity: 1 }]);
    await pay(merchandise, page);
    orders.push(await readOrder(merchandise, page, id));
  }
  const admin = await adminPage(page, merchandise);
  try {
    await admin.goto(`${bo}/merchandise/shipping?eventId=1`);
    for (const [i, order] of orders.entries()) {
      await admin
        .getByRole("checkbox", {
          name: `เลือก ${order.orderNumber}`,
          exact: true,
        })
        .check();
      await admin
        .getByLabel(`บริษัทขนส่ง ${order.orderNumber}`, { exact: true })
        .fill(`ขนส่งตรวจรับ ${i + 1}`);
      await admin
        .getByLabel(`Tracking ID ${order.orderNumber}`, { exact: true })
        .fill(`0000BULK-${i + 1}`);
    }
    await admin
      .getByRole("button", { name: "ตรวจทานการจัดส่งที่เลือก", exact: true })
      .click();
    await admin
      .getByRole("button", { name: "ยืนยันจัดส่ง 2 ออเดอร์", exact: true })
      .click();
    await expect(
      admin
        .getByRole("status")
        .filter({ hasText: "จัดส่งสำเร็จ 2 ออเดอร์ · ไม่สำเร็จ 0 ออเดอร์" }),
    ).toBeVisible();
    await merchandise.command("work");
    await merchandise.command("work");
    const audit = await merchandise.command<Audit>("acceptanceAudit");
    expect(audit.emails).toHaveLength(4);
    expect(audit.outbox).toHaveLength(4);
    expect(
      new Set(audit.outbox.map((r) => `${r.order_id}:${r.event_type}`)).size,
    ).toBe(4);
    for (const [i, order] of orders.entries()) {
      await page.goto(`/th/souvenirs/orders/${order.id}`);
      await expect(page.locator(".merch-tracking")).toContainText(
        `0000BULK-${i + 1}`,
      );
      expect(
        audit.emails.filter((m) => m.html.includes(`0000BULK-${i + 1}`)),
      ).toHaveLength(1);
    }
  } finally {
    await admin.close();
  }
});

for (const explicitExpiry of [false, true])
  test(`full customer checkout keeps its ${explicitExpiry ? "explicit" : "fallback"} deadline, blocks unknown reissue, and reissues only while open`, async ({
    page,
    merchandise,
  }) => {
    test.setTimeout(60000);
    const { products } = await merchandise.command<{ products: ProductDto[] }>(
      "catalog",
      { banners: 0 },
    );
    await merchandise.command("provider", { explicitExpiry });
    await merchandise.login(page);
    const id = await checkout(page, [{ product: products[2], quantity: 1 }]);
    const first = await readOrder(merchandise, page, id);
    await merchandise.command("clock", { now: "2026-10-14T03:39:00Z" });
    await page.reload();
    await expect(qr(page)).toBeVisible();
    expect(
      (await readOrder(merchandise, page, id)).payment.attempt!.expiresAt,
    ).toBe(first.payment.attempt!.expiresAt);
    await merchandise.command("clock", { now: "2026-10-14T03:40:01Z" });
    await merchandise.command("inquiry", { kind: "unknown" });
    await page
      .getByRole("button", { name: "ตรวจสอบการชำระเงิน", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "กำลังตรวจสอบ", exact: true }),
    ).toBeDisabled();
    await merchandise.command("work");
    await wake(page);
    await expect(
      page.getByText("ตรวจสอบสถานะไม่สำเร็จ กรุณาลองตรวจสอบอีกครั้ง", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
    ).toHaveCount(0);
    await merchandise.command("clock", { now: "2026-10-14T03:40:03Z" });
    await merchandise.command("inquiry", { kind: "unpaid" });
    await page
      .getByRole("button", { name: "ตรวจสอบอีกครั้ง", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "กำลังตรวจสอบ", exact: true }),
    ).toBeDisabled();
    await merchandise.command("work");
    await wake(page);
    await page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }).click();
    await expect(qr(page)).toBeVisible();
    const second = await readOrder(merchandise, page, id);
    expect(second.payment.attempt!.referenceNo).not.toBe(
      first.payment.attempt!.referenceNo,
    );
    expect(second.id).toBe(first.id);
    expect(second.effective).toEqual(first.effective);
    await merchandise.command("clock", { now: "2026-10-14T06:00:00Z" });
    await page.reload();
    await expect(
      page.getByRole("button", { name: "กำลังตรวจสอบ", exact: true }),
    ).toBeDisabled();
    await merchandise.command("work");
    await wake(page);
    await expect(
      page.getByText("หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
    ).toHaveCount(0);
    expect(
      (await merchandise.command<Audit>("acceptanceAudit")).emails,
    ).toHaveLength(0);
  });

test("a delayed duplicate synthetic Postback accepts verified pre-expiry payment after closing without duplicating order or mail", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("clock", { now: "2026-10-14T04:59:00Z" });
  const { products } = await merchandise.command<{ products: ProductDto[] }>(
    "catalog",
    { banners: 0 },
  );
  await merchandise.command("provider");
  await merchandise.login(page);
  const id = await checkout(page, [{ product: products[2], quantity: 1 }]);
  await merchandise.command("clock", { now: "2026-10-14T05:01:00Z" });
  await page.reload();
  await expect(qr(page)).toBeVisible();
  await merchandise.command("clock", { now: "2026-10-14T05:10:00Z" });
  await merchandise.command("inquiry", {
    kind: "paid",
    paidAt: "2026-10-14T05:00:30Z",
  });
  await merchandise.command("postback", { id });
  await merchandise.command("postback", { id });
  await merchandise.command("work");
  await wake(page);
  await expect(
    page.getByRole("heading", { name: "ชำระเงินสำเร็จ", exact: true }),
  ).toBeVisible();
  await merchandise.command("work");
  const audit = await merchandise.command<Audit>("acceptanceAudit");
  expect(audit.orders).toHaveLength(1);
  expect(audit.emails).toHaveLength(1);
  expect(audit.production[0].quantity).toBe("1");
  expect((await readOrder(merchandise, page, id)).paidAt).toBe(
    "2026-10-14T05:00:30.000Z",
  );
});
