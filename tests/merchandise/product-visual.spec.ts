import { test, expect } from "./live-fixture";
import type { ProductDto } from "../../src/types/merchandise";
import { mkdir } from "node:fs/promises";

test("approved product layouts render with real synthetic API content across device widths", async ({
  page,
  merchandise,
}, info) => {
  const catalog = await merchandise.command<{
    product: ProductDto;
    bundle: ProductDto;
    noOptions: ProductDto;
  }>("variantCatalog");
  await page.emulateMedia({ reducedMotion: "reduce" });
  let currentProductId: string | null = null;
  for (const [name, product, width, height] of [
    ["options-mobile", catalog.product, 390, 844],
    ["options-tablet", catalog.product, 834, 1112],
    ["options-desktop", catalog.product, 1440, 1000],
    ["bundle-mobile", catalog.bundle, 390, 844],
    ["no-options-mobile", catalog.noOptions, 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    if (currentProductId !== product.id) {
      await page.goto(`/th/souvenirs/products/${product.id}`, { waitUntil: "domcontentloaded" });
      currentProductId = product.id;
    }
    await expect(
      page.getByRole("heading", { name: product.nameTh, exact: true }),
    ).toBeVisible();
    if (product !== catalog.noOptions) {
      await page.getByRole("button", { name: "น้ำเงิน", exact: true }).click();
      await page.getByRole("button", { name: "M", exact: true }).click();
    }
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page
          .locator(".merch-detail-gallery img")
          .evaluateAll((images) =>
            images.every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    if (info.project.name === "chromium") {
      await mkdir("docs/verification/merchandise/visual", { recursive: true });
      await page.screenshot({
        path: `docs/verification/merchandise/visual/p06-${name}.png`,
        fullPage: false,
        animations: "disabled",
        style: "nextjs-portal { visibility: hidden !important; }",
      });
    }
  }
});
