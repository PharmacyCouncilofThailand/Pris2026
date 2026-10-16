import { test, expect, login } from "./fixtures";
import { ids, makeOrder, uid } from "./data";
import type { FakeMerchApi } from "./fakeApi";
import type { OrderDetail } from "../../src/types/merchandise";

const number = (n: number) => `PRIS2026-M-${String(n).padStart(6, "0")}`;
const seed = (fake: FakeMerchApi, n: number, o: Partial<OrderDetail> = {}) => {
  const order = makeOrder({
    id: uid(n),
    orderNumber: number(n),
    createdAt: new Date(Date.UTC(2026, 9, 15, 3, n)).toISOString(),
    ...o,
  });
  fake.orders.set(order.id, order);
  return order;
};
const rows = (page: import("@playwright/test").Page) =>
  page.locator(".merch-history-row");
const listCalls = (fake: FakeMerchApi) =>
  fake.calls.filter(
    (c) => c.method === "GET" && /\/events\/PRIS-2026\/orders$/.test(c.path),
  );

test("empty history shows the empty state and a shop link", async ({
  page,
  fake,
}) => {
  void fake;
  await login(page);
  await page.goto("/th/souvenirs/orders");
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "เลือกสินค้า", exact: true }),
  ).toHaveAttribute("href", "/th/souvenirs");
});

test("payment status is shown separately from shipping status, without per-order detail reads", async ({
  page,
  fake,
}) => {
  seed(fake, 1);
  seed(fake, 2, {
    paymentStatus: "paid",
    paidAt: "2026-10-15T03:30:00.000Z",
  });
  seed(fake, 3, {
    paymentStatus: "paid",
    paidAt: "2026-10-15T03:30:00.000Z",
    shipping: {
      status: "shipped",
      carrier: "ไปรษณีย์ไทย",
      trackingId: "0000123456789",
      shippedAt: "2026-10-16T03:00:00.000Z",
    },
  });
  seed(fake, 4, { paymentStatus: "expired" });
  await login(page);
  await page.goto("/th/souvenirs/orders");
  await expect(rows(page)).toHaveCount(4);
  const row = (n: number) => rows(page).filter({ hasText: number(n) });
  await expect(row(1)).toContainText("รอชำระเงิน");
  await expect(row(1)).toContainText("ยังไม่จัดส่ง");
  await expect(row(2)).toContainText("ชำระแล้ว");
  await expect(row(2)).toContainText("ยังไม่จัดส่ง");
  await expect(row(3)).toContainText("ชำระแล้ว");
  await expect(row(3)).toContainText("จัดส่งแล้ว");
  await expect(row(3)).toContainText("ไปรษณีย์ไทย");
  await expect(row(3)).toContainText("0000123456789");
  await expect(row(4)).toContainText("หมดเวลาชำระ");
  await expect(row(4)).toContainText("ยังไม่จัดส่ง");
  await expect(row(1)).toContainText("฿300.00");
  expect(
    fake.calls.filter((c) => /\/orders\/[0-9a-f-]{36}$/.test(c.path)),
  ).toEqual([]);
  expect(listCalls(fake).every((c) => c.headers.authorization)).toBe(true);
});

test("page is kept in the URL, survives reload and the locale switch, and asks the API for limit 10", async ({
  page,
  fake,
}) => {
  for (let n = 1; n <= 11; n++) seed(fake, n);
  await login(page);
  await page.goto("/th/souvenirs/orders");
  await expect(rows(page)).toHaveCount(10);
  await page.getByRole("link", { name: "หน้าถัดไป", exact: true }).click();
  await expect(page).toHaveURL(/\/th\/souvenirs\/orders\?page=2$/);
  await expect(rows(page)).toHaveCount(1);
  const first = await rows(page).locator("h2").textContent();
  await page.reload();
  await expect(rows(page).locator("h2")).toHaveText(first!);
  const toEnglish = page
    .getByRole("button", { name: /เปลี่ยนภาษาเป็นภาษาอังกฤษ/ })
    .filter({ visible: true });
  await expect(toEnglish).toHaveAccessibleName(
    "EN เปลี่ยนภาษาเป็นภาษาอังกฤษ",
  );
  await toEnglish.click();
  await expect(page).toHaveURL(/\/en\/souvenirs\/orders\?page=2$/);
  await expect(rows(page).locator("h2")).toHaveText(first!);
  await expect(
    page
      .getByRole("button", { name: /เปลี่ยนภาษาเป็นภาษาไทย/ })
      .filter({ visible: true }),
  ).toHaveAccessibleName("TH เปลี่ยนภาษาเป็นภาษาไทย");
});

test("an invalid page query makes no list request", async ({ page, fake }) => {
  await login(page);
  await page.goto("/th/souvenirs/orders?page=1&page=2");
  await expect(
    page.getByText("พารามิเตอร์หน้าประวัติไม่ถูกต้อง", { exact: true }),
  ).toBeVisible();
  expect(listCalls(fake)).toEqual([]);
});

test("a transport failure is retryable and never shown as empty history", async ({
  page,
  fake,
}) => {
  seed(fake, 1);
  fake.failNext("GET", /\/orders$/, "network");
  await login(page);
  await page.goto("/th/souvenirs/orders");
  await expect(
    page.getByRole("button", { name: "ลองโหลดอีกครั้ง", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีคำสั่งซื้อ", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "ลองโหลดอีกครั้ง", exact: true })
    .click();
  await expect(rows(page)).toHaveCount(1);
});

test("an expired token offers forced reauthentication that keeps the history page", async ({
  page,
  fake,
}) => {
  fake.failNext("GET", /\/orders$/, {
    status: 401,
    body: {
      success: false,
      code: "MERCH_AUTH_REQUIRED",
      error: "หมดอายุ",
      requestId: "r",
    },
  });
  await login(page);
  await page.goto("/th/souvenirs/orders?page=2");
  await page
    .getByRole("link", { name: "เข้าสู่ระบบอีกครั้ง", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
  ).toBeVisible();
  const query = new URL(page.url()).searchParams;
  expect(query.get("reauth")).toBe("merchandise");
  expect(query.get("redirect")).toBe("/souvenirs/orders?page=2");
});

test("pending orders offer a pay button and one page hides pagination", async ({
  page,
  fake,
}) => {
  seed(fake, 1);
  seed(fake, 2, { paymentStatus: "paid", paidAt: "2026-10-15T03:30:00.000Z" });
  await login(page);
  await page.goto("/th/souvenirs/orders");
  await expect(rows(page)).toHaveCount(2);
  const pay = rows(page)
    .filter({ hasText: number(1) })
    .getByRole("link", { name: "ชำระเงิน" });
  await expect(pay).toHaveAttribute("href", `/th/souvenirs/orders/${uid(1)}`);
  await expect(pay).toHaveCSS("background-color", "rgb(255, 88, 0)");
  await expect(
    rows(page).filter({ hasText: number(1) }).getByRole("link", {
      name: "ดูรายละเอียด",
    }),
  ).toHaveCount(0);
  await expect(
    rows(page).filter({ hasText: number(2) }).getByRole("link", {
      name: "ดูรายละเอียด",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "หน้าประวัติคำสั่งซื้อ" }),
  ).toHaveCount(0);
});

test("rows link to the order page", async ({ page, fake }) => {
  seed(fake, 1, {
    id: ids.order,
    paymentStatus: "paid",
    paidAt: "2026-10-15T03:30:00.000Z",
  });
  await login(page);
  await page.goto("/th/souvenirs/orders");
  await page
    .getByRole("link", { name: `ดูรายละเอียด ${number(1)}`, exact: true })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`/th/souvenirs/orders/${ids.order}$`),
  );
});
