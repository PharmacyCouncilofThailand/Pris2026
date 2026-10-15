import { test, expect } from "./live-fixture";
import type { ProductDto, CartDto } from "../../src/types/merchandise";
type Catalog = {
  product: ProductDto;
  bundle: ProductDto;
  noOptions: ProductDto;
};
const addButton = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: /^เพิ่มลงตะกร้า/ });

test("no-option product has no empty selectors, renders safe Thai copy and permits uncapped integer quantities", async ({
  page,
  merchandise,
}) => {
  const { noOptions } = await merchandise.command<Catalog>("variantCatalog");
  await page.goto(`/th/souvenirs/products/${noOptions.id}`);
  await expect(
    page.getByRole("heading", { name: noOptions.nameTh, exact: true }),
  ).toBeVisible();
  await expect(page.locator("fieldset")).toHaveCount(0);
  await expect(page.locator(".merch-detail-price")).toHaveText(
    "฿100.00 / ชิ้น",
  );
  await expect(
    page.getByRole("heading", { name: "การผลิต", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "การจัดส่ง", exact: true }),
  ).toHaveCount(0);
  await expect(addButton(page)).toBeEnabled();
  const quantity = page.getByLabel("จำนวน", { exact: true });
  await quantity.fill("1000000");
  await expect(addButton(page)).toBeEnabled();
  await quantity.fill("0");
  await expect(addButton(page)).toBeDisabled();
  await expect(
    page.getByText("กรุณาระบุจำนวนเต็มตั้งแต่ 1 ขึ้นไป", { exact: true }),
  ).toBeVisible();
  await quantity.fill("1");
  for (const width of [320, 834, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await quantity.focus();
    await quantity.scrollIntoViewIfNeeded();
    const q = await quantity.boundingBox(),
      bar = await page.locator(".merch-detail-bar").boundingBox();
    expect(q!.y + q!.height).toBeLessThanOrEqual(bar!.y);
  }
});

test("actual color-size pairs require explicit choices and update exact variant price before real Add", async ({
  page,
  merchandise,
}) => {
  const { product } = await merchandise.command<Catalog>("variantCatalog");
  await merchandise.login(page);
  await page.goto(`/th/souvenirs/products/${product.id}`);
  await expect(addButton(page)).toBeDisabled();
  await page.getByRole("button", { name: "น้ำเงิน", exact: true }).click();
  await expect(addButton(page)).toBeDisabled();
  await page.getByRole("button", { name: "L", exact: true }).click();
  await expect(page.locator(".merch-detail-price")).toHaveText(
    "฿150.00 / ชิ้น",
  );
  await page.getByRole("button", { name: "ส้ม", exact: true }).click();
  await expect(addButton(page)).toBeDisabled();
  await expect(page.getByRole("button", { name: /^L/ })).toBeDisabled();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await expect(page.locator(".merch-detail-price")).toHaveText(
    "฿130.00 / ชิ้น",
  );
  await expect(
    page.getByText("<script>ไม่ใช่ HTML</script>", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("จำนวน", { exact: true }).fill("2");
  await addButton(page).click();
  await expect(page.locator(".merch-cart-badge")).toHaveText("2");
  const { cart } = await merchandise.command<{ cart: CartDto }>("inspect");
  expect(cart.items[0].variantId).toBe(
    product.variants.find((v) => v.colorTh === "ส้ม" && v.sizeTh === "M")!.id,
  );
  expect(cart.items[0].unitPriceMinor).toBe("13000");
  expect(cart.items[0].quantity).toBe(2);
});

test("Bundle exposes fixed BOM and explicit choices, charges the set price and counts sets once", async ({
  page,
  merchandise,
}) => {
  const { bundle } = await merchandise.command<Catalog>("variantCatalog");
  await merchandise.login(page);
  await page.goto(`/th/souvenirs/products/${bundle.id}`);
  await expect(
    page.getByRole("heading", { name: "แก้ว Mug × 2", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("ไม่มีตัวเลือก · กำหนดไว้ในชุด", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".merch-detail-price")).toHaveText("฿220.00 / ชุด");
  await expect(addButton(page)).toBeDisabled();
  await page.getByRole("button", { name: "น้ำเงิน", exact: true }).click();
  await page.getByRole("button", { name: "L", exact: true }).click();
  await expect(page.locator(".merch-detail-price")).toHaveText("฿220.00 / ชุด");
  await page.getByLabel("จำนวนชุด", { exact: true }).fill("2");
  await addButton(page).click();
  await expect(page.locator(".merch-cart-badge")).toHaveText("2");
  const { cart } = await merchandise.command<{ cart: CartDto }>("inspect");
  expect(cart.items).toHaveLength(1);
  expect(cart.items[0].quantity).toBe(2);
  expect(cart.items[0].unitPriceMinor).toBe("22000");
  expect(cart.items[0].lineTotalMinor).toBe("44000");
  expect(cart.items[0].bundleSelections).toHaveLength(1); // Fixed BOM is server-owned, only the buyer choice travels on the wire.
});

test("anonymous chosen variant returns through existing login with the same quantity and choice", async ({
  page,
  merchandise,
}) => {
  const { product } = await merchandise.command<Catalog>("variantCatalog");
  await merchandise.mockLogin(page);
  await page.goto(`/th/souvenirs/products/${product.id}`);
  await page.getByRole("button", { name: "น้ำเงิน", exact: true }).click();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByLabel("จำนวน", { exact: true }).fill("3");
  await addButton(page).click();
  await expect(
    page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
  ).toBeVisible();
  expect(
    (await merchandise.command<{ cartMutations: number }>("inspect"))
      .cartMutations,
  ).toBe(0);
  await page.getByLabel("อีเมล", { exact: true }).fill("buyer@example.test");
  await page
    .getByLabel("รหัสผ่าน", { exact: true })
    .fill("synthetic-test-password");
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page.locator(".merch-cart-badge")).toHaveText("3");
  await expect(
    page.getByRole("button", { name: "น้ำเงิน", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "M", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("จำนวน", { exact: true })).toHaveValue("3");
});

test("paused product refreshes actual availability without substituting the selected variant", async ({
  page,
  merchandise,
}) => {
  const { product } = await merchandise.command<Catalog>("variantCatalog");
  await merchandise.login(page);
  await page.goto(`/th/souvenirs/products/${product.id}`);
  await page.getByRole("button", { name: "น้ำเงิน", exact: true }).click();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await merchandise.command("sale", { id: product.id, enabled: false });
  await addButton(page).click();
  await expect(
    page.getByText("สินค้านี้ยังไม่เปิดขาย", { exact: true }),
  ).toBeVisible();
  await expect(addButton(page)).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "M", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    (await merchandise.command<{ unitCount: string }>("inspect")).unitCount,
  ).toBe("0");
});

test("closed store preserves details with buying disabled and unknown products expose no Add", async ({
  page,
  merchandise,
}) => {
  const { noOptions } = await merchandise.command<Catalog>("variantCatalog");
  await merchandise.command("closeStore");
  await page.goto(`/th/souvenirs/products/${noOptions.id}`);
  await expect(
    page.getByText("ปิดรับพรีออเดอร์แล้ว", { exact: true }),
  ).toBeVisible();
  await expect(addButton(page)).toBeDisabled();
  await page.goto(
    "/th/souvenirs/products/10000000-0000-4000-8000-000000000001",
  );
  await expect(
    page.getByText("ไม่พบสินค้าที่เปิดแสดง", { exact: true }),
  ).toBeVisible();
  await expect(addButton(page)).toHaveCount(0);
});

test("a real 409 between selection validation and Add reloads choices and preserves the selected SKU", async ({
  page,
  merchandise,
}) => {
  const { product } = await merchandise.command<Catalog>("variantCatalog");
  await merchandise.login(page);
  await page.goto(`/th/souvenirs/products/${product.id}`);
  await page.getByRole("button", { name: "น้ำเงิน", exact: true }).click();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.route(
    merchandise.origin + "/api/v1/merchandise/events/PRIS-2026/cart/items",
    async (route) => {
      await merchandise.command("sale", { id: product.id, enabled: false });
      await route.continue();
    },
  );
  await addButton(page).click();
  await expect(
    page.getByText(
      "ข้อมูลสินค้ามีการเปลี่ยนแปลง กรุณาตรวจสอบตัวเลือกและราคาอีกครั้ง",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText("สินค้านี้ยังไม่เปิดขาย", { exact: true }),
  ).toBeVisible();
  await expect(addButton(page)).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "M", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    (await merchandise.command<{ unitCount: string }>("inspect")).unitCount,
  ).toBe("0");
});

test("fixed Bundle Add from the storefront sends no fixed choices and charges one set", async ({
  page,
  merchandise,
}) => {
  const { bundle } = await merchandise.command<{ bundle: ProductDto }>(
    "catalog",
    { banners: 0 },
  );
  await merchandise.login(page);
  await page.goto("/th/souvenirs?kind=bundle");
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await page
    .getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true })
    .click();
  await expect(page.locator(".merch-cart-badge")).toHaveText("1");
  const { cart } = await merchandise.command<{ cart: CartDto }>("inspect");
  expect(cart.items[0].productId).toBe(bundle.id);
  expect(cart.items[0].bundleSelections).toHaveLength(0);
  expect(cart.items[0].unitPriceMinor).toBe("22000");
});

test("unknown fixed-Bundle reply survives reload with one wire key and restores usable fixed selections", async ({
  page,
  merchandise,
}) => {
  const { bundle } = await merchandise.command<{ bundle: ProductDto }>(
    "catalog",
    { banners: 0 },
  );
  await merchandise.login(page);
  const bodies: string[] = [],
    keys: string[] = [];
  await page.route(
    merchandise.origin + "/api/v1/merchandise/events/PRIS-2026/cart/items",
    async (route) => {
      bodies.push(route.request().postData()!);
      keys.push(route.request().headers()["idempotency-key"]);
      const response = await route.fetch();
      if (bodies.length === 1) await route.abort("failed");
      else await route.fulfill({ response });
    },
  );
  await page.goto(`/th/souvenirs/products/${bundle.id}`);
  await addButton(page).click();
  await expect(
    page.getByText(
      "ยังยืนยันผลเพิ่มสินค้าลงตะกร้าไม่ได้ กรุณาตรวจสอบอีกครั้ง",
      { exact: true },
    ),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".merch-cart-badge")).toHaveText("1");
  await expect(addButton(page)).toBeEnabled();
  expect(bodies).toHaveLength(2);
  expect(bodies[0]).toBe(bodies[1]);
  expect(keys[0]).toBe(keys[1]);
  expect(
    (await merchandise.command<{ unitCount: string }>("inspect")).unitCount,
  ).toBe("1");
});
