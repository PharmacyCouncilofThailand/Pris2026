import { test, expect, login } from "./fixtures";
import { makeSingle } from "./data";
import { seedCheckout, openCheckout, reachReview } from "./checkoutHelpers";

test("short shop pages never show the dark site background", async ({ page, fake }) => {
  const p = makeSingle(); fake.products = [p];
  await login(page);
  for (const size of [{ width: 1440, height: 1000 }, { width: 440, height: 956 }])
  for (const path of [`/th/souvenirs/products/${p.id}`, "/th/souvenirs/cart"]) {
    await page.setViewportSize(size);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const color = await page.evaluate(() => {
      const y = window.innerHeight - 4;
      const el = document.elementFromPoint(window.innerWidth / 2, y)!;
      let n: Element | null = el;
      while (n && getComputedStyle(n).backgroundColor === "rgba(0, 0, 0, 0)") n = n.parentElement;
      return n ? getComputedStyle(n).backgroundColor : "none";
    });
    // The route scope itself must paint the light page colour over the whole viewport,
    // so whatever sits below or behind a short page (or a fixed bar) is never the dark body.
    const scope = await page.evaluate(() => {
      const el = document.querySelector(".merchandise-route-scope")!;
      return { bg: getComputedStyle(el).backgroundColor, bottom: el.getBoundingClientRect().bottom, height: window.innerHeight };
    });
    expect(scope.bg).toBe("rgb(244, 248, 252)");
    expect(scope.bottom).toBeGreaterThanOrEqual(scope.height);
    expect(color).not.toBe("rgb(0, 0, 0)");
    expect(color).not.toMatch(/^rgb\((1[0-9]|[0-9]), /); // no near-black
  }
});

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

test("the souvenir nav item is marked current on shop pages", async ({ page, fake }) => {
  fake.products = [makeSingle()];
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/th/souvenirs");
  const item = page.locator("header").getByRole("link", { name: "ของที่ระลึก" });
  await expect(item).toHaveAttribute("aria-current", "page");
  await expect(item).toHaveCSS("color", "rgb(0, 85, 255)");
});

test("no shop text is smaller than 13px", async ({ page, fake }) => {
  const p = seedCheckout(fake);
  await login(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const small = () =>
    page.evaluate(() => {
      const bad: string[] = [];
      for (const el of Array.from(document.querySelectorAll("main *"))) {
        const hasText = Array.from(el.childNodes).some(
          (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "",
        );
        if (!hasText) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (parseFloat(cs.fontSize) < 13)
          bad.push(`${el.tagName}.${(el as HTMLElement).className} ${cs.fontSize} "${(el.textContent ?? "").trim().slice(0, 30)}"`);
      }
      return bad;
    });
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(1);
  expect(await small()).toEqual([]);
  await page.goto(`/th/souvenirs/products/${p.id}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await small()).toEqual([]);
  await page.goto("/th/souvenirs/cart");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await small()).toEqual([]);
  await openCheckout(page);
  expect(await small()).toEqual([]);
  await reachReview(page);
  expect(await small()).toEqual([]);
});