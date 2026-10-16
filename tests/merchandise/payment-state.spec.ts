import path from "node:path";
import type { Page } from "@playwright/test";
import { test, expect, login } from "./fixtures";
import type { FakeMerchApi } from "./fakeApi";
import {
  futureIso,
  ids,
  makeOrder,
  now,
  qrActive,
  syntheticQrPayload,
} from "./data";
import type { OrderDetail, PaymentView } from "../../src/types/merchandise";

const NUMBER = "PRIS2026-M-000001";
const failure = (
  status: number,
  code: string,
  error: string,
  details?: Record<string, unknown>,
) => ({
  status,
  body: {
    success: false,
    code,
    error,
    requestId: "r",
    ...(details ? { details } : {}),
  },
});
const view = (o: Partial<PaymentView>): PaymentView => ({
  ...qrActive(),
  ...o,
});
const seed = (fake: FakeMerchApi, o: Partial<OrderDetail> = {}) => {
  const order = makeOrder(o);
  fake.orders.set(order.id, order);
  return order;
};
const open = async (page: Page, id = ids.order) => {
  await login(page);
  await page.goto(`/th/souvenirs/orders/${id}`);
};
const count = (fake: FakeMerchApi, method: string, tail: RegExp) =>
  fake.calls.filter((c) => c.method === method && tail.test(c.path)).length;
const orderGets = (fake: FakeMerchApi) =>
  count(fake, "GET", /\/orders\/[0-9a-f-]{36}$/);
const checks = (fake: FakeMerchApi) => count(fake, "POST", /\/payment-checks$/);
const attempts = (fake: FakeMerchApi) =>
  count(fake, "POST", /\/payment-attempts$/);
const panelButtons = (page: Page) =>
  page.locator(".merch-payment-panel button");
const heading = (page: Page, name: string) =>
  page.getByRole("heading", { name, exact: true });
const message = (page: Page, text: string) =>
  page.getByRole("status").filter({ hasText: text });
async function setVisible(page: Page, visible: boolean) {
  await page.evaluate((v) => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => !v,
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => (v ? "visible" : "hidden"),
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, visible);
}

const noButtons = { canRequestNewQr: false, canCheck: false };
const expiredAttempt = {
  id: ids.attempt,
  referenceNo: "PRIS2026M000001",
  expiresAt: "2026-10-15T02:50:00.000Z",
  qrPayload: null,
};
const states: {
  name: string;
  payment: Partial<PaymentView>;
  title: string;
  text: string;
  button: string | null;
}[] = [
  {
    name: "awaiting_qr",
    payment: {
      state: "awaiting_qr",
      attempt: null,
      canRequestNewQr: true,
      canCheck: false,
    },
    title: "รอสร้าง QR",
    text: "ยังไม่มี QR สำหรับชำระเงิน",
    button: "ขอ QR",
  },
  {
    name: "qr_active",
    payment: {},
    title: "รอชำระเงิน",
    text: "ใช้แอปธนาคารสแกน QR หรือแคปหน้าจอ แล้วเลือกรูปในแอปธนาคาร",
    button: "ตรวจสอบการชำระเงิน",
  },
  {
    name: "verifying",
    payment: { state: "verifying", attempt: expiredAttempt, ...noButtons },
    title: "กำลังตรวจสอบ",
    text: "กำลังตรวจสอบการชำระ กรุณารอสักครู่",
    button: null,
  },
  {
    name: "qr_expired_open",
    payment: {
      state: "qr_expired_open",
      attempt: expiredAttempt,
      canRequestNewQr: true,
      canCheck: false,
    },
    title: "QR หมดอายุ",
    text: "QR หมดอายุ",
    button: "ขอ QR ใหม่",
  },
  {
    name: "qr_expired_closed",
    payment: {
      state: "qr_expired_closed",
      attempt: expiredAttempt,
      ...noButtons,
    },
    title: "หมดเวลาชำระเงิน",
    text: "หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว",
    button: null,
  },
  {
    name: "check_failed",
    payment: {
      state: "check_failed",
      attempt: expiredAttempt,
      canRequestNewQr: false,
      canCheck: true,
    },
    title: "ตรวจสอบไม่สำเร็จ",
    text: "ตรวจสอบไม่สำเร็จ กรุณาลองอีกครั้ง",
    button: "ตรวจสอบอีกครั้ง",
  },
  {
    name: "review",
    payment: { state: "review", attempt: expiredAttempt, ...noButtons },
    title: "รอเจ้าหน้าที่ตรวจสอบ",
    text: `รอเจ้าหน้าที่ตรวจสอบการชำระเงิน หากมีข้อสงสัยติดต่อ pr@pharmacycouncil.org พร้อมเลขออเดอร์ ${NUMBER}`,
    button: null,
  },
];
for (const s of states)
  test(`state ${s.name} shows the spec 7.2 title, text and button`, async ({
    page,
    fake,
  }) => {
    seed(fake, { payment: view(s.payment) });
    await open(page);
    await expect(heading(page, s.title)).toBeVisible();
    await expect(message(page, s.text)).toBeVisible();
    if (s.button)
      await expect(
        page.getByRole("button", { name: s.button, exact: true }),
      ).toBeEnabled();
    await expect(panelButtons(page)).toHaveCount(s.button ? 1 : 0);
    if (s.name !== "qr_active")
      await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toHaveCount(
        0,
      );
  });

test("state paid shows the success heading and the paid record", async ({
  page,
  fake,
}) => {
  seed(fake, {
    paymentStatus: "paid",
    paidAt: now,
    payment: view({ state: "paid", attempt: null, ...noButtons }),
  });
  await open(page);
  await expect(heading(page, "ชำระเงินสำเร็จ")).toBeVisible();
  await expect(heading(page, "ยังไม่จัดส่ง")).toBeVisible();
  await expect(page.locator(".merch-payment-panel")).toHaveCount(0);
});

test("the QR image decodes to the original payload and nothing leaks to storage or the URL", async ({
  page,
  fake,
}) => {
  seed(fake);
  await open(page);
  const img = page.getByRole("img", {
    name: `QR สำหรับชำระเงินคำสั่งซื้อ ${NUMBER}`,
  });
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute("src", /^data:image\/png;base64,/);
  const box = await img.boundingBox();
  expect(Math.round(box!.width)).toBe(280);
  await page.addScriptTag({
    path: path.join(process.cwd(), "node_modules/jsqr/dist/jsQR.js"),
  });
  const decoded = await page.evaluate(async () => {
    const el = document.querySelector<HTMLImageElement>(
      "img.merch-payment-qr",
    )!;
    await el.decode();
    const canvas = document.createElement("canvas");
    canvas.width = el.naturalWidth;
    canvas.height = el.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(el, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const jsQR = (
      window as unknown as {
        jsQR: (
          d: Uint8ClampedArray,
          w: number,
          h: number,
        ) => { data: string } | null;
      }
    ).jsQR;
    return jsQR(data.data, data.width, data.height)?.data ?? null;
  });
  expect(decoded).toBe(syntheticQrPayload);
  await expect(
    page.getByText(
      "กดค้างที่รูป QR หรือแคปหน้าจอ แล้วเลือกรูปในแอปธนาคาร",
    ),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.stringify([
      Object.entries(localStorage),
      Object.entries(sessionStorage),
      location.href,
    ]),
  );
  expect(stored).not.toContain(syntheticQrPayload);
  expect(stored).not.toContain(encodeURIComponent(syntheticQrPayload));
  await expect(page.getByRole("timer")).toContainText(
    "เวลาชำระเงินคงเหลือ 10:00",
  );
  await expect(page.getByText("หมดอายุ 10:10 (เวลาไทย)")).toBeVisible();
  await expect(page.getByText("฿300.00").first()).toBeVisible();
});

test("a server clock 3 seconds from expiry hides the QR, shows verifying and checks once", async ({
  page,
  fake,
}) => {
  seed(fake, {
    payment: qrActive({ serverNow: "2026-10-15T03:09:57.000Z" }),
  });
  fake.onPayment = (kind, order) => {
    if (kind === "check")
      fake.setPayment(order.id, {
        state: "verifying",
        canCheck: false,
        retryAfterSeconds: null,
        serverNow: "2026-10-15T03:10:05.000Z",
      });
  };
  await open(page);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toHaveCount(0, {
    timeout: 5000,
  });
  await expect(message(page, "กำลังตรวจสอบการชำระ กรุณารอสักครู่")).toBeVisible(
    { timeout: 5000 },
  );
  await expect.poll(() => checks(fake)).toBe(1);
  await page.waitForTimeout(1500);
  expect(checks(fake)).toBe(1);
});

test("polling GETs the order every 10 seconds, then stops once paid", async ({
  page,
  fake,
}) => {
  seed(fake);
  await page.clock.install();
  await open(page);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
  const before = orderGets(fake);
  await page.clock.runFor(10_000);
  await expect.poll(() => orderGets(fake)).toBeGreaterThan(before);
  fake.setPayment(ids.order, {
    state: "paid",
    canCheck: false,
    attempt: null,
  });
  await page.clock.runFor(10_000);
  await expect(heading(page, "ชำระเงินสำเร็จ")).toBeVisible();
  await page.waitForTimeout(300);
  const settled = orderGets(fake);
  await page.clock.runFor(9_000);
  await page.waitForTimeout(300);
  expect(orderGets(fake)).toBe(settled);
  await page.clock.runFor(1_000);
  await expect(page).toHaveURL(/\/th\/souvenirs\/orders$/);
});

test("hidden tabs stop polling; returning checks once and not again within 5 seconds", async ({
  page,
  fake,
}) => {
  seed(fake);
  await page.clock.install();
  await open(page);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
  await setVisible(page, false);
  const gets = orderGets(fake);
  await page.clock.runFor(30_000);
  await page.waitForTimeout(300);
  expect(orderGets(fake)).toBe(gets);
  expect(checks(fake)).toBe(0);
  await setVisible(page, true);
  await expect.poll(() => checks(fake)).toBe(1);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
  await setVisible(page, false);
  await setVisible(page, true);
  await page.waitForTimeout(300);
  expect(checks(fake)).toBe(1);
  await page.clock.runFor(6_000);
  await setVisible(page, false);
  await setVisible(page, true);
  await expect.poll(() => checks(fake)).toBe(2);
});

test("coming back after a long hide shows the time left from the new server view (at most 1:00)", async ({
  page,
  fake,
}) => {
  seed(fake);
  fake.onPayment = (kind, order) => {
    if (kind === "check")
      fake.setPayment(order.id, { serverNow: "2026-10-15T03:09:00.000Z" });
  };
  await page.clock.install();
  await open(page);
  const timer = page.getByRole("timer");
  await expect(timer).toContainText("เวลาชำระเงินคงเหลือ 10:00");
  await setVisible(page, false);
  await page.clock.runFor(5_000);
  await setVisible(page, true);
  await expect.poll(() => checks(fake)).toBe(1);
  await expect(timer).toHaveText(/^เวลาชำระเงินคงเหลือ 0[01]:\d\d$/);
  const [, mm, ss] = (await timer.innerText())
    .match(/(\d\d):(\d\d)$/)!
    .slice(0);
  expect(Number(mm) * 60 + Number(ss)).toBeLessThanOrEqual(60);
});

test("ขอ QR ใหม่ posts a payment attempt and shows the new QR", async ({
  page,
  fake,
}) => {
  seed(fake, {
    payment: view({
      state: "qr_expired_open",
      attempt: expiredAttempt,
      canRequestNewQr: true,
      canCheck: false,
    }),
  });
  fake.onPayment = (kind, order) => {
    if (kind === "attempt") fake.setPayment(order.id, qrActive());
  };
  await open(page);
  await page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }).click();
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
  expect(attempts(fake)).toBe(1);
  await expect(heading(page, "รอชำระเงิน")).toBeVisible();
});

test("409 MERCH_PAYMENT_VERIFYING shows verifying and re-checks after retryAfterSeconds", async ({
  page,
  fake,
}) => {
  seed(fake, {
    payment: view({
      state: "qr_expired_open",
      attempt: expiredAttempt,
      canRequestNewQr: true,
      canCheck: false,
    }),
  });
  fake.failNext(
    "POST",
    /payment-attempts$/,
    failure(409, "MERCH_PAYMENT_VERIFYING", "กำลังตรวจสอบการชำระ", {
      retryAfterSeconds: 3,
    }),
  );
  fake.onPayment = (kind, order) => {
    if (kind === "check")
      fake.setPayment(order.id, {
        state: "qr_expired_open",
        canRequestNewQr: true,
      });
  };
  await page.clock.install();
  await open(page);
  await page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }).click();
  await expect(
    message(page, "กำลังตรวจสอบการชำระ กรุณารอสักครู่"),
  ).toBeVisible();
  expect(checks(fake)).toBe(0);
  await page.clock.runFor(3_100);
  await expect.poll(() => checks(fake)).toBe(1);
  await expect(heading(page, "QR หมดอายุ")).toBeVisible();
});

test("503 MERCH_PAYMENT_UNAVAILABLE says the payment system is not ready", async ({
  page,
  fake,
}) => {
  seed(fake, {
    payment: view({
      state: "qr_expired_open",
      attempt: expiredAttempt,
      canRequestNewQr: true,
      canCheck: false,
    }),
  });
  fake.failNext(
    "POST",
    /payment-attempts$/,
    failure(503, "MERCH_PAYMENT_UNAVAILABLE", "ระบบชำระเงินไม่พร้อม"),
  );
  await open(page);
  await page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }).click();
  await expect(page.locator("main [role=alert]")).toHaveText(
    "ระบบชำระเงินยังไม่พร้อม กรุณาลองใหม่ภายหลัง",
  );
  await expect(
    page.getByRole("button", { name: "ขอ QR ใหม่", exact: true }),
  ).toBeEnabled();
});

test("429 on a check disables the buttons for 10 seconds", async ({
  page,
  fake,
}) => {
  seed(fake);
  fake.failNext(
    "POST",
    /payment-checks$/,
    failure(429, "RATE_LIMITED", "ทำรายการถี่เกินไป"),
  );
  await page.clock.install();
  await open(page);
  const button = page.getByRole("button", {
    name: "ตรวจสอบการชำระเงิน",
    exact: true,
  });
  await button.click();
  await expect(page.locator("main [role=alert]")).toHaveText(
    "ทำรายการถี่เกินไป กรุณารอสักครู่",
  );
  await expect(button).toBeDisabled();
  await page.clock.runFor(10_100);
  await expect(button).toBeEnabled();
});

test("a network failure on a check reloads the order instead of guessing", async ({
  page,
  fake,
}) => {
  seed(fake);
  await open(page);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
  const before = orderGets(fake);
  fake.failNext("POST", /payment-checks$/, "lost");
  await page
    .getByRole("button", { name: "ตรวจสอบการชำระเงิน", exact: true })
    .click();
  await expect.poll(() => orderGets(fake)).toBeGreaterThan(before);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
});

test("an unknown order shows ไม่พบคำสั่งซื้อ with a link to the history", async ({
  page,
  fake,
}) => {
  expect(fake.orders.size).toBe(0);
  await open(page, "10000000-0000-4000-8000-0000000000ff");
  await expect(heading(page, "ไม่พบคำสั่งซื้อ")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "ไปหน้าประวัติคำสั่งซื้อ" }),
  ).toHaveAttribute("href", "/th/souvenirs/orders");
});

test("a shipped paid order keeps the tracking number and shows the unboxing advice", async ({
  page,
  fake,
}) => {
  seed(fake, {
    paymentStatus: "paid",
    paidAt: now,
    shipping: {
      status: "shipped",
      carrier: "Flash Express",
      trackingId: "0012345",
      shippedAt: futureIso,
    },
    payment: view({ state: "paid", attempt: null, ...noButtons }),
  });
  await open(page);
  await expect(heading(page, "จัดส่งแล้ว")).toBeVisible();
  await expect(page.getByText("Flash Express")).toBeVisible();
  await expect(page.getByText("0012345", { exact: true })).toBeVisible();
  await expect(page.getByText(/ถ่ายวิดีโอขณะแกะพัสดุ/)).toBeVisible();
  await expect(
    page
      .getByRole("main")
      .getByRole("link", { name: "pr@pharmacycouncil.org" }),
  ).toBeVisible();
});

test("the order page lists bundle components, server amounts, recipient and shop info", async ({
  page,
  fake,
}) => {
  seed(fake, {
    paymentStatus: "paid",
    paidAt: now,
    payment: view({ state: "paid", attempt: null, ...noButtons }),
    productionInfoTh: "ผลิตหลังปิดรับพรีออเดอร์",
    shippingInfoTh: "จัดส่งภายใน 30 วัน",
    items: [
      {
        id: "10000000-0000-4000-8000-000000000042",
        kind: "bundle",
        nameTh: "ชุดของที่ระลึก",
        sizeTh: null,
        colorTh: null,
        quantity: 1,
        unitPriceBaht: 250,
        lineTotalBaht: 250,
        components: [
          {
            nameTh: "แก้วน้ำ Pris",
            sizeTh: null,
            colorTh: null,
            quantityPerBundle: 2,
          },
          {
            nameTh: "เสื้อยืด Pris",
            sizeTh: "L",
            colorTh: "ขาว",
            quantityPerBundle: 1,
          },
        ],
      },
    ],
  });
  await open(page);
  await expect(heading(page, `คำสั่งซื้อ ${NUMBER}`)).toBeVisible();
  await expect(page.getByText("ชุดของที่ระลึก")).toBeVisible();
  await expect(page.getByText("แก้วน้ำ Pris × 2")).toBeVisible();
  await expect(page.getByText("เสื้อยืด Pris × 1 · ขาว · L")).toBeVisible();
  await expect(page.getByText("฿50.00")).toBeVisible();
  await expect(page.getByText("ผู้ซื้อ สังเคราะห์").first()).toBeVisible();
  await expect(page.getByText("1 ถนนทดสอบ")).toBeVisible();
  await expect(page.getByText("ผลิตหลังปิดรับพรีออเดอร์")).toBeVisible();
  await expect(page.getByText("จัดส่งภายใน 30 วัน")).toBeVisible();
});

test("qr_active with a null payload shows a notice and a check button, not a broken page", async ({
  page,
  fake,
}) => {
  const base = qrActive();
  seed(fake, {
    payment: view({
      attempt: { ...base.attempt!, qrPayload: null },
      canCheck: true,
    }),
  });
  await open(page);
  await expect(
    message(page, "ไม่สามารถแสดง QR ได้ กรุณากดตรวจสอบการชำระเงิน"),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "ตรวจสอบการชำระเงิน", exact: true }),
  ).toBeEnabled();
});

test("unpaid order shows only the QR card with the PRIS logo", async ({
  page,
  fake,
}) => {
  seed(fake);
  await open(page);
  await expect(
    page.locator(".merch-pay-card img[alt='PRIS 2026']"),
  ).toBeVisible();
  await expect(heading(page, "รอชำระเงิน")).toBeVisible();
  await expect(page.getByRole("link", { name: "กลับหน้าประวัติ" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("link", { name: "บันทึกภาพ QR" })).toHaveCount(0);
  await expect(page.locator(".merch-order-item")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "ผู้รับ" })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 1, name: `คำสั่งซื้อ ${NUMBER}` }),
  ).toBeAttached();
});

test("paying while on the page counts down 10 seconds then opens the order list", async ({
  page,
  fake,
}) => {
  seed(fake);
  await page.clock.install();
  await open(page);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
  fake.setPayment(ids.order, { state: "paid", canCheck: false, attempt: null });
  await page.clock.runFor(10_000);
  await expect(heading(page, "ชำระเงินสำเร็จ")).toBeVisible();
  await expect(
    page.getByText("จะพาไปหน้ารายการคำสั่งซื้อใน 10 วินาที"),
  ).toBeVisible();
  await page.clock.runFor(5_000);
  await expect(
    page.getByText("จะพาไปหน้ารายการคำสั่งซื้อใน 5 วินาที"),
  ).toBeVisible();
  await page.clock.runFor(5_000);
  await expect(page).toHaveURL(/\/th\/souvenirs\/orders$/);
});

test("the just-paid button opens the order list at once", async ({
  page,
  fake,
}) => {
  seed(fake);
  await page.clock.install();
  await open(page);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
  fake.setPayment(ids.order, { state: "paid", canCheck: false, attempt: null });
  await page.clock.runFor(10_000);
  await page.getByRole("link", { name: "ไปหน้ารายการคำสั่งซื้อ" }).click();
  await expect(page).toHaveURL(/\/th\/souvenirs\/orders$/);
});

test("an order already paid on load shows details and never redirects", async ({
  page,
  fake,
}) => {
  seed(fake, {
    paymentStatus: "paid",
    paidAt: now,
    payment: view({ state: "paid", attempt: null, ...noButtons }),
  });
  await page.clock.install();
  await open(page);
  await expect(page.getByRole("link", { name: "กลับหน้าประวัติ" })).toBeVisible();
  await expect(heading(page, "ยังไม่จัดส่ง")).toBeVisible();
  await page.clock.runFor(15_000);
  await expect(page).toHaveURL(new RegExp(`/souvenirs/orders/${ids.order}$`));
});

test("verifying after QR shows no countdown", async ({ page, fake }) => {
  seed(fake);
  await page.clock.install();
  await open(page);
  fake.setPayment(ids.order, { state: "verifying", canCheck: false });
  await page.clock.runFor(15_000);
  await expect(page.getByText(/จะพาไปหน้ารายการคำสั่งซื้อ/)).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`/souvenirs/orders/${ids.order}$`));
});
