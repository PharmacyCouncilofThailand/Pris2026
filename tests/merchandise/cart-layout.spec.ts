import { test, expect, login } from "./fixtures";
import { makeSingle } from "./data";

test("cart layout, fixed action clearance and keyboard focus", async ({
  page,
  fake,
}) => {
  const product = makeSingle();
  fake.products = [product];
  fake.seedLine({
    productId: product.id,
    variantId: product.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-row")).toHaveCount(1);
  for (const [width, height] of [
    [320, 700],
    [390, 844],
    [834, 1112],
    [1440, 1000],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    const last = page.getByRole("button", {
      name: `ลบ ${product.nameTh}`,
      exact: true,
    });
    await last.scrollIntoViewIfNeeded();
    const action = await last.boundingBox();
    const bar = await page.locator(".merch-cart-bar").boundingBox();
    expect(action!.y + action!.height).toBeLessThanOrEqual(bar!.y);
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  const plus = page.getByRole("button", {
    name: `เพิ่มจำนวน ${product.nameTh}`,
    exact: true,
  });
  await plus.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByLabel(`จำนวน ${product.nameTh}`, { exact: true }),
  ).toHaveValue("2");
  await expect(plus).toBeFocused();
  const remove = page.getByRole("button", {
    name: `ลบ ${product.nameTh}`,
    exact: true,
  });
  await remove.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีสินค้าในตะกร้า", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "ตะกร้าสินค้า", exact: true }),
  ).toBeFocused();
});

test("cart controls meet the 44px target size", async ({ page, fake }) => {
  const product = makeSingle();
  fake.products = [product];
  fake.seedLine({
    productId: product.id,
    variantId: product.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  for (const name of [
    `ลดจำนวน ${product.nameTh}`,
    `เพิ่มจำนวน ${product.nameTh}`,
    `ลบ ${product.nameTh}`,
  ]) {
    const box = await page
      .getByRole("button", { name, exact: true })
      .boundingBox();
    expect(box!.width, name).toBeGreaterThanOrEqual(44);
    expect(box!.height, name).toBeGreaterThanOrEqual(44);
  }
});
