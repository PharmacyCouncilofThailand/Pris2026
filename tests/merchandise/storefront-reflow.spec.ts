import { test, expect } from "./live-fixture";

test("200-percent-equivalent desktop reflow keeps search and the last action reachable", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 1 });
  // A 1280 CSS-pixel desktop at 200% browser zoom has a 640 CSS-pixel
  // viewport. Test that reflow directly; this does not claim native UI zoom.
  await page.setViewportSize({ width: 640, height: 450 });
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    640,
  );
  const search = page.getByRole("searchbox");
  await search.focus();
  await expect(search).toBeFocused();
  const last = page
    .getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true })
    .last();
  await last.focus();
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeFocused();
  const action = await last.boundingBox();
  const bar = await page.locator(".merch-bottom-bar").boundingBox();
  expect(action!.y + action!.height).toBeLessThanOrEqual(bar!.y);
});
