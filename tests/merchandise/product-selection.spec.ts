import type { Page } from "@playwright/test";
import { test, expect, login } from "./fixtures";
import {
  ids,
  makeBundle,
  makeOptionsProduct,
  makeSingle,
  makeStore,
} from "./data";

const addButton = (page: Page) =>
  page.getByRole("button", { name: /^เพิ่มลงตะกร้า/ });
const posts = (fake: {
  calls: { method: string; path: string; body: unknown }[];
}) =>
  fake.calls.filter(
    (c) => c.method === "POST" && c.path.endsWith("/cart/items"),
  );
const L = "10000000-0000-4000-8000-000000000012";
const M = "10000000-0000-4000-8000-000000000011";

test("a product without options shows no selectors and validates quantity 1-9999", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  await expect(
    page.getByRole("heading", { name: p.nameTh, exact: true }),
  ).toBeVisible();
  await expect(page.locator("fieldset")).toHaveCount(0);
  await expect(page.locator("select")).toHaveCount(0);
  await expect(page.locator(".merch-detail-price")).toHaveText(
    "฿250.00 / ชิ้น",
  );
  await expect(
    page.getByRole("heading", { name: "การผลิต", exact: true }),
  ).toHaveCount(0);
  await expect(addButton(page)).toBeEnabled();
  const quantity = page.getByLabel("จำนวน", { exact: true });
  await quantity.fill("9999");
  await expect(addButton(page)).toBeEnabled();
  await quantity.fill("10000");
  await expect(addButton(page)).toBeDisabled();
  await expect(
    page.getByText("กรุณาระบุจำนวนเต็มระหว่าง 1 ถึง 9999", { exact: true }),
  ).toBeVisible();
  await quantity.fill("0");
  await expect(addButton(page)).toBeDisabled();
  await quantity.fill("1");
  await expect(addButton(page)).toBeEnabled();
});

test("a product with options needs a complete choice, then posts the exact variantId", async ({
  page,
  fake,
}) => {
  const p = makeOptionsProduct({ sizeChartTh: "รอบอก 40 นิ้ว" });
  fake.products = [p];
  await login(page);
  await page.goto(`/th/souvenirs/products/${p.id}`);
  await expect(page.locator(".merch-detail-price")).toHaveText(
    "เริ่มต้น ฿300.00",
  );
  await expect(page.getByText("รอบอก 40 นิ้ว", { exact: true })).toBeVisible();
  await expect(addButton(page)).toBeDisabled();
  await page.getByRole("button", { name: "ขาว", exact: true }).click();
  await expect(addButton(page)).toBeDisabled();
  await page.getByRole("button", { name: "L", exact: true }).click();
  await expect(page.locator(".merch-detail-price")).toHaveText(
    "฿320.00 / ชิ้น",
  );
  await page.getByLabel("จำนวน", { exact: true }).fill("2");
  await addButton(page).click();
  await expect(
    page.locator("header .merch-header-cart:visible .merch-cart-badge"),
  ).toHaveText("2");
  expect(posts(fake)).toHaveLength(1);
  expect(posts(fake)[0].body).toEqual({
    productId: p.id,
    variantId: L,
    bundleSelections: [],
    quantity: 2,
  });
});

test("disabled variants cannot be chosen", async ({ page, fake }) => {
  const base = makeOptionsProduct();
  const p = makeOptionsProduct({
    variants: [base.variants[0], { ...base.variants[1], saleEnabled: false }],
  });
  fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  await expect(page.getByRole("button", { name: /^L/ })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "M", exact: true }),
  ).toBeEnabled();
});

test("a bundle lists every component and posts bundleSelections for selectable ones only", async ({
  page,
  fake,
}) => {
  const b = makeBundle();
  fake.products = [b];
  await login(page);
  await page.goto(`/th/souvenirs/products/${b.id}`);
  await expect(
    page.getByText("แก้วน้ำ Pris × 1", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("เสื้อยืด Pris × 1", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".merch-detail-price")).toHaveText("฿450.00 / ชุด");
  await expect(addButton(page)).toBeDisabled();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await expect(addButton(page)).toBeEnabled();
  await page.getByLabel("จำนวนชุด", { exact: true }).fill("2");
  await addButton(page).click();
  await expect(
    page.locator("header .merch-header-cart:visible .merch-cart-badge"),
  ).toHaveText("2");
  expect(posts(fake)[0].body).toEqual({
    productId: b.id,
    variantId: null,
    bundleSelections: [
      {
        componentId: "10000000-0000-4000-8000-000000000032",
        variantId: "10000000-0000-4000-8000-000000000021",
      },
    ],
    quantity: 2,
  });
});

test("a bundle with an unavailable component is not purchasable and says why", async ({
  page,
  fake,
}) => {
  const b = makeBundle({
    purchasable: false,
    unavailableCodes: ["COMPONENT_UNAVAILABLE"],
  });
  fake.products = [b];
  await page.goto(`/th/souvenirs/products/${b.id}`);
  await expect(
    page.getByText("สินค้าในชุดบางรายการปิดการขาย", { exact: true }),
  ).toBeVisible();
  await expect(addButton(page)).toBeDisabled();
});

for (const [code, text] of [
  ["PRODUCT_DISABLED", "สินค้านี้ปิดการขายชั่วคราว"],
  ["VARIANT_DISABLED", "ตัวเลือกนี้ปิดการขาย"],
] as const)
  test(`unavailable code ${code} is explained`, async ({ page, fake }) => {
    const p = makeSingle({ purchasable: false, unavailableCodes: [code] });
    fake.products = [p];
    await page.goto(`/th/souvenirs/products/${p.id}`);
    await expect(page.getByText(text, { exact: true })).toBeVisible();
    await expect(addButton(page)).toBeDisabled();
  });

test("a closed store keeps the product readable with buying disabled", async ({
  page,
  fake,
}) => {
  fake.store = makeStore({ state: "closed" });
  fake.products = [
    makeSingle({ purchasable: false, unavailableCodes: ["STORE_NOT_OPEN"] }),
  ];
  await page.goto(`/th/souvenirs/products/${ids.product}`);
  await expect(
    page.getByText("ปิดรับพรีออเดอร์แล้ว", { exact: true }),
  ).toBeVisible();
  await expect(addButton(page)).toBeDisabled();
});

test("an unknown product says so and offers no add", async ({ page, fake }) => {
  fake.products = [];
  await page.goto(`/th/souvenirs/products/${ids.product}`);
  await expect(
    page.getByText("ไม่พบสินค้าที่เปิดแสดง", { exact: true }),
  ).toBeVisible();
  await expect(addButton(page)).toHaveCount(0);
});

test("anonymous add goes to login with the intent, then resumes exactly one POST and restores the choice", async ({
  page,
  fake,
}) => {
  const p = makeOptionsProduct();
  fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  await page.getByRole("button", { name: "ขาว", exact: true }).click();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByLabel("จำนวน", { exact: true }).fill("3");
  await addButton(page).click();
  await expect(page).toHaveURL(/\/th\/login\?redirect=/);
  const redirect = new URL(page.url()).searchParams.get("redirect")!;
  expect(redirect).toMatch(
    new RegExp(`^/souvenirs/products/${p.id}\\?intentId=[0-9a-f-]{36}$`),
  );
  expect(posts(fake)).toHaveLength(0);
  // The real login page (Turnstile) cannot run against the fake: sign in
  // through the stored session and follow the redirect target.
  await login(page);
  await page.goto("/th" + redirect);
  await expect(
    page.locator("header .merch-header-cart:visible .merch-cart-badge"),
  ).toHaveText("3");
  await expect(
    page.getByText("เพิ่มลงตะกร้าแล้ว", { exact: true }),
  ).toBeVisible();
  await expect(page).not.toHaveURL(/intentId=/);
  await expect(
    page.getByRole("button", { name: "M", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("จำนวน", { exact: true })).toHaveValue("3");
  await page.reload();
  expect(posts(fake)).toHaveLength(1);
  expect(posts(fake)[0].body).toMatchObject({ variantId: M, quantity: 3 });
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("pris_merchandise_intent"),
    ),
  ).toBeNull();
});

test("a rejected add shows the API message, clears the intent and stays on the product", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  fake.failNext("POST", "/cart/items", {
    status: 422,
    body: {
      success: false,
      code: "MERCH_PRODUCT_UNAVAILABLE",
      error: "สินค้านี้ไม่พร้อมขายแล้ว",
      requestId: "r1",
    },
  });
  await login(page);
  await page.goto(`/th/souvenirs/products/${p.id}`);
  await addButton(page).click();
  await expect(
    page.getByText("สินค้านี้ไม่พร้อมขายแล้ว", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/souvenirs/products/${p.id}$`));
  await expect(addButton(page)).toBeEnabled();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("pris_merchandise_intent"),
    ),
  ).toBeNull();
  await expect(
    page.locator("header .merch-header-cart:visible .merch-cart-badge"),
  ).toHaveText("0");
  await addButton(page).click();
  await expect(
    page.locator("header .merch-header-cart:visible .merch-cart-badge"),
  ).toHaveText("1");
});

test("quantity stepper is three equal-height cells with the value centred", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  const minus = (await page
    .getByRole("button", { name: "ลดจำนวน" })
    .boundingBox())!;
  const plus = (await page
    .getByRole("button", { name: "เพิ่มจำนวน" })
    .boundingBox())!;
  const box = (await page
    .locator(".merch-detail-quantity > div")
    .boundingBox())!;
  expect(minus.width).toBe(44);
  expect(plus.width).toBe(44);
  expect(minus.height).toBe(plus.height);
  expect(
    Math.abs(minus.x - box.x - (box.x + box.width - plus.x - plus.width)),
  ).toBeLessThan(1);
});
