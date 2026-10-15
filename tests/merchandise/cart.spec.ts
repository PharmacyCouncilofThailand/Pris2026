import { test, expect } from "./live-fixture";
import type { ProductDto, CartDto } from "../../src/types/merchandise";
type Catalog = { products: ProductDto[]; bundle: ProductDto };
type Options = {
  product: ProductDto;
  bundle: ProductDto;
  noOptions: ProductDto;
};
async function add(
  merchandise: {
    command<T = unknown>(action: string, payload?: unknown): Promise<T>;
  },
  product: ProductDto,
  quantity = 1,
  variantId: string | null = product.kind === "single"
    ? product.variants[0].id
    : null,
) {
  return merchandise.command<CartDto>("addCart", {
    productId: product.id,
    variantId,
    bundleSelections:
      product.kind === "bundle"
        ? product.components
            .filter((c) => c.optionMode === "selectable")
            .map((c) => ({
              componentId: c.id,
              variantId: c.allowedVariants[0].id,
            }))
        : [],
    quantity,
  });
}
const checkout = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: /^ดำเนินการต่อ/ });
test("cart requires the existing account and returns to its empty state after login", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 0 });
  await merchandise.mockLogin(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page).toHaveURL(/\/login\?redirect=/, { timeout: 20000 });
  await expect(
    page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
  ).toBeVisible();
  expect(
    (await merchandise.command<{ cartReads: number }>("inspect")).cartReads,
  ).toBe(0);
  await page.getByLabel("อีเมล", { exact: true }).fill("buyer@example.test");
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill("synthetic-test");
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีสินค้าในตะกร้า", exact: true }),
  ).toBeVisible();
  await expect(checkout(page)).toBeDisabled();
});
test("real quantity edits, persistence and removal use server totals with shipping once", async ({
  page,
  merchandise,
}) => {
  const { products } = await merchandise.command<Catalog>("catalog", {
    banners: 0,
  });
  await add(merchandise, products[2]);
  await add(merchandise, products[4]);
  await merchandise.login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(
    page.getByRole("complementary", { name: "สรุปคำสั่งซื้อ" }),
  ).toContainText("฿250.00");
  await page
    .getByRole("button", {
      name: `เพิ่มจำนวน ${products[2].nameTh}`,
      exact: true,
    })
    .click();
  await expect(
    page.getByLabel(`จำนวน ${products[2].nameTh}`, { exact: true }),
  ).toHaveValue("2");
  await expect(page.locator(".merch-cart-total")).toContainText("฿350.00");
  await expect(page.locator(".merch-cart-badge")).toHaveText("3");
  await page.reload();
  await expect(
    page.getByLabel(`จำนวน ${products[2].nameTh}`, { exact: true }),
  ).toHaveValue("2");
  await page
    .getByRole("button", { name: `ลบ ${products[4].nameTh}`, exact: true })
    .click();
  await expect(page.locator(".merch-cart-row")).toHaveCount(1);
  await expect(page.locator(".merch-cart-total")).toContainText("฿250.00");
  await page
    .getByLabel(`จำนวน ${products[2].nameTh}`, { exact: true })
    .fill("4");
  await page.getByRole("button", { name: "บันทึกจำนวน", exact: true }).click();
  await expect(page.locator(".merch-cart-total")).toContainText("฿450.00");
  const { cart } = await merchandise.command<{ cart: CartDto }>("inspect");
  expect(cart.amounts?.shippingMinor).toBe("5000");
  expect(cart.items[0].quantity).toBe(4);
});
test("changing a variant merges identical server identities and keeps a single shipping charge", async ({
  page,
  merchandise,
}) => {
  const { product } = await merchandise.command<Options>("variantCatalog");
  const medium = product.variants.find(
      (v) => v.colorTh === "น้ำเงิน" && v.sizeTh === "M",
    )!,
    large = product.variants.find(
      (v) => v.colorTh === "น้ำเงิน" && v.sizeTh === "L",
    )!;
  await add(merchandise, product, 1, medium.id);
  await add(merchandise, product, 2, large.id);
  await merchandise.login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-row")).toHaveCount(2);
  const row = page
    .locator(".merch-cart-row")
    .filter({ has: page.getByText("น้ำเงิน · M", { exact: true }) });
  await row.locator("summary").click();
  await row.getByRole("button", { name: "L", exact: true }).click();
  await row
    .getByRole("button", { name: "บันทึกตัวเลือก", exact: true })
    .click();
  await expect(page.locator(".merch-cart-row")).toHaveCount(1);
  await expect(
    page.getByLabel(`จำนวน ${product.nameTh}`, { exact: true }),
  ).toHaveValue("3");
  await expect(page.locator(".merch-cart-total")).toContainText("฿500.00");
  expect(
    (await merchandise.command<{ cart: CartDto }>("inspect")).cart.items[0]
      .variantId,
  ).toBe(large.id);
});
test("Bundle cart displays the BOM without charging or counting its components as extra lines", async ({
  page,
  merchandise,
}) => {
  const { bundle } = await merchandise.command<Options>("variantCatalog");
  await add(merchandise, bundle, 2);
  await merchandise.login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-row")).toHaveCount(1);
  await expect(page.locator(".merch-cart-components")).toContainText(
    "แก้ว Mug × 2",
  );
  await expect(page.locator(".merch-cart-badge")).toHaveText("2");
  await expect(page.locator(".merch-cart-total")).toContainText("฿490.00");
});
test("real revision conflict reloads the newer cart and requires another deliberate edit", async ({
  page,
  merchandise,
}) => {
  const { products } = await merchandise.command<Catalog>("catalog", {
    banners: 0,
  });
  await add(merchandise, products[2]);
  await merchandise.login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(
    page.getByLabel(`จำนวน ${products[2].nameTh}`, { exact: true }),
  ).toHaveValue("1");
  await add(merchandise, products[2]);
  await page
    .getByRole("button", {
      name: `เพิ่มจำนวน ${products[2].nameTh}`,
      exact: true,
    })
    .click();
  await expect(
    page.getByText(
      "ข้อมูลตะกร้ามีการเปลี่ยนแปลง โหลดข้อมูลล่าสุดแล้ว กรุณาตรวจสอบอีกครั้ง",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByLabel(`จำนวน ${products[2].nameTh}`, { exact: true }),
  ).toHaveValue("2");
  await page
    .getByRole("button", {
      name: `เพิ่มจำนวน ${products[2].nameTh}`,
      exact: true,
    })
    .click();
  await expect(
    page.getByLabel(`จำนวน ${products[2].nameTh}`, { exact: true }),
  ).toHaveValue("3");
});
test("lost quantity reply plus a failed verification blocks writes until the real cart is read", async ({
  page,
  merchandise,
}) => {
  const { products } = await merchandise.command<Catalog>("catalog", {
    banners: 0,
  });
  await add(merchandise, products[2]);
  await merchandise.login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(
    page.getByLabel(`จำนวน ${products[2].nameTh}`, { exact: true }),
  ).toHaveValue("1");
  const cartUrl =
    merchandise.origin + "/api/v1/merchandise/events/PRIS-2026/cart";
  let posts = 0;
  await page.route(cartUrl + "/items/*", async (route) => {
    if (route.request().method() !== "PATCH") return route.continue();
    posts++;
    await route.fetch();
    await route.abort("failed");
  });
  await page.route(cartUrl, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        success: false,
        code: "MERCH_LOAD_FAILED",
        error: "Synthetic failure",
        requestId: "test",
      }),
    }),
  );
  await page
    .getByRole("button", {
      name: `เพิ่มจำนวน ${products[2].nameTh}`,
      exact: true,
    })
    .click();
  await expect(
    page.getByText(
      "ยังตรวจสอบตะกร้าล่าสุดไม่ได้ กรุณาลองโหลดอีกครั้งก่อนแก้ไขหรือดำเนินการต่อ",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(checkout(page)).toBeDisabled();
  await expect(
    page.getByLabel(`จำนวน ${products[2].nameTh}`, { exact: true }),
  ).toHaveValue("1");
  await page.unroute(cartUrl);
  await page
    .getByRole("button", { name: "ลองโหลดอีกครั้ง", exact: true })
    .click();
  await expect(
    page.getByLabel(`จำนวน ${products[2].nameTh}`, { exact: true }),
  ).toHaveValue("2");
  await expect(checkout(page)).toBeEnabled();
  expect(posts).toBe(1);
});
test("paused items remain visible and removable without substituting zero totals", async ({
  page,
  merchandise,
}) => {
  const { products } = await merchandise.command<Catalog>("catalog", {
    banners: 0,
  });
  await add(merchandise, products[2]);
  await merchandise.command("sale", { id: products[2].id, enabled: false });
  await merchandise.login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-row")).toHaveCount(1);
  await expect(
    page.getByText(
      "มีรายการที่ไม่พร้อมขาย ระบบจะไม่เปลี่ยนตัวเลือกให้อัตโนมัติ กรุณาตรวจสอบรายการด้านล่าง",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator(".merch-cart-summary")).toContainText(
    "ยังสรุปยอดไม่ได้",
  );
  await expect(checkout(page)).toBeDisabled();
  await page
    .getByRole("button", { name: `ลบ ${products[2].nameTh}`, exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีสินค้าในตะกร้า", exact: true }),
  ).toBeVisible();
});
test("focus refresh shows the actual changed price, and fresh checkout checks reject a closed store", async ({
  page,
  merchandise,
}) => {
  const { products } = await merchandise.command<Catalog>("catalog", {
    banners: 0,
  });
  await add(merchandise, products[2]);
  await merchandise.login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-total")).toContainText("฿150.00");
  await merchandise.command("price", { id: products[2].id, price: "12000" });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByText("ราคาปรับจาก ฿100.00 เป็น ฿120.00 กรุณาตรวจสอบอีกครั้ง", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".merch-cart-total")).toContainText("฿170.00");
  await merchandise.command("closeStore");
  await checkout(page).click();
  await expect(
    page.getByText(
      "ปิดรับพรีออเดอร์แล้ว · ยังดูตะกร้าและประวัติคำสั่งซื้อได้",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(checkout(page)).toBeDisabled();
  await expect(page).toHaveURL(/\/souvenirs\/cart$/);
});
test("a different account cannot see the previous buyer cart after reload", async ({
  page,
  merchandise,
}) => {
  const { products } = await merchandise.command<Catalog>("catalog", {
    banners: 0,
  });
  await add(merchandise, products[2]);
  await merchandise.login(page);
  await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-row")).toHaveCount(1);
  await page.evaluate(
    ({ token }) => {
      localStorage.setItem("pris_token", token);
      localStorage.setItem(
        "pris_user",
        JSON.stringify({
          id: 2,
          firstName: "ผู้ซื้ออื่น",
          lastName: "ทดสอบ",
          email: "other@example.test",
        }),
      );
    },
    { token: merchandise.otherBuyerToken },
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีสินค้าในตะกร้า", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".merch-cart-row")).toHaveCount(0);
  await expect(page.locator(".merch-cart-badge")).toHaveText("0");
});
