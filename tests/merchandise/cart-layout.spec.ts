import type { Page } from "@playwright/test";
import { test, expect, login } from "./fixtures";
import { image, makeOptionsProduct, makeSingle, stubImages, uid } from "./data";
import {
  confirmButton,
  fillAddress,
  reachReview,
  toReviewButton,
} from "./checkoutHelpers";
import type { FakeMerchApi } from "./fakeApi";

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
    const bar = await page.locator(".merch-checkout-bar").boundingBox();
    if (width < 768) {
      // Phone: the fixed bar overlays the page, so rows must clear it.
      expect(action!.y + action!.height).toBeLessThanOrEqual(bar!.y);
    } else {
      // Tablet/desktop: the action panel sits beside the rows, not over them.
      const main = (await page.locator(".merch-flow-main").boundingBox())!;
      expect(bar!.x).toBeGreaterThanOrEqual(main.x + main.width);
    }
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

test("cart row reads image+name / option+stepper+trash / price, and the bar shows total left and action right", async ({
  page,
  fake,
}) => {
  const p = makeOptionsProduct({ nameTh: "เสื้อยืด Pris" });
  fake.products = [p];
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  const name = (await page
    .getByRole("heading", { name: "เสื้อยืด Pris" })
    .boundingBox())!;
  const option = (await page.locator(".merch-cart-row-option").boundingBox())!;
  const stepper = (await page.locator(".merch-cart-stepper").boundingBox())!;
  const trash = (await page
    .getByRole("button", { name: "ลบ เสื้อยืด Pris" })
    .boundingBox())!;
  const price = (await page.locator(".merch-cart-unit-price").boundingBox())!;
  expect(option.y).toBeGreaterThan(name.y);
  expect(
    Math.abs(option.y + option.height / 2 - (stepper.y + stepper.height / 2)),
  ).toBeLessThan(12);
  expect(trash.x).toBeGreaterThan(stepper.x + stepper.width - 1);
  expect(price.y).toBeGreaterThanOrEqual(stepper.y + stepper.height - 1);
  await expect(
    page.getByRole("complementary", { name: "สรุปคำสั่งซื้อ" }),
  ).toHaveCount(0);
  await expect(page.locator(".merch-checkout-bar-total")).toHaveText(
    /รวมยอดสินค้า\s*฿\d/,
  );
  const total = (await page
    .locator(".merch-checkout-bar-total")
    .boundingBox())!;
  const action = (await page
    .getByRole("button", { name: /^ดำเนินการสั่งซื้อ/ })
    .boundingBox())!;
  expect(total.x + total.width).toBeLessThanOrEqual(action.x);
  await expect(
    page
      .locator(".merch-shop-toolbar")
      .getByRole("link", { name: "คำสั่งซื้อของฉัน" }),
  ).toBeVisible();
});

test("last cart row stays above the bar on a phone", async ({ page, fake }) => {
  const ps = [1, 2, 3].map((i) =>
    makeSingle({ id: uid(i), nameTh: `สินค้า ${i}` }),
  );
  fake.products = ps;
  for (const p of ps)
    fake.seedLine({
      productId: p.id,
      variantId: p.variants[0].id,
      bundleSelections: [],
      quantity: 1,
    });
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  const trash = page.getByRole("button", { name: "ลบ สินค้า 3" });
  await trash.scrollIntoViewIfNeeded();
  const t = (await trash.boundingBox())!,
    bar = (await page.locator(".merch-checkout-bar").boundingBox())!;
  expect(t.y + t.height).toBeLessThanOrEqual(bar.y + 1);
});

test("checkout bar keeps a four-digit total on one line beside the action at 320px", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 4,
  });
  await page.setViewportSize({ width: 320, height: 700 });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  const amount = page.locator(".merch-checkout-bar-total strong");
  await expect(amount).toHaveText("฿1,050.00");
  const box = (await amount.boundingBox())!;
  const lineHeight = await amount.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      fontSize: style.fontSize,
      lineHeight:
        parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5,
    };
  });
  expect(lineHeight.fontSize).toBe("18px");
  expect(box.height).toBeLessThanOrEqual(lineHeight.lineHeight + 1);
  const bar = page.locator(".merch-checkout-bar");
  expect(await bar.evaluate((el) => el.scrollWidth === el.clientWidth)).toBe(
    true,
  );
  const total = (await page
    .locator(".merch-checkout-bar-total")
    .boundingBox())!;
  const action = (await page
    .getByRole("button", { name: /^ดำเนินการสั่งซื้อ/ })
    .boundingBox())!;
  expect(
    Math.abs(total.y + total.height / 2 - (action.y + action.height / 2)),
  ).toBeLessThan(6);
});

test("option text keeps a usable width at 375px and the actions stay right-aligned", async ({
  page,
  fake,
  context,
}) => {
  await stubImages(context);
  const p = makeOptionsProduct({ images: [image(1)] });
  fake.products = [p];
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-image")).toBeVisible();
  const option = page.locator(".merch-cart-row-option");
  await expect(option).not.toBeEmpty();
  const box = (await option.boundingBox())!;
  const lineHeight = await option.evaluate((el) =>
    parseFloat(getComputedStyle(el).lineHeight),
  );
  expect(box.width).toBeGreaterThanOrEqual(96);
  expect(box.height).toBeLessThanOrEqual(2 * lineHeight + 2);
  const detail = (await page.locator(".merch-cart-row-detail").boundingBox())!;
  const stepper = (await page.locator(".merch-cart-stepper").boundingBox())!;
  const trash = (await page
    .getByRole("button", { name: `ลบ ${p.nameTh}` })
    .boundingBox())!;
  expect(
    Math.abs(trash.x + trash.width - (detail.x + detail.width)),
  ).toBeLessThanOrEqual(2);
  expect(trash.x).toBeGreaterThanOrEqual(stepper.x + stepper.width - 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    375,
  );
});

/** Holds matching requests until the returned release function is called. */
async function hold(page: Page, glob: string, method: string) {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route(glob, async (route) => {
    if (route.request().method() === method) await gate;
    await route.fallback();
  });
  return release;
}
async function expectBarFits(page: Page, label: string) {
  const button = page.locator(".merch-checkout-bar > button");
  await expect(button).toHaveText(label);
  await expect(page.locator(".merch-checkout-bar-total strong")).toHaveText(
    "฿1,050.00",
  );
  expect(await button.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  expect(
    await page
      .locator(".merch-checkout-bar")
      .evaluate((el) => el.scrollWidth === el.clientWidth),
  ).toBe(true);
}

test("the longest bar labels fit beside a four-digit total at 320px", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 4,
  });
  await page.setViewportSize({ width: 320, height: 700 });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expectBarFits(page, "ดำเนินการสั่งซื้อ");
  const releaseCart = await hold(page, "**/events/PRIS-2026/cart", "GET");
  await page.locator(".merch-checkout-bar > button").click();
  await expectBarFits(page, "กำลังตรวจสอบตะกร้า");
  releaseCart();
  await expect(page).toHaveURL(/\/th\/souvenirs\/checkout$/);
  await expect(
    page.getByRole("heading", { name: "ข้อมูลผู้รับ", exact: true }),
  ).toBeVisible();
  await expectBarFits(page, "ตรวจสอบคำสั่งซื้อ");
  await reachReview(page);
  await expectBarFits(page, "ยืนยันคำสั่งซื้อ");
  const releaseOrder = await hold(page, "**/events/PRIS-2026/orders", "POST");
  await confirmButton(page).click();
  await expectBarFits(page, "กำลังยืนยันคำสั่งซื้อ");
  releaseOrder();
  await expect(page).toHaveURL(/\/th\/souvenirs\/orders\/[0-9a-f-]{36}$/);
});

test("checkout steps are one compact component with connectors", async ({
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
  const steps = page.getByRole("list", { name: "ขั้นตอนสั่งซื้อ" });
  await expect(steps).toHaveClass(/merch-steps/);
  expect((await steps.boundingBox())!.width).toBeLessThanOrEqual(640);
  await expect(steps.locator('[aria-current="step"]')).toContainText("ตะกร้า");
  expect(
    parseFloat(
      await steps
        .locator("li")
        .nth(1)
        .evaluate((e) => getComputedStyle(e).fontSize),
    ),
  ).toBeGreaterThanOrEqual(14);
});

function seedOne(fake: FakeMerchApi) {
  const p = makeSingle();
  fake.products = [p];
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
}
const hostBarHeight = (page: Page) =>
  page.evaluate(() =>
    document.documentElement.style.getPropertyValue("--merch-host-bar-height"),
  );

test("the action is a sticky right panel at 1024 and a fixed bar at 390", async ({
  page,
  fake,
}) => {
  seedOne(fake);
  await login(page);
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/th/souvenirs/cart");
  const bar = page.locator(".merch-checkout-bar");
  await expect(bar).toHaveCSS("position", "sticky");
  const main = (await page.locator(".merch-flow-main").boundingBox())!,
    panel = (await bar.boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(main.x + main.width);
  expect(panel.width).toBeCloseTo(320, 0);
  expect(await hostBarHeight(page)).toBe("");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(bar).toHaveCSS("position", "fixed");
});

test("bar height variable follows the layout on resize", async ({
  page,
  fake,
}) => {
  seedOne(fake);
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/th/souvenirs/cart");
  await expect.poll(() => hostBarHeight(page)).not.toBe("");
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect.poll(() => hostBarHeight(page)).toBe("");
});

test("no horizontal scroll beside the panel at 768", async ({
  page,
  fake,
  context,
}) => {
  await stubImages(context);
  const options = makeOptionsProduct({ images: [image(1)] });
  const single = makeSingle({ id: uid(2), nameTh: "สินค้า 2" });
  fake.products = [options, single];
  for (const p of [options, single])
    fake.seedLine({
      productId: p.id,
      variantId: p.variants[0].id,
      bundleSelections: [],
      quantity: 1,
    });
  await page.setViewportSize({ width: 768, height: 1024 });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-row")).toHaveCount(2);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    768,
  );
  const panel = (await page.locator(".merch-checkout-bar").boundingBox())!;
  expect(Math.abs(panel.width - 280)).toBeLessThanOrEqual(1);
  const proceed = page.locator(".merch-checkout-bar > button");
  expect(await proceed.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await proceed.click();
  await expect(page).toHaveURL(/\/th\/souvenirs\/checkout$/);
  await expect(
    page.getByRole("heading", { name: "ข้อมูลผู้รับ", exact: true }),
  ).toBeVisible();
  await fillAddress(page);
  await toReviewButton(page).click();
  await expect(
    page.getByRole("heading", { name: "ตรวจสอบคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
  await expect(confirmButton(page)).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    768,
  );
});

test("rows sit in one white card with an image column even without images", async ({
  page,
  fake,
}) => {
  const ps = [1, 2].map((i) => makeSingle({ id: uid(i), nameTh: `สินค้า ${i}` }));
  fake.products = ps;
  for (const p of ps)
    fake.seedLine({
      productId: p.id,
      variantId: p.variants[0].id,
      bundleSelections: [],
      quantity: 1,
    });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-row")).toHaveCount(2);
  await expect(page.locator(".merch-cart-list")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  for (let i = 0; i < 2; i++) {
    const box = (await page
      .locator(".merch-cart-row")
      .nth(i)
      .locator(".merch-image-placeholder")
      .boundingBox())!;
    const wide = (page.viewportSize()?.width ?? 0) >= 480;
    expect(Math.abs(box.width - (wide ? 80 : 64))).toBeLessThanOrEqual(1);
  }
});

test("change-options is a button that toggles the selector", async ({
  page,
  fake,
}) => {
  const p = makeOptionsProduct();
  fake.products = [p];
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  const edit = page.getByRole("button", { name: "แก้ไขตัวเลือก", exact: true });
  await expect(edit).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("button", { name: "บันทึกตัวเลือก", exact: true }),
  ).toHaveCount(0);
  await edit.click();
  await expect(edit).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("button", { name: "L", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "บันทึกตัวเลือก", exact: true }),
  ).toBeVisible();
});

test("option, stepper and trash share one line at 430px, and rows indent under the image at 1024px", async ({
  page,
  fake,
}) => {
  const p = makeOptionsProduct({ nameTh: "เสื้อยืด Pris" });
  fake.products = [p];
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  await page.setViewportSize({ width: 430, height: 900 });
  await login(page);
  await page.goto("/th/souvenirs/cart");
  const option = (await page.locator(".merch-cart-row-option").boundingBox())!;
  const stepper = (await page.locator(".merch-cart-stepper").boundingBox())!;
  expect(
    Math.abs(option.y + option.height / 2 - (stepper.y + stepper.height / 2)),
  ).toBeLessThan(12);
  await page.setViewportSize({ width: 1024, height: 900 });
  const cell = (await page.locator(".merch-image-placeholder").boundingBox())!;
  const text = (await page.locator(".merch-cart-row-option").boundingBox())!;
  expect(text.x).toBeGreaterThanOrEqual(cell.x + cell.width);
});
