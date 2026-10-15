import { test, expect } from "./live-fixture";
test("responsive columns and one-row header cover the approved viewport matrix", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 1 });
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  for (const width of [
    320, 375, 390, 430, 767, 768, 834, 1024, 1279, 1280, 1440, 1920,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page
          .locator(".merch-products")
          .evaluate(
            (e) => getComputedStyle(e).gridTemplateColumns.split(" ").length,
          ),
      )
      .toBe(width < 768 ? 2 : width < 1280 ? 3 : 4);
    const layout = await page.evaluate(() => {
      const logo = document
          .querySelector("header img")!
          .getBoundingClientRect(),
        tools = document
          .querySelector(".merch-header-tools")!
          .getBoundingClientRect();
      return {
        width: document.documentElement.scrollWidth,
        logoRight: logo.right,
        toolLeft: tools.left,
        delta: Math.abs(
          logo.top + logo.height / 2 - (tools.top + tools.height / 2),
        ),
      };
    });
    expect(layout.width, width + " overflow").toBe(width);
    expect(layout.logoRight).toBeLessThanOrEqual(layout.toolLeft);
    expect(layout.delta).toBeLessThan(3);
  }
});
test("last product and footer controls stay clear of the fixed bar; keyboard menu restores focus", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 3 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  const last = page
    .getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true })
    .last();
  await last.scrollIntoViewIfNeeded();
  const buttonBox = await last.boundingBox(),
    barBox = await page.locator(".merch-bottom-bar").boundingBox();
  expect(buttonBox!.y + buttonBox!.height).toBeLessThanOrEqual(barBox!.y);
  const primary = page.getByRole("button", {
    name: "เข้าสู่ระบบเพื่อสั่งซื้อ",
    exact: true,
  });
  await expect(primary).toHaveCount(1);
  const styles = await primary.evaluate((e) => {
    const s = getComputedStyle(e);
    return {
      font: s.fontSize,
      weight: s.fontWeight,
      height: e.getBoundingClientRect().height,
    };
  });
  expect(parseFloat(styles.font)).toBeGreaterThanOrEqual(19);
  expect(Number(styles.weight)).toBeGreaterThanOrEqual(700);
  expect(styles.height).toBeGreaterThanOrEqual(52); // Frozen home renderer; P03 secondary buttons have a separate 56px spec.
  const menu = page.getByRole("button", { name: "เปิดเมนู", exact: true });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(menu).toBeFocused();
  const footerLink = page.locator("footer a").last();
  await footerLink.focus();
  await footerLink.scrollIntoViewIfNeeded();
  const f = await footerLink.boundingBox(),
    bar = await page.locator(".merch-bottom-bar").boundingBox();
  expect(f!.y + f!.height).toBeLessThanOrEqual(bar!.y);
});
