import { test, expect } from "./live-fixture";
import type { ProductDto } from "../../src/types/merchandise";
import { mkdir } from "node:fs/promises";

test("cart layout, fixed action clearance and keyboard focus follow the approved references", async ({
  page,
  merchandise,
}, info) => {
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
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-row")).toHaveCount(1);
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
    const last = page.getByRole("button", {
      name: `ลบ ${product.nameTh}`,
      exact: true,
    });
    await last.scrollIntoViewIfNeeded();
    const action = await last.boundingBox(),
      bar = await page.locator(".merch-cart-bar").boundingBox();
    expect(action!.y + action!.height).toBeLessThanOrEqual(bar!.y);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    if (info.project.name === "chromium") {
      await mkdir("docs/verification/merchandise/visual", { recursive: true });
      await page.screenshot({
        path: `docs/verification/merchandise/visual/p07-${name}.png`,
        animations: "disabled",
        style: "nextjs-portal { visibility: hidden !important; }",
      });
    }
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
