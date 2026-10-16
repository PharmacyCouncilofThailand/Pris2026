import { test, expect, login } from "./fixtures";
import { makeSingle } from "./data";

test("souvenir pages use the site header and show no footer", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle()];
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of [
    "/th/souvenirs",
    `/th/souvenirs/products/${fake.products[0].id}`,
  ]) {
    await page.goto(path);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator(".merch-header-tools")).toHaveCount(0);
    await expect(
      page.locator("header .merch-header-cart:visible"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Toggle mobile menu" }),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(
    page.getByRole("link", { name: /login|เข้าสู่ระบบ/i }).first(),
  ).toBeVisible();
  await expect(page.locator("header .merch-header-cart:visible")).toBeVisible();
});

test("logged-out cart button goes to login and back to the cart", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  await page.locator("header .merch-header-cart:visible").click();
  await expect(page).toHaveURL(/\/th\/login\?redirect=%2Fsouvenirs%2Fcart$/);
});

test("logged-in cart badge shows the cart units", async ({ page, fake }) => {
  const p = makeSingle();
  fake.products = [p];
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 3,
  });
  await login(page);
  await page.goto("/th/souvenirs");
  await expect(
    page.locator("header .merch-header-cart:visible"),
  ).toHaveAccessibleName("ตะกร้า 3 รายการ");
});
