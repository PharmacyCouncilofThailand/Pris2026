import { test, expect, login } from "./fixtures";
import { makeOptionsProduct, makeSingle, uid } from "./data";

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
    expect(action!.y + action!.height).toBeLessThanOrEqual(bar!.y);
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
