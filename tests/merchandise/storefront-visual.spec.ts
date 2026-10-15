import { test, expect } from "./live-fixture";
import { mkdir } from "node:fs/promises";
test("capture shared renderer integration at three representative viewports", async ({
  page,
  merchandise,
}, info) => {
  await merchandise.command("catalog", { banners: 1 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  for (const [name, width, height] of [
    ["mobile", 390, 844],
    ["tablet", 834, 1112],
    ["desktop", 1440, 1000],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("header img").first()).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator(".merch-product img,.merch-banner img")
          .evaluateAll((images) =>
            images
              .filter(
                (e) =>
                  e.getBoundingClientRect().top < innerHeight &&
                  e.getBoundingClientRect().bottom > 0,
              )
              .every((e) => (e as HTMLImageElement).complete),
          ),
      )
      .toBe(true);
    if (info.project.name === "chromium") {
      await mkdir("docs/verification/merchandise/visual", { recursive: true });
      await page.screenshot({
        path: `docs/verification/merchandise/visual/p05-${name}.png`,
        fullPage: false,
        animations: "disabled",
        style: "nextjs-portal { visibility: hidden !important; }",
      });
    }
  }
});
