import { test, expect, login } from "./fixtures";
import { makeSingle, makeOrder, uid } from "./data";
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
  await page.setViewportSize({ width: 1600, height: 900 });
  await expect(
    page.getByRole("link", { name: /login|เข้าสู่ระบบ/i }).first(),
  ).toBeVisible();
  await expect(page.locator("header .merch-header-cart:visible")).toBeVisible();
});

// Reads what makes the header look the way it does, so a shop page can be
// compared with a normal light page (/th/about).
const headerLook = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const header = document.querySelector("header")!;
    const nav = header.querySelector('[data-slot="navigation-menu"]');
    const list = nav?.querySelector("ul");
    const link = [...header.querySelectorAll("a")].find(
      (a) => a.textContent?.trim() === "ของที่ระลึก",
    );
    return {
      background: getComputedStyle(header).backgroundColor,
      border: getComputedStyle(header).borderBottomColor,
      navVisible: !!nav && nav.getBoundingClientRect().width > 0,
      listGap: list ? getComputedStyle(list).columnGap : null,
      linkPadding: link ? getComputedStyle(link).paddingLeft : null,
      linkColor: link ? getComputedStyle(link).color : null,
    };
  });

test("the shop header looks exactly like a normal light page, plus the cart", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle()];
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/th/about");
  await expect(page.locator("header img").first()).toBeVisible();
  const normal = await headerLook(page);
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(1);
  const shop = await headerLook(page);
  expect(shop).toEqual(normal);
  await expect(page.locator("header .merch-header-cart:visible")).toBeVisible();
  await expect(
    page.locator("header").getByRole("link", { name: "ของที่ระลึก" }),
  ).toHaveAttribute("aria-current", "page");
  // Scrolled: the header turns dark like other pages, and the cart turns light with it.
  await page.evaluate(() => {
    document.body.style.minHeight = "3000px";
    window.scrollTo(0, 400);
  });
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.querySelector("header")!).backgroundColor))
    .not.toBe(normal.background);
  await expect(page.locator("header .merch-header-cart:visible")).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
});

test("below 1536px the shop header uses the compact menu so nothing overlaps; other pages are untouched", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle()];
  for (const width of [1280, 1440, 1535]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/th/souvenirs");
    await expect(page.locator(".merch-product")).toHaveCount(1);
    expect((await headerLook(page)).navVisible).toBe(false);
    await expect(page.locator("header .merch-header-cart:visible")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Toggle mobile menu" }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/th/about");
  await expect(page.locator("header img").first()).toBeVisible();
  expect((await headerLook(page)).navVisible).toBe(true);
  // At 1536 and up the shop shows the full menu next to the cart without overlap.
  for (const width of [1536, 1600, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/th/souvenirs");
    await expect(page.locator(".merch-product")).toHaveCount(1);
    const gap = await page.evaluate(() => {
      const header = document.querySelector("header")!;
      const nav = header.querySelector('[data-slot="navigation-menu"]')!.getBoundingClientRect();
      const cart = [...header.querySelectorAll(".merch-header-cart")]
        .map((e) => e.getBoundingClientRect())
        .find((r) => r.width > 0)!;
      return cart.left - nav.right;
    });
    expect(gap, `${width}px`).toBeGreaterThanOrEqual(0);
  }
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

test("the current souvenir item in the phone menu has readable contrast on black", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle()];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/th/souvenirs");
  await page.getByRole("button", { name: "Toggle mobile menu" }).click();
  const item = page
    .getByRole("dialog")
    .getByRole("link", { name: "ของที่ระลึก" });
  await expect(item).toBeVisible();
  await expect(item).toHaveAttribute("aria-current", "page");
  const ratio = await item.evaluate((el) => {
    // Resolve any CSS colour (rgb, oklch, ...) to sRGB through a canvas.
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.fillStyle = getComputedStyle(el).color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
    const channel = (v: number) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const lum = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    return (lum + 0.05) / 0.05; // against rgb(0, 0, 0)
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});

test("no shop text is smaller than 13px", async ({ page, fake }) => {
  const p = seedCheckout(fake);
  await login(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const small = () =>
    page.evaluate(() => {
      const bad: string[] = [];
      for (const el of Array.from(document.querySelectorAll("main *, header .merch-header-cart .merch-cart-badge"))) {
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
  const order = makeOrder({ id: uid(1), orderNumber: "PRIS2026-M-000001" });
  fake.orders.set(order.id, order);
  await page.goto("/th/souvenirs/orders");
  await expect(page.locator(".merch-history-row")).toHaveCount(1);
  expect(await small()).toEqual([]);
  await page.goto(`/th/souvenirs/orders/${order.id}`);
  await expect(page.locator(".merch-payment-qr")).toBeVisible();
  expect(await small()).toEqual([]);
});