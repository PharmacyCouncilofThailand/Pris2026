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
    await expect(page.locator(".merchandise-store-status")).toContainText(text);
    await expect(addButtons(page)).toHaveCount(0);
    await expect(page.locator(".merch-primary")).toBeDisabled();
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
  await expect(page.locator(".merchandise-store-opens")).toContainText(
    "1 พ.ย. 2026 10:00",
  );
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
  await page.getByRole("button", { name: "ทั้งหมด", exact: true }).click();
  await expect(page.locator(".merch-product")).toHaveCount(3);
  await page.getByRole("button", { name: "ชุดสินค้า", exact: true }).click();
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await page.reload();
  await expect(page).toHaveURL(/kind=bundle/);
  await expect(page.locator(".merch-product")).toHaveCount(1);
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
