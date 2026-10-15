import { test, expect } from "./live-fixture";
import type { ProductDto } from "../../src/types/merchandise";
import type { Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
async function fillAddress(page: Page) {
  for (const [label, value] of [
    ["ชื่อ–นามสกุลผู้รับ", "ผู้รับ คนละคน"],
    ["เบอร์โทรผู้รับ", "02-591-9992"],
    ["ที่อยู่", "99 ถนนสังเคราะห์"],
    ["ตำบล/แขวง", "ตำบลทดสอบ"],
    ["อำเภอ/เขต", "อำเภอทดสอบ"],
    ["จังหวัด", "กรุงเทพมหานคร"],
    ["รหัสไปรษณีย์", "01234"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
}
async function setup(
  merchandise: {
    command<T = unknown>(action: string, payload?: unknown): Promise<T>;
    login(page: Page): Promise<void>;
  },
  page: Page,
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
  await merchandise.login(page);
  await page.goto("/th/souvenirs/checkout");
  await expect(
    page.getByRole("heading", { name: "ข้อมูลผู้รับ", exact: true }),
  ).toBeVisible();
  return product;
}
test("account prefill, another recipient and optional fields produce a canonical quote without changing the account or creating an order", async ({
  page,
  merchandise,
}) => {
  await setup(merchandise, page);
  await expect(
    page.getByLabel("ชื่อ–นามสกุลผู้รับ", { exact: true }),
  ).toHaveValue("ผู้ซื้อ ทดสอบ");
  await expect(page.getByLabel("เบอร์โทรผู้รับ", { exact: true })).toHaveValue(
    "0812345678",
  );
  const before = await page.evaluate(() => sessionStorage.getItem("pris_user"));
  await fillAddress(page);
  await page
    .getByLabel("ชื่อบริษัท", { exact: false })
    .fill("บริษัทผู้รับสังเคราะห์");
  await page
    .getByLabel("หมายเหตุจัดส่ง", { exact: false })
    .fill("ติดต่อผู้รับก่อนจัดส่ง");
  await expect(
    page.getByLabel("รหัสไปรษณีย์", { exact: true }),
  ).toHaveAttribute("type", "text");
  await expect(
    page.getByLabel("รหัสไปรษณีย์", { exact: true }),
  ).toHaveAttribute("inputmode", "numeric");
  await expect(page.getByLabel("อีเมลผู้รับ", { exact: false })).toHaveCount(0);
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "ตรวจสอบคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
  await expect(page.locator("address")).toContainText("ผู้รับ คนละคน");
  await expect(page.locator("address")).toContainText("025919992");
  await expect(page.locator("address")).toContainText("01234");
  await expect(page.locator("address")).toContainText("บริษัทผู้รับสังเคราะห์");
  await expect(page.locator(".merch-cart-total")).toContainText("฿150.00");
  await expect(
    page.getByRole("heading", { name: "การผลิต", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "การจัดส่ง", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Thai QR PromptPay", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("pris_user"))).toBe(
    before,
  );
  expect(
    (await merchandise.command<{ orderCount: number }>("inspect")).orderCount,
  ).toBe(0);
  expect(
    await page.evaluate(() =>
      [...Object.values(localStorage), ...Object.values(sessionStorage)].some(
        (value) => String(value).includes("99 ถนนสังเคราะห์"),
      ),
    ),
  ).toBe(false);
  await page
    .getByRole("button", { name: "แก้ไขข้อมูลผู้รับ", exact: true })
    .click();
  await expect(
    page.getByLabel("ชื่อ–นามสกุลผู้รับ", { exact: true }),
  ).toBeFocused();
  await expect(page.getByLabel("ที่อยู่", { exact: true })).toHaveValue(
    "99 ถนนสังเคราะห์",
  );
});
test("required fields give linked errors and focus the first invalid field before any quote request", async ({
  page,
  merchandise,
}) => {
  await setup(merchandise, page);
  let quotes = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/checkout-quotes")) quotes++;
  });
  await page.getByLabel("เบอร์โทรผู้รับ", { exact: true }).fill("");
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByText("กรุณากรอกเบอร์โทรผู้รับ", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("เบอร์โทรผู้รับ", { exact: true }),
  ).toBeFocused();
  await expect(
    page.getByLabel("เบอร์โทรผู้รับ", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  expect(quotes).toBe(0);
  await fillAddress(page);
  await page.getByLabel("เบอร์โทรผู้รับ", { exact: true }).fill("123");
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByText("กรุณาตรวจสอบรูปแบบเบอร์โทรผู้รับในประเทศไทย", {
      exact: true,
    }),
  ).toBeVisible();
  expect(quotes).toBe(0);
});
test("actual price changes are explicitly reviewed at the new server amount", async ({
  page,
  merchandise,
}) => {
  const product = await setup(merchandise, page);
  await fillAddress(page);
  await merchandise.command("price", { id: product.id, price: "12000" });
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByText(
      "รายการหรือราคามีการเปลี่ยนแปลง กรุณาตรวจสอบยอดและรายละเอียดล่าสุดอีกครั้งก่อนยืนยัน",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator(".merch-cart-total")).toContainText("฿170.00");
  expect(
    (await merchandise.command<{ orderCount: number }>("inspect")).orderCount,
  ).toBe(0);
});
test("real stale-cart 409 refreshes the quote while keeping the recipient for explicit review", async ({
  page,
  merchandise,
}) => {
  const product = await setup(merchandise, page);
  await fillAddress(page);
  await merchandise.command("addCart", {
    productId: product.id,
    variantId: product.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "ตรวจสอบคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".merch-cart-total")).toContainText("฿250.00");
  await expect(page.locator("address")).toContainText("ผู้รับ คนละคน");
  await expect(
    page.getByText(
      "รายการหรือราคามีการเปลี่ยนแปลง กรุณาตรวจสอบยอดและรายละเอียดล่าสุดอีกครั้งก่อนยืนยัน",
      { exact: true },
    ),
  ).toBeVisible();
});
test("store closure preserves entered recipient fields but prevents a new quote/order", async ({
  page,
  merchandise,
}) => {
  await setup(merchandise, page);
  await fillAddress(page);
  await merchandise.command("closeStore");
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByText("ปิดรับพรีออเดอร์แล้ว ไม่สามารถสร้างคำสั่งซื้อใหม่ได้", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel("ที่อยู่", { exact: true })).toHaveValue(
    "99 ถนนสังเคราะห์",
  );
  await expect(
    page.getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true }),
  ).toBeDisabled();
  expect(
    (await merchandise.command<{ orderCount: number }>("inspect")).orderCount,
  ).toBe(0);
});
test("a failed quote remains retryable without creating an order; reload discards entered address", async ({
  page,
  merchandise,
}) => {
  await setup(merchandise, page);
  await fillAddress(page);
  const url =
    merchandise.origin + "/api/v1/merchandise/events/PRIS-2026/checkout-quotes";
  await page.route(url, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        success: false,
        code: "MERCH_LOAD_FAILED",
        error: "Synthetic failure",
        requestId: "test",
      }),
    }),
  );
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByText(
      "ตรวจสอบคำสั่งซื้อไม่สำเร็จ ยังไม่ได้สร้างคำสั่งซื้อ กรุณาลองอีกครั้ง",
      { exact: true },
    ),
  ).toBeVisible();
  await page.unroute(url);
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "ตรวจสอบคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("ที่อยู่", { exact: true })).toHaveValue("");
  await expect(
    page.getByLabel("ชื่อ–นามสกุลผู้รับ", { exact: true }),
  ).toHaveValue("ผู้ซื้อ ทดสอบ");
  expect(
    (await merchandise.command<{ orderCount: number }>("inspect")).orderCount,
  ).toBe(0);
});
test("recipient and quote layouts preserve labels, fixed action clearance and mobile-first reflow", async ({
  page,
  merchandise,
}, info) => {
  await setup(merchandise, page);
  await fillAddress(page);
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
    const last = page.getByLabel("หมายเหตุจัดส่ง", { exact: false });
    await last.focus();
    await last.evaluate(element => element.scrollIntoView({ block: "nearest", behavior: "instant" }));
    const field = await last.boundingBox(),
      bar = await page.locator(".merch-cart-bar").boundingBox();
    expect(field!.y + field!.height).toBeLessThanOrEqual(bar!.y);
    await page.evaluate(() => scrollTo(0, 0));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    if (info.project.name === "chromium") {
      await mkdir("docs/verification/merchandise/visual", { recursive: true });
      await page.screenshot({
        path: `docs/verification/merchandise/visual/p08-recipient-${name}.png`,
        animations: "disabled",
      });
    }
  }
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "ตรวจสอบคำสั่งซื้อ", exact: true }),
  ).toBeFocused();
  for (const [name, width, height] of [
    ["mobile", 390, 844],
    ["desktop", 1440, 1000],
  ] as const) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    if (info.project.name === "chromium")
      await page.screenshot({
        path: `docs/verification/merchandise/visual/p08-review-${name}.png`,
        animations: "disabled",
      });
  }
});
