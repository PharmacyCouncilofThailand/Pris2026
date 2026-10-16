import { test, expect, login } from "./fixtures";
import type { Locator, Page } from "@playwright/test";
import type { FakeMerchApi } from "./fakeApi";
import {
  ids,
  image,
  makeOrder,
  makeSingle,
  makeStore,
  stubImages,
  uid,
} from "./data";
import { seedCheckout } from "./checkoutHelpers";

const many = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    makeSingle({ id: uid(i + 1), nameTh: `สินค้า ${i + 1}`, sortOrder: i }),
  );
const seedBanners = (fake: FakeMerchApi, n: number) => {
  fake.store = makeStore({
    banners: Array.from({ length: n }, (_, i) => ({
      id: uid(500 + i),
      image: image(600 + i),
      linkUrl: null,
    })),
  });
};

const widths = [320, 390, 430, 768, 834, 1024, 1279, 1280, 1440, 1920];
async function fits(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBe(width);
}
test("both locale headers and catalogue retain the approved columns and one row throughout the viewport matrix", async ({
  page,
  fake,
  context,
}) => {
  await stubImages(context);
  fake.products = many(13);
  seedBanners(fake, 3);
  for (const locale of ["th", "en"]) {
    await page.goto(`/${locale}/souvenirs`);
    await expect(page.locator(".merch-product")).toHaveCount(12);
    for (const width of widths) {
      await fits(page, width);
      const geometry = await page.evaluate(() => {
        const logo = document
          .querySelector("header img")!
          .getBoundingClientRect();
        const tools = [
          ...document.querySelectorAll("header .merch-header-cart"),
        ]
          .map((e) => e.getBoundingClientRect())
          .find((r) => r.width > 0)!;
        const navigation = document
          .querySelector('header [data-slot="navigation-menu"]')
          ?.getBoundingClientRect();
        return {
          logo: logo.right,
          tools: tools.left,
          navigation:
            navigation && navigation.width > 0
              ? { left: navigation.left, right: navigation.right }
              : null,
          delta: Math.abs(
            logo.y + logo.height / 2 - tools.y - tools.height / 2,
          ),
          columns: getComputedStyle(
            document.querySelector(".merch-products")!,
          ).gridTemplateColumns.split(" ").length,
        };
      });
      expect(geometry.logo).toBeLessThanOrEqual(geometry.tools);
      expect(geometry.delta).toBeLessThan(3);
      if (width >= 1280) {
        expect(geometry.navigation).not.toBeNull();
        expect(geometry.navigation!.left).toBeGreaterThanOrEqual(geometry.logo);
        expect(geometry.navigation!.right).toBeLessThanOrEqual(geometry.tools);
      } else expect(geometry.navigation).toBeNull();
      expect(geometry.columns).toBe(width < 768 ? 2 : width < 1280 ? 3 : 4);
    }
  }
});

test("menu keyboard containment, Escape and focus return preserve scrolling and bar clearance", async ({
  page,
  fake,
  context,
}) => {
  await stubImages(context);
  fake.products = many(13);
  seedBanners(fake, 3);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/th/souvenirs");
  const menu = page.getByRole("button", { name: "Toggle mobile menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press("Tab");
    // Radix parks focus on a guard sentinel for one tick before wrapping it back.
    await expect
      .poll(() => dialog.evaluate((e) => e.contains(document.activeElement)))
      .toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(menu).toBeFocused();
  for (const target of [
    page.getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true }).last(),
  ]) {
    await target.focus();
    await target.scrollIntoViewIfNeeded();
    expect(
      await target.evaluate((e) => {
        const r = e.getBoundingClientRect(),
          top = document.elementFromPoint(
            r.left + r.width / 2,
            r.top + r.height / 2,
          );
        return !!top && e.contains(top);
      }),
    ).toBe(true);
  }
});

test("shop controls have names, image alternatives, visible keyboard focus and 44 pixel targets", async ({
  page,
  fake,
  context,
}) => {
  await stubImages(context);
  fake.products = many(13);
  seedBanners(fake, 3);
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  const search = page.getByRole("searchbox", {
    name: "ค้นหาสินค้า",
    exact: true,
  });
  await search.focus();
  await expect(search).toBeFocused();
  expect(
    await page
      .locator(".merch-search")
      .evaluate((e) => getComputedStyle(e).outlineStyle),
  ).not.toBe("none");
  expect(await page.locator("main img:not([alt])").count()).toBe(0);
  for (const element of await page
    .locator(
      "header .merch-header-cart:visible, .merch-product button, .merch-categories button",
    )
    .all()) {
    await expect(element).toHaveAccessibleName(/\S/);
    const box = await element.boundingBox();
    // DOMRect may round 44px to 43.99993896484375 in Firefox.
    expect(box!.height + 1 / 64).toBeGreaterThanOrEqual(44);
    expect(box!.width + 1 / 64).toBeGreaterThanOrEqual(44);
  }
});

test("address errors have associated messages and keyboard focus, and remain clear at reflow and 200 percent text zoom", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await page.goto("/th/souvenirs/checkout");
  const phone = page.getByLabel("เบอร์โทรผู้รับ", { exact: true });
  await phone.fill("");
  await page
    .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
    .click();
  await expect(phone).toBeFocused();
  await expect(phone).toHaveAttribute("aria-invalid", "true");
  const described = await phone.getAttribute("aria-describedby");
  await expect(page.locator(`#${described}`)).toContainText(
    "กรุณากรอกเบอร์โทรผู้รับ",
  );
  for (const field of await page
    .locator(".merch-recipient-form input, .merch-recipient-form textarea")
    .all())
    await expect(field).toHaveAccessibleName(/\S/);
  for (const width of widths) await fits(page, width);
  // 200% text-only zoom plus a 640 -> 320 CSS-pixel reflow. This is not an OS/device zoom claim.
  await page.addStyleTag({ content: "html{font-size:200%}" });
  await fits(page, 320);
  await phone.focus();
  await phone.scrollIntoViewIfNeeded();
  const field = await phone.boundingBox(),
    bar = await page.locator(".merch-checkout-bar").boundingBox();
  expect(field!.y + field!.height).toBeLessThanOrEqual(bar!.y + 1);
});

test("long saved shipment values wrap at narrow widths", async ({
  page,
  fake,
}) => {
  const order = makeOrder({
    paymentStatus: "paid",
    paidAt: "2026-10-15T03:30:00.000Z",
    shipping: {
      status: "shipped",
      carrier: "C".repeat(150),
      trackingId: "0".repeat(150),
      shippedAt: "2026-10-16T03:00:00.000Z",
    },
    payment: {
      state: "paid",
      attempt: null,
      canRequestNewQr: false,
      canCheck: false,
      retryAfterSeconds: null,
      serverNow: "2026-10-16T03:00:00.000Z",
    },
  });
  fake.orders.set(order.id, order);
  await login(page);
  await page.goto(`/th/souvenirs/orders/${order.id}`);
  await expect(page.locator(".merch-tracking strong")).toBeVisible();
  for (const width of [320, 390, 834, 1440]) await fits(page, width);
});

test("reduced motion keeps manual banner controls, keyboard navigation and cancellation usable", async ({
  page,
  fake,
  context,
}) => {
  await stubImages(context);
  fake.products = many(2);
  seedBanners(fake, 3);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/th/souvenirs");
  const next = page.getByRole("button", { name: "แบนเนอร์ถัดไป", exact: true });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "ดูแบนเนอร์ 2", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await page.locator(".merch-banner-art").dispatchEvent("pointerdown", {
    pointerType: "touch",
    clientX: 240,
    clientY: 180,
  });
  await page
    .locator(".merch-banner-art")
    .dispatchEvent("pointercancel", { pointerType: "touch" });
  await next.click();
  await expect(
    page.getByRole("button", { name: "ดูแบนเนอร์ 3", exact: true }),
  ).toHaveAttribute("aria-current", "true");
});

const luminance = (s: string) => {
  const c = s
    .match(/[\d.]+/g)!
    .slice(0, 3)
    .map(Number)
    .map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
};
/** Asserts computed contrast; `large` also requires WCAG large text (>=19px, bold). */
async function expectContrast(locator: Locator, large = false) {
  const style = await locator.evaluate((e) => {
    const s = getComputedStyle(e);
    return {
      fg: s.color,
      bg: s.backgroundColor,
      image: s.backgroundImage,
      size: parseFloat(s.fontSize),
      weight: Number(s.fontWeight),
    };
  });
  if (large) {
    expect(style.size).toBeGreaterThanOrEqual(19);
    expect(style.weight).toBeGreaterThanOrEqual(700);
  }
  const colors =
    style.image === "none" ? [style.bg] : style.image.match(/rgb\([^)]+\)/g)!;
  expect(colors?.length).toBeGreaterThan(0);
  const foreground = luminance(style.fg),
    threshold =
      style.size >= 24 || (style.size >= 18.66 && style.weight >= 700)
        ? 3
        : 4.5;
  for (const color of colors) {
    const background = luminance(color);
    expect(
      (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05),
    ).toBeGreaterThanOrEqual(threshold);
  }
}

test("computed primary action contrast meets WCAG text requirements", async ({
  page,
  fake,
  context,
}) => {
  await stubImages(context);
  fake.products = many(13);
  seedBanners(fake, 1);
  fake.seedLine({
    productId: fake.products[0].id,
    variantId: fake.products[0].variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  const order = makeOrder({ id: ids.order });
  fake.orders.set(order.id, order);
  await login(page);
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  await expectContrast(
    page.getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true }).first(),
  );
  await expectContrast(page.locator("header .merch-cart-badge:visible"));
  await page.goto("/th/souvenirs/cart");
  const barButton = page.locator(".merch-checkout-bar > button");
  await expect(barButton).toBeEnabled();
  for (const width of [320, 390, 479, 480, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expectContrast(barButton, true);
  }
  await page.clock.install();
  await page.goto(`/th/souvenirs/orders/${order.id}`);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
  fake.setPayment(order.id, { state: "paid", canCheck: false, attempt: null });
  await page.clock.runFor(10_000);
  const justPaid = page.locator(".merch-just-paid-button");
  await expect(justPaid).toBeVisible();
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expectContrast(justPaid, true);
  }
});

test("product, cart, history and order detail reflow across the complete viewport matrix", async ({
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
  const order = makeOrder({ id: ids.order });
  fake.orders.set(order.id, order);
  await login(page);
  for (const path of [
    `/th/souvenirs/products/${product.id}`,
    "/th/souvenirs/cart",
    "/th/souvenirs/orders",
    `/th/souvenirs/orders/${order.id}`,
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1").first()).toBeVisible();
    for (const width of widths) await fits(page, width);
  }
});
