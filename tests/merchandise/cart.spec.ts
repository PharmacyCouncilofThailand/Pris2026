import type { Page } from "@playwright/test";
import { test, expect, login } from "./fixtures";
import { makeOptionsProduct, makeSingle, makeStore, uid } from "./data";
import type { FakeMerchApi } from "./fakeApi";

const proceed = (page: Page) =>
  page.getByRole("button", { name: /^ดำเนินการสั่งซื้อ/ });
const seed = (
  fake: FakeMerchApi,
  p = makeSingle(),
  quantity = 1,
  variantId?: string | null,
) =>
  fake.seedLine({
    productId: p.id,
    variantId:
      variantId === undefined
        ? p.hasOptions
          ? null
          : p.variants[0].id
        : variantId,
    bundleSelections: [],
    quantity,
  });
const calls = (fake: FakeMerchApi, method: string) =>
  fake.calls.filter(
    (c) => c.method === method && /\/cart\/items\//.test(c.path),
  );

test("cart requires login and returns to itself afterwards", async ({
  page,
}) => {
  await page.goto("/th/souvenirs/cart");
  await expect(page).toHaveURL(/\/th\/login\?redirect=/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBe(
    "/souvenirs/cart",
  );
});

test("an empty cart explains itself and cannot proceed", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle()];
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีสินค้าในตะกร้า", exact: true }),
  ).toBeVisible();
  await expect(proceed(page)).toBeDisabled();
});

test("editing quantity shows exactly the amounts the server returned, then removal updates them", async ({
  page,
  fake,
}) => {
  const a = makeSingle({ id: uid(1), nameTh: "แก้วน้ำ Pris" });
  const b = makeSingle({
    id: uid(2),
    nameTh: "ถุงผ้า Pris",
    variants: [{ ...makeSingle().variants[0], id: uid(22), priceBaht: 100 }],
    price: { kind: "exact", amountBaht: 100 },
  });
  fake.products = [a, b];
  seed(fake, a);
  const second = seed(fake, b);
  await login(page);
  await page.goto("/th/souvenirs/cart");
  const summary = page.getByRole("complementary", { name: "สรุปคำสั่งซื้อ" });
  await expect(summary).toContainText("฿400.00"); // 250 + 100 + 50 shipping
  await page
    .getByRole("button", { name: "เพิ่มจำนวน แก้วน้ำ Pris", exact: true })
    .click();
  await expect(
    page.getByLabel("จำนวน แก้วน้ำ Pris", { exact: true }),
  ).toHaveValue("2");
  const amounts = fake.cart.amounts!;
  expect(amounts.totalBaht).toBe(2 * 250 + 100 + 50);
  await expect(page.locator(".merch-cart-total")).toContainText("฿650.00");
  await expect(summary).toContainText("฿600.00"); // subtotal
  await expect(summary).toContainText("฿50.00"); // shipping, once
  expect(calls(fake, "PATCH")).toHaveLength(1);
  expect(calls(fake, "PATCH")[0].body).toEqual({ quantity: 2 });
  await page.reload();
  await expect(
    page.getByLabel("จำนวน แก้วน้ำ Pris", { exact: true }),
  ).toHaveValue("2");
  await page
    .getByRole("button", { name: "ลบ ถุงผ้า Pris", exact: true })
    .click();
  await expect(page.locator(".merch-cart-row")).toHaveCount(1);
  await expect(page.locator(".merch-cart-total")).toContainText("฿550.00");
  expect(calls(fake, "DELETE")[0].path).toMatch(new RegExp(second.id + "$"));
});

test("typing a quantity and saving sends a PATCH with that quantity", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  seed(fake, p);
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await page.getByLabel(`จำนวน ${p.nameTh}`, { exact: true }).fill("4");
  await page.getByRole("button", { name: "บันทึกจำนวน", exact: true }).click();
  await expect(page.locator(".merch-cart-total")).toContainText("฿1,050.00");
  expect(calls(fake, "PATCH")[0].body).toEqual({ quantity: 4 });
});

test("changing the option of a line patches variantId and shows the new option", async ({
  page,
  fake,
}) => {
  const p = makeOptionsProduct();
  fake.products = [p];
  seed(fake, p, 1, p.variants[0].id);
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.getByText("ไซซ์ M / สีขาว", { exact: true })).toBeVisible();
  await page.locator(".merch-cart-edit summary").click();
  await page
    .locator(".merch-cart-edit")
    .getByRole("button", { name: "L", exact: true })
    .click();
  await page
    .getByRole("button", { name: "บันทึกตัวเลือก", exact: true })
    .click();
  await expect(page.getByText("ไซซ์ L / สีขาว", { exact: true })).toBeVisible();
  expect(calls(fake, "PATCH")[0].body).toEqual({ variantId: p.variants[1].id });
});

test("a line with valid:false explains itself and blocks proceeding", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  const line = seed(fake, p);
  line.valid = false;
  line.issueCodes = ["VARIANT_DISABLED"];
  fake.cart.amounts = null;
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(
    page.getByText("ตัวเลือกนี้ปิดการขาย", { exact: true }),
  ).toBeVisible();
  await expect(proceed(page)).toBeDisabled();
  await expect(page.getByText(/ยังสรุปยอดไม่ได้/).first()).toBeVisible();
});

test("a line whose product is gone says so and can still be removed", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  const line = seed(fake, p);
  fake.orphanLine(line.id);
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(
    page.getByText("สินค้านี้ไม่มีแล้ว", { exact: true }),
  ).toBeVisible();
  await expect(proceed(page)).toBeDisabled();
  const remove = page.getByRole("button", { name: /^ลบ / });
  await expect(remove).toBeEnabled();
  await remove.click();
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีสินค้าในตะกร้า", exact: true }),
  ).toBeVisible();
  expect(calls(fake, "DELETE")).toHaveLength(1);
});

test("a valid cart on an open store proceeds to checkout", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle()];
  seed(fake);
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(proceed(page)).toBeEnabled();
  await proceed(page).click();
  await expect(page).toHaveURL(/\/th\/souvenirs\/checkout$/);
  await expect(
    page.getByRole("heading", { name: "ข้อมูลผู้รับ", exact: true }),
  ).toBeVisible();
});

test("a closed store disables checkout but keeps the cart readable", async ({
  page,
  fake,
}) => {
  fake.store = makeStore({ state: "closed" });
  fake.products = [makeSingle()];
  seed(fake);
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-row")).toHaveCount(1);
  await expect(page.getByText(/ปิดรับพรีออเดอร์แล้ว/).first()).toBeVisible();
  await expect(proceed(page)).toBeDisabled();
});

test("an expired session during an edit offers re-login instead of silently failing", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  seed(fake, p);
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-row")).toHaveCount(1);
  fake.failNext("PATCH", "/cart/items/", {
    status: 401,
    body: {
      success: false,
      code: "UNAUTHORIZED",
      error: "กรุณาเข้าสู่ระบบอีกครั้ง",
      requestId: "r",
    },
  });
  await page
    .getByRole("button", { name: `เพิ่มจำนวน ${p.nameTh}`, exact: true })
    .click();
  const relogin = page.getByRole("link", {
    name: "เข้าสู่ระบบอีกครั้ง",
    exact: true,
  });
  await expect(relogin).toHaveAttribute("href", /reauth=merchandise/);
  await expect(proceed(page)).toBeDisabled();
});

test("a rejected edit shows the API message and reloads the cart", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  seed(fake, p);
  await login(page);
  await page.goto("/th/souvenirs/cart");
  fake.failNext("PATCH", "/cart/items/", {
    status: 422,
    body: {
      success: false,
      code: "MERCH_CART_QUANTITY_LIMIT",
      error: "จำนวนเกินที่กำหนด",
      requestId: "r",
    },
  });
  await page
    .getByRole("button", { name: `เพิ่มจำนวน ${p.nameTh}`, exact: true })
    .click();
  await expect(
    page.getByText("จำนวนเกินที่กำหนด", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel(`จำนวน ${p.nameTh}`, { exact: true }),
  ).toHaveValue("1");
});
