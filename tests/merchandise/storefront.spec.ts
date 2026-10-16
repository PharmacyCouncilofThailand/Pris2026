import type { Page } from "@playwright/test";
import { test, expect, login } from "./fixtures";
import {
  image,
  makeBundle,
  makeOptionsProduct,
  makeSingle,
  makeStore,
  stubImages,
  uid,
} from "./data";

const addButtons = (page: Page) =>
  page.getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true });
const productReads = (fake: { calls: { method: string; path: string }[] }) =>
  fake.calls.filter((c) => c.method === "GET" && c.path.endsWith("/products"))
    .length;

test("open store lists products with exact and from prices", async ({
  page,
  fake,
}) => {
  fake.products = [
    makeSingle({ nameTh: "แก้วน้ำ Pris" }),
    makeOptionsProduct({ nameTh: "เสื้อยืด Pris" }),
  ];
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(2);
  await expect(page.locator(".merch-price").nth(0)).toHaveText("฿250.00");
  await expect(page.locator(".merch-price").nth(1)).toHaveText(
    "เริ่มต้น ฿300.00",
  );
  await expect(addButtons(page)).toHaveCount(2);
  await expect(addButtons(page).first()).toBeEnabled();
});

const states = [
  ["not_open", "ยังไม่เปิดรับพรีออเดอร์"],
  ["closed", "ปิดรับพรีออเดอร์แล้ว"],
  ["disabled", "ร้านยังไม่เปิดให้บริการ"],
] as const;
for (const [state, text] of states)
  test(`store ${state} shows its status, keeps the catalog and offers no add button`, async ({
    page,
    fake,
  }) => {
    fake.store = makeStore({ state });
    fake.products = [
      makeSingle({ purchasable: false, unavailableCodes: ["STORE_NOT_OPEN"] }),
    ];
    await page.goto("/th/souvenirs");
    await expect(page.locator(".merch-product")).toHaveCount(1);
    await expect(
      page.getByRole("region", { name: "ข้อมูลการสั่งซื้อ" }),
    ).toContainText(text);
    await expect(addButtons(page)).toHaveCount(0);
  });

test("not_open store shows the opening time when the API gives one", async ({
  page,
  fake,
}) => {
  fake.store = makeStore({
    state: "not_open",
    opensAt: "2026-11-01T03:00:00.000Z",
  });
  fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  await expect(
    page.getByRole("region", { name: "ข้อมูลการสั่งซื้อ" }),
  ).toContainText("เปิดรับ 1 พ.ย. 2026 10:00");
});

test("typing a search keeps q in the URL and filters locally without another products request", async ({
  page,
  fake,
}) => {
  fake.products = [
    makeSingle({ id: uid(1), nameTh: "แก้วน้ำ Pris" }),
    makeSingle({ id: uid(2), nameTh: "ถุงผ้า Pris" }),
  ];
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(2);
  const before = productReads(fake);
  await page.getByRole("searchbox", { name: "ค้นหาสินค้า" }).fill("ถุง");
  await expect(page).toHaveURL(/[?&]q=/);
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "ถุงผ้า Pris" }),
  ).toBeVisible();
  await page.getByRole("searchbox", { name: "ค้นหาสินค้า" }).fill("ไม่พบคำนี้");
  await expect(
    page.getByText("ไม่พบสินค้าตามคำค้นหาหรือหมวดที่เลือก", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true })
    .click();
  await expect(page.locator(".merch-product")).toHaveCount(2);
  expect(productReads(fake)).toBe(before);
});

test("category and bundle filters live in the URL and survive reload", async ({
  page,
  fake,
}) => {
  const cat = uid(900);
  fake.store = makeStore({
    categories: [{ id: cat, nameTh: "เครื่องแต่งกาย", sortOrder: 1 }],
  });
  fake.products = [
    makeSingle({ id: uid(1), nameTh: "แก้วน้ำ Pris" }),
    makeOptionsProduct({
      id: uid(2),
      nameTh: "เสื้อยืด Pris",
      categoryId: cat,
    }),
    makeBundle({ id: uid(3) }),
  ];
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(3);
  await page
    .getByRole("button", { name: "เครื่องแต่งกาย", exact: true })
    .click();
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await expect(page).toHaveURL(new RegExp(`categoryId=${cat}`));
  const pressed = page.locator('.merch-categories [aria-pressed="true"]');
  await expect(pressed).toHaveCount(1);
  await page.getByRole("button", { name: "ทั้งหมด", exact: true }).click();
  await expect(page.locator(".merch-product")).toHaveCount(3);
  await expect(pressed).toHaveCount(1);
  await page
    .getByRole("button", { name: "เครื่องแต่งกาย", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`categoryId=${cat}`));
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await expect(pressed).toHaveCount(1);
  await page.getByRole("button", { name: "ชุดสินค้า", exact: true }).click();
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await expect(page).toHaveURL(/kind=bundle/);
  await expect(page).not.toHaveURL(/categoryId=/);
  await expect(pressed).toHaveCount(1);
  await page.reload();
  await expect(page).toHaveURL(/kind=bundle/);
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await expect(pressed).toHaveCount(1);
});

test("legacy URL with category and bundle keeps bundle only", async ({
  page,
  fake,
}) => {
  const cat = uid(900);
  fake.store = makeStore({
    categories: [{ id: cat, nameTh: "เครื่องแต่งกาย", sortOrder: 1 }],
  });
  fake.products = [
    makeSingle({ id: uid(1), categoryId: cat }),
    makeBundle({ id: uid(3) }),
  ];
  await page.goto(`/th/souvenirs?categoryId=${cat}&kind=bundle`);
  await expect(page).not.toHaveURL(/categoryId=/);
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await expect(
    page.locator('.merch-categories [aria-pressed="true"]'),
  ).toHaveText("ชุดสินค้า");
});

test("storefront has no bottom bar; my orders link shows only when logged in", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-bottom-bar")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "คำสั่งซื้อของฉัน" }),
  ).toHaveCount(0);
  await expect(page.locator(".merch-shop-toolbar")).toHaveCount(0);
});

test("my orders link sits in the catalog heading row when logged in", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle()];
  await login(page);
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-shop-toolbar")).toHaveCount(0);
  const link = page.getByRole("link", { name: "คำสั่งซื้อของฉัน" });
  const heading = page.getByRole("heading", { name: "สินค้าทั้งหมด" });
  const l = (await link.boundingBox())!,
    h = (await heading.boundingBox())!;
  expect(
    Math.abs(l.y + l.height / 2 - (h.y + h.height / 2)),
  ).toBeLessThanOrEqual(8);
  expect(l.x).toBeGreaterThan(h.x + h.width);
});

test("loads limit=100, follows pagination.totalPages, then pages client-side by 12", async ({
  page,
  fake,
}) => {
  fake.products = Array.from({ length: 101 }, (_, i) =>
    makeSingle({ id: uid(i + 1), nameTh: `สินค้า ${i + 1}`, sortOrder: i }),
  );
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  await expect(page.getByText("หน้า 1 / 9", { exact: true })).toBeVisible();
  const reads = fake.calls.filter(
    (c) => c.method === "GET" && c.path.endsWith("/products"),
  );
  expect(reads).toHaveLength(2);
  const before = productReads(fake);
  await page.getByRole("button", { name: "ถัดไป", exact: true }).click();
  await expect(page.getByText("หน้า 2 / 9", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/[?&]page=2/);
  expect(productReads(fake)).toBe(before);
});

test("banner with linkUrl is a link and one without is not", async ({
  page,
  fake,
  context,
}) => {
  await stubImages(context);
  fake.store = makeStore({
    banners: [
      {
        id: uid(501),
        image: image(601),
        linkUrl: "https://example.test/promo",
      },
      { id: uid(502), image: image(602), linkUrl: null },
    ],
  });
  fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-banner-art a")).toHaveAttribute(
    "href",
    "https://example.test/promo",
  );
  await page
    .getByRole("button", { name: "แบนเนอร์ถัดไป", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "ดูแบนเนอร์ 2", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await expect(page.locator(".merch-banner-art a")).toHaveCount(0);
});

test("production and shipping info show when present", async ({
  page,
  fake,
}) => {
  fake.store = makeStore({
    productionInfoTh: "ผลิต 14 วัน",
    shippingInfoTh: "ส่งทั่วไทย",
  });
  fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  await expect(page.getByText("ผลิต 14 วัน", { exact: true })).toBeVisible();
  await expect(page.getByText("ส่งทั่วไทย", { exact: true })).toBeVisible();
});

test("catalog failure offers retry and never claims an empty catalog", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle()];
  fake.failNext("GET", "/products", { status: 503 });
  await page.goto("/th/souvenirs");
  await expect(
    page.locator(".merchandise-host-message").getByRole("alert"),
  ).toHaveText("โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง");
  await expect(
    page.getByText("ยังไม่มีสินค้าที่เปิดแสดง", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "ลองโหลดอีกครั้ง", exact: true })
    .click();
  await expect(page.locator(".merch-product")).toHaveCount(1);
});

test("header cart badge caps at 99+ and keeps the full accessible count", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 100,
  });
  await login(page);
  await page.goto("/th/souvenirs");
  await expect(
    page.locator("header .merch-header-cart:visible .merch-cart-badge"),
  ).toHaveText("99+");
  await expect(
    page.locator("header .merch-header-cart:visible"),
  ).toHaveAccessibleName("ตะกร้า 100 รายการ");
  expect(
    fake.calls.filter((c) => c.method === "GET" && c.path.endsWith("/cart")),
  ).toHaveLength(1);
});

test("logged-in quick add of a no-option product posts the cart item once", async ({
  page,
  fake,
}) => {
  const p = makeSingle();
  fake.products = [p];
  await login(page);
  await page.goto("/th/souvenirs");
  await addButtons(page).click();
  await expect(
    page.locator("header .merch-header-cart:visible .merch-cart-badge"),
  ).toHaveText("1");
  const posts = fake.calls.filter(
    (c) => c.method === "POST" && c.path.endsWith("/cart/items"),
  );
  expect(posts).toHaveLength(1);
  expect(posts[0].body).toEqual({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  await expect(page).not.toHaveURL(/intentId=/);
});

test("quick add of a product with options sends the buyer to choose them", async ({
  page,
  fake,
}) => {
  const p = makeOptionsProduct();
  fake.products = [p];
  await login(page);
  await page.goto("/th/souvenirs");
  await addButtons(page).click();
  await expect(page).toHaveURL(new RegExp(`/souvenirs/products/${p.id}$`));
  expect(fake.calls.filter((c) => c.method === "POST")).toHaveLength(0);
});

test("anonymous quick add goes to login with the intent, then adds exactly once on return", async ({
  page,
  fake,
}) => {
  const p = makeSingle({ nameTh: "แก้วน้ำ Pris" });
  fake.products = [p];
  await page.goto("/th/souvenirs?q=" + encodeURIComponent("แก้ว"));
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await addButtons(page).click();
  await expect(page).toHaveURL(/\/th\/login\?redirect=/);
  const redirect = new URL(page.url()).searchParams.get("redirect")!;
  expect(redirect).toMatch(/^\/souvenirs\?/);
  expect(redirect).toContain("intentId=");
  expect(redirect).toContain("q=");
  expect(fake.calls.filter((c) => c.method === "POST")).toHaveLength(0);
  await login(page);
  await page.goto("/th" + redirect);
  await expect(
    page.locator("header .merch-header-cart:visible .merch-cart-badge"),
  ).toHaveText("1");
  await expect(
    page.getByText("เพิ่มลงตะกร้าแล้ว", { exact: true }),
  ).toBeVisible();
  await expect(page).not.toHaveURL(/intentId=/);
  await expect(page).toHaveURL(/q=/);
  await page.reload();
  expect(
    fake.calls.filter(
      (c) => c.method === "POST" && c.path.endsWith("/cart/items"),
    ),
  ).toHaveLength(1);
});

test("store info banner shows the close date and the shipping fee from the store", async ({
  page,
  fake,
}) => {
  fake.store = makeStore({
    shippingBaht: 0,
    shippingInfoTh: "รับที่หน้างาน",
  });
  fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  const info = page.getByRole("region", { name: "ข้อมูลการสั่งซื้อ" });
  await expect(info).toContainText("พรีออเดอร์ของที่ระลึก PRIS 2026");
  await expect(info).toContainText("ปิดรับ 30 ต.ค. 2026");
  await expect(info).toContainText("จัดส่งฟรี");
  await expect(info).toContainText("รับที่หน้างาน");
  await expect(page.getByText(/จัดส่งทั่วไทย/)).toHaveCount(0);
  fake.store = makeStore({ shippingBaht: 50 });
  await page.reload();
  await expect(info).toContainText("ค่าจัดส่ง ฿50.00 ต่อออเดอร์");
});

test("open store without a close date shows no date line", async ({
  page,
  fake,
}) => {
  fake.store = makeStore({ closesAt: null });
  fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  const info = page.getByRole("region", { name: "ข้อมูลการสั่งซื้อ" });
  await expect(info).toBeVisible();
  await expect(info).not.toContainText("ปิดรับ");
  await expect(info).not.toContainText("Invalid");
});

test("cards are vertical at 1440 with a 44px add button", async ({
  page,
  fake,
}) => {
  fake.products = [makeSingle({ nameTh: "แก้วน้ำ Pris" })];
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/th/souvenirs");
  const media = (await page.locator(".merch-product-media").boundingBox())!;
  const name = (await page
    .getByRole("heading", { name: "แก้วน้ำ Pris" })
    .boundingBox())!;
  expect(name.y).toBeGreaterThan(media.y + media.height - 1);
  expect(Math.abs(media.width - media.height)).toBeLessThanOrEqual(1);
  const box = (await addButtons(page).boundingBox())!;
  expect(box.width).toBeCloseTo(44, 0);
  expect(box.height).toBeCloseTo(44, 0);
  await expect(page.locator(".merch-preorder")).toHaveCount(0);
});

test("broken product image falls back to the placeholder", async ({
  page,
  fake,
  context,
}) => {
  await context.route("https://img.example.test/**", (r) =>
    r.fulfill({ status: 404 }),
  );
  fake.products = [makeSingle({ images: [image(1)] })];
  await page.goto("/th/souvenirs");
  await expect(
    page.locator(".merch-product-media .merch-image-placeholder"),
  ).toBeVisible();
  const m = (await page.locator(".merch-product-media").boundingBox())!;
  expect(Math.abs(m.width - m.height)).toBeLessThanOrEqual(1);
});

test("search and pills share a row at 1280", async ({ page, fake }) => {
  fake.store = makeStore({
    categories: [{ id: uid(900), nameTh: "เครื่องแต่งกาย", sortOrder: 1 }],
  });
  fake.products = [makeSingle()];
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/th/souvenirs");
  const pill = page.getByRole("button", { name: "ทั้งหมด", exact: true });
  await expect(pill).toBeVisible();
  const s = (await page.locator(".merch-search").boundingBox())!,
    p = (await pill.boundingBox())!;
  expect(
    Math.abs(s.y + s.height / 2 - (p.y + p.height / 2)),
  ).toBeLessThanOrEqual(12);
  expect(s.width).toBeLessThanOrEqual(421);
  await page.setViewportSize({ width: 390, height: 800 });
  const s2 = (await page.locator(".merch-search").boundingBox())!,
    p2 = (await pill.boundingBox())!;
  expect(p2.y).toBeGreaterThanOrEqual(s2.y + s2.height - 1);
});

test("a product that can't be bought shows a tag and no add button", async ({
  page,
  fake,
}) => {
  fake.products = [
    makeSingle({ purchasable: false, unavailableCodes: ["OUT_OF_STOCK"] }),
  ];
  await page.goto("/th/souvenirs");
  const card = page.locator(".merch-product");
  await expect(card).toHaveCount(1);
  await expect(card).toContainText("ยังไม่พร้อมขาย");
  await expect(card.getByRole("button", { name: "เพิ่มลงตะกร้า" })).toHaveCount(
    0,
  );
});
