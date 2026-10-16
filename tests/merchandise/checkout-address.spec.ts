import { test, expect, login } from "./fixtures";
import { makeBundle, makeSingle } from "./data";
import {
  fillAddress,
  openCheckout,
  orderPosts,
  reachReview,
  confirmButton,
  seedCheckout,
  toReviewButton,
} from "./checkoutHelpers";

test("checkout requires login and returns to itself afterwards", async ({
  page,
}) => {
  await page.goto("/th/souvenirs/checkout");
  await expect(page).toHaveURL(/\/th\/login\?redirect=/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBe(
    "/souvenirs/checkout",
  );
});

test("name is prefilled from buyerDefaults and fields carry the API length limits", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await expect(
    page.getByLabel("ชื่อ–นามสกุลผู้รับ", { exact: true }),
  ).toHaveValue("ผู้ซื้อ สังเคราะห์");
  await expect(page.getByLabel("เบอร์โทรผู้รับ", { exact: true })).toHaveValue(
    "",
  );
  const limits: [string, string][] = [
    ["ชื่อ–นามสกุลผู้รับ", "200"],
    ["เบอร์โทรผู้รับ", "30"],
    ["ที่อยู่", "500"],
    ["ตำบล/แขวง", "100"],
    ["อำเภอ/เขต", "100"],
    ["จังหวัด", "100"],
    ["รหัสไปรษณีย์", "5"],
    ["ชื่อบริษัท (ไม่บังคับ)", "200"],
    ["หมายเหตุจัดส่ง (ไม่บังคับ)", "500"],
  ];
  for (const [label, max] of limits)
    await expect(page.getByLabel(label, { exact: true })).toHaveAttribute(
      "maxlength",
      max,
    );
});

test("invalid fields show messages and focus lands on the first invalid one", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await toReviewButton(page).click();
  await expect(page.getByText("กรุณากรอกเบอร์โทรผู้รับ")).toBeVisible();
  await expect(page.getByText("กรุณากรอกที่อยู่")).toBeVisible();
  await expect(page.getByText("กรุณากรอกรหัสไปรษณีย์ 5 หลัก")).toBeVisible();
  await expect(
    page.getByLabel("เบอร์โทรผู้รับ", { exact: true }),
  ).toBeFocused();
  expect(fake.calls.filter((c) => c.method === "POST")).toHaveLength(0);
});

test("a refresh mid-checkout keeps what was typed", async ({ page, fake }) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await fillAddress(page, "081 234 5678");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "ข้อมูลผู้รับ", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("ชื่อ–นามสกุลผู้รับ", { exact: true }),
  ).toHaveValue("ผู้รับ คนละคน");
  await expect(page.getByLabel("เบอร์โทรผู้รับ", { exact: true })).toHaveValue(
    "081 234 5678",
  );
  await expect(page.getByLabel("ที่อยู่", { exact: true })).toHaveValue(
    "99 ถนนสังเคราะห์",
  );
});

test("review shows the amounts of a fresh GET cart and the POST is bound to that cartVersion with a normalized recipient", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await fillAddress(page, "+66 81-234-5678");
  // The cart changes after the page loaded; review must reflect the server.
  const base = makeSingle();
  const other = makeSingle({
    id: "10000000-0000-4000-8000-000000000099",
    nameTh: "ถุงผ้า Pris",
    variants: [
      {
        ...base.variants[0],
        id: "10000000-0000-4000-8000-00000000009a",
        priceMinor: 10000,
      },
    ],
    price: { kind: "exact", amountMinor: 10000 },
  });
  fake.products.push(other);
  fake.seedLine({
    productId: other.id,
    variantId: other.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  await toReviewButton(page).click();
  await expect(page.getByText("ถุงผ้า Pris", { exact: true })).toBeVisible();
  await expect(page.locator(".merch-cart-total")).toContainText("฿400.00");
  await expect(page.getByText("Thai QR PromptPay")).toBeVisible();
  await expect(confirmButton(page)).toContainText("฿400.00");
  const version = fake.cart.cartVersion;
  await confirmButton(page).click();
  await expect(page).toHaveURL(/\/th\/souvenirs\/orders\/[0-9a-f-]{36}$/);
  const [post] = orderPosts(fake);
  expect(post.body).toEqual({
    cartVersion: version,
    recipient: {
      fullName: "ผู้รับ คนละคน",
      phone: "0812345678",
      addressLine: "99 ถนนสังเคราะห์",
      subdistrict: "ตำบลทดสอบ",
      district: "อำเภอทดสอบ",
      province: "กรุงเทพมหานคร",
      postalCode: "10100",
      company: null,
      deliveryNote: null,
    },
  });
});

test("editing from review returns to the form with the draft intact", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await reachReview(page);
  await page
    .getByRole("button", { name: "กลับไปแก้ข้อมูลผู้รับ", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "ข้อมูลผู้รับ", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("ที่อยู่", { exact: true })).toHaveValue(
    "99 ถนนสังเคราะห์",
  );
  expect(orderPosts(fake)).toHaveLength(0);
});

test("a bundle line is described in review", async ({ page, fake }) => {
  const bundle = makeBundle();
  fake.products = [makeSingle(), bundle];
  fake.seedLine({
    productId: bundle.id,
    variantId: null,
    bundleSelections: [
      {
        componentId: bundle.components[1].id,
        variantId: bundle.components[1].allowedVariants[0].id,
      },
    ],
    quantity: 1,
  });
  await login(page);
  await openCheckout(page);
  await reachReview(page);
  await expect(page.getByText("ชุดของที่ระลึก", { exact: true })).toBeVisible();
  await expect(page.getByText(/เสื้อยืด Pris × 1/)).toBeVisible();
});
