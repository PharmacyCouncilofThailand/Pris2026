import type { Page } from "@playwright/test";
import { expect } from "./fixtures";
import { makeSingle, makeStore } from "./data";
import type { FakeMerchApi } from "./fakeApi";

export const KEY_PREFIX = "pris_merchandise_checkout:";

export async function fillAddress(page: Page, phone = "081-234-5678") {
  for (const [label, value] of [
    ["ชื่อ–นามสกุลผู้รับ", "ผู้รับ คนละคน"],
    ["เบอร์โทรผู้รับ", phone],
    ["ที่อยู่", "99 ถนนสังเคราะห์"],
    ["ตำบล/แขวง", "ตำบลทดสอบ"],
    ["อำเภอ/เขต", "อำเภอทดสอบ"],
    ["จังหวัด", "กรุงเทพมหานคร"],
    ["รหัสไปรษณีย์", "10100"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
}

export const toReviewButton = (page: Page) =>
  page.getByRole("button", { name: /^ตรวจสอบคำสั่งซื้อ/ });
export const confirmButton = (page: Page) =>
  page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ });
export const retryButton = (page: Page) =>
  page.getByRole("button", { name: "ลองอีกครั้ง", exact: true });

export function seedCheckout(fake: FakeMerchApi, state = makeStore()) {
  const p = makeSingle();
  fake.store = state;
  fake.products = [p];
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  });
  return p;
}

export async function openCheckout(page: Page) {
  await page.goto("/th/souvenirs/checkout");
  await expect(
    page.getByRole("heading", { name: "ข้อมูลผู้รับ", exact: true }),
  ).toBeVisible();
}

export async function reachReview(page: Page) {
  await fillAddress(page);
  await toReviewButton(page).click();
  await expect(
    page.getByRole("heading", { name: "ตรวจสอบคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
  await expect(confirmButton(page)).toBeEnabled();
}

/** Idempotency-Key currently held in sessionStorage (null when absent). */
export const storedKey = (page: Page) =>
  page.evaluate((prefix) => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const name = sessionStorage.key(i)!;
      if (name.startsWith(prefix))
        return (JSON.parse(sessionStorage.getItem(name)!).key ?? null) as
          string | null;
    }
    return null;
  }, KEY_PREFIX);

export const orderPosts = (fake: FakeMerchApi) =>
  fake.calls.filter((c) => c.method === "POST" && /\/orders$/.test(c.path));
