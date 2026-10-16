import { test, expect, login } from "./fixtures";
import { makeStore } from "./data";
import {
  confirmButton,
  KEY_PREFIX,
  openCheckout,
  orderPosts,
  reachReview,
  retryButton,
  seedCheckout,
  storedKey,
} from "./checkoutHelpers";

const failure = (status: number, code: string, error: string) => ({
  status,
  body: { success: false, code, error, requestId: "r" },
});
const ORDER_URL = /\/th\/souvenirs\/orders\/[0-9a-f-]{36}$/;

test("the key is already in sessionStorage when the POST leaves the browser", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  let seen: string | null = null;
  await page.route(/\/orders$/, async (route) => {
    if (route.request().method() === "POST") seen = await storedKey(page);
    await route.fallback();
  });
  await openCheckout(page);
  await reachReview(page);
  expect(await storedKey(page)).toBeNull();
  await confirmButton(page).click();
  await expect(page).toHaveURL(ORDER_URL);
  const [post] = orderPosts(fake);
  expect(seen).not.toBeNull();
  expect(post.headers["idempotency-key"]).toBe(seen);
  expect(post.headers["idempotency-key"]).toMatch(/^[A-Za-z0-9_-]{1,100}$/);
  // Success removes the key and the draft.
  expect(
    await page.evaluate(
      (p) => Object.keys(sessionStorage).filter((k) => k.startsWith(p)).length,
      KEY_PREFIX,
    ),
  ).toBe(0);
});

test("a lost response is retried with the same key and the replay opens the order", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await reachReview(page);
  fake.failNext("POST", /orders$/, "lost");
  await confirmButton(page).click();
  await expect(page.getByText("ยังไม่ทราบผลการยืนยัน")).toBeVisible();
  const key = await storedKey(page);
  expect(key).not.toBeNull();
  await retryButton(page).click();
  await expect(page).toHaveURL(ORDER_URL);
  const posts = orderPosts(fake);
  expect(posts).toHaveLength(2);
  expect(posts[0].headers["idempotency-key"]).toBe(key);
  expect(posts[1].headers["idempotency-key"]).toBe(key);
  expect(posts[1].body).toEqual(posts[0].body);
  expect(fake.orders.size).toBe(1);
});

test("a network failure that never reached the server also keeps the key for retry", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await reachReview(page);
  fake.failNext("POST", /orders$/, "network");
  await confirmButton(page).click();
  await expect(page.getByText("ยังไม่ทราบผลการยืนยัน")).toBeVisible();
  await retryButton(page).click();
  await expect(page).toHaveURL(ORDER_URL);
  const posts = orderPosts(fake);
  expect(posts[1].headers["idempotency-key"]).toBe(
    posts[0].headers["idempotency-key"],
  );
});

test("a malformed 2xx is treated as unknown, not as a finished order", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await reachReview(page);
  fake.failNext("POST", /orders$/, {
    status: 201,
    body: { success: true, data: { nope: true } },
  });
  await confirmButton(page).click();
  await expect(page.getByText("ยังไม่ทราบผลการยืนยัน")).toBeVisible();
  expect(await storedKey(page)).not.toBeNull();
  await expect(retryButton(page)).toBeVisible();
});

test("409 MERCH_CART_CHANGED returns to a refreshed review with the notice", async ({
  page,
  fake,
}) => {
  const p = seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await reachReview(page);
  fake.seedLine({
    productId: p.id,
    variantId: p.variants[0].id,
    bundleSelections: [],
    quantity: 1,
  }); // quantity 2 now, new cartVersion
  await confirmButton(page).click();
  await expect(
    page.getByText("ตะกร้ามีการเปลี่ยนแปลง กรุณาตรวจสอบอีกครั้ง"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "ตรวจสอบคำสั่งซื้อ", exact: true }),
  ).toBeVisible();
  await expect(confirmButton(page)).toContainText("฿550.00");
  expect(await storedKey(page)).toBeNull();
  const version = fake.cart.cartVersion;
  await confirmButton(page).click();
  await expect(page).toHaveURL(ORDER_URL);
  expect(
    (orderPosts(fake)[1].body as { cartVersion: string }).cartVersion,
  ).toBe(version);
});

test("a closed store at POST time says so and disables confirmation", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await reachReview(page);
  fake.store = makeStore({ state: "closed" });
  await confirmButton(page).click();
  await expect(page.locator("main [role=alert]")).toHaveText(
    "ปิดรับพรีออเดอร์แล้ว",
  );
  await expect(confirmButton(page)).toBeDisabled();
});

test("422 MERCH_IDEMPOTENCY_KEY_REUSED drops the key so the next confirmation uses a new one", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await reachReview(page);
  fake.failNext(
    "POST",
    /orders$/,
    failure(
      422,
      "MERCH_IDEMPOTENCY_KEY_REUSED",
      "คีย์นี้ถูกใช้กับคำขอที่ต่างกัน",
    ),
  );
  await confirmButton(page).click();
  await expect(page.getByText(/กดยืนยันคำสั่งซื้ออีกครั้ง/)).toBeVisible();
  await expect(confirmButton(page)).toBeEnabled();
  expect(await storedKey(page)).toBeNull();
  await confirmButton(page).click();
  await expect(page).toHaveURL(ORDER_URL);
  const posts = orderPosts(fake);
  expect(posts[1].headers["idempotency-key"]).not.toBe(
    posts[0].headers["idempotency-key"],
  );
});

test("when sessionStorage cannot be written nothing is sent and the buyer is told why", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k: string, v: string) {
      if (this === window.sessionStorage) throw new Error("blocked");
      return original.call(this, k, v);
    };
  });
  await openCheckout(page);
  await reachReview(page);
  await confirmButton(page).click();
  await expect(page.locator("main [role=alert]")).toContainText("storage");
  expect(orderPosts(fake)).toHaveLength(0);
  await expect(confirmButton(page)).toBeEnabled();
});

test("double-clicking confirm sends exactly one POST", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await page.route(/\/orders$/, async (route) => {
    if (route.request().method() === "POST")
      await new Promise((r) => setTimeout(r, 400));
    await route.fallback();
  });
  await openCheckout(page);
  await reachReview(page);
  await confirmButton(page).dblclick();
  await expect(page).toHaveURL(ORDER_URL);
  expect(orderPosts(fake)).toHaveLength(1);
  expect(fake.orders.size).toBe(1);
});

test("401 at POST goes to login, and coming back resumes with the draft and the same key", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await reachReview(page);
  fake.failNext(
    "POST",
    /orders$/,
    failure(401, "UNAUTHORIZED", "กรุณาเข้าสู่ระบบอีกครั้ง"),
  );
  await confirmButton(page).click();
  await expect(page).toHaveURL(/\/th\/login\?redirect=/);
  const target = new URL(page.url()).searchParams.get("redirect")!;
  expect(target).toBe("/souvenirs/checkout");
  const key = await storedKey(page);
  expect(key).not.toBeNull();
  await page.goto(`/th${target}`);
  await expect(page.getByText("ยังไม่ทราบผลการยืนยัน")).toBeVisible();
  await expect(page.getByText("ผู้รับ คนละคน")).toBeVisible();
  await expect(page.getByText("99 ถนนสังเคราะห์")).toBeVisible();
  await retryButton(page).click();
  await expect(page).toHaveURL(ORDER_URL);
  const posts = orderPosts(fake);
  expect(posts).toHaveLength(2);
  expect(posts[1].headers["idempotency-key"]).toBe(key);
  expect(posts[1].body).toEqual(posts[0].body);
});

test("a lost response survives a reload: retry replays the persisted key and body even though the cart is now empty", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await openCheckout(page);
  await reachReview(page);
  fake.failNext("POST", /orders$/, "lost");
  await confirmButton(page).click();
  await expect(page.getByText("ยังไม่ทราบผลการยืนยัน")).toBeVisible();
  expect(fake.orders.size).toBe(1);
  expect(fake.cart.items).toHaveLength(0);
  await page.reload();
  await expect(page.getByText("ยังไม่ทราบผลการยืนยัน")).toBeVisible();
  await expect(retryButton(page)).toBeEnabled();
  await retryButton(page).click();
  await expect(page).toHaveURL(ORDER_URL);
  const posts = orderPosts(fake);
  expect(posts).toHaveLength(2);
  expect(posts[1].headers["idempotency-key"]).toBe(
    posts[0].headers["idempotency-key"],
  );
  expect(JSON.stringify(posts[1].body)).toBe(JSON.stringify(posts[0].body));
  expect(fake.orders.size).toBe(1);
  expect(await storedKey(page)).toBeNull();
});

test("after the order is created, Back shows an empty cart without any error", async ({
  page,
  fake,
}) => {
  seedCheckout(fake);
  await login(page);
  await page.goto("/th/souvenirs/cart");
  await page.getByRole("button", { name: /^ดำเนินการสั่งซื้อ/ }).click();
  await expect(page).toHaveURL(/\/th\/souvenirs\/checkout$/);
  await reachReview(page);
  await confirmButton(page).click();
  await expect(page).toHaveURL(ORDER_URL);
  await page.goBack();
  await expect(page).toHaveURL(/\/th\/souvenirs\/cart$/);
  await expect(
    page.getByRole("heading", { name: "ยังไม่มีสินค้าในตะกร้า", exact: true }),
  ).toBeVisible();
  await expect(page.locator("main [role=alert]")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /^ดำเนินการสั่งซื้อ/ }),
  ).toBeDisabled();
});
