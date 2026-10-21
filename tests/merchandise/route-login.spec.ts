import { test, expect, login } from "./fixtures";
import { ids, makeOrder, makeSingle } from "./data";
import { FakeMerchApi } from "./fakeApi";
import { randomBytes } from "node:crypto";

const intentId = "10000000-0000-4000-8000-000000000004";
const target = `/souvenirs?${new URLSearchParams({ q: "แก้ว Mug", kind: "bundle", page: "2", intentId })}`;
test("public nav exposes the shop and auth locale/signup journeys retain the validated return", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/th/about");
  await page.getByRole("button", { name: "Toggle mobile menu" }).click();
  await expect(
    page.getByRole("link", { name: "ของที่ระลึก", exact: true }),
  ).toHaveAttribute("href", "/th/souvenirs");
  await page.goto("/th/login?redirect=" + encodeURIComponent(target));
  await expect(
    page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/th\/login\?/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBe(target);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/login\?/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBe(target);
  await page.locator('a[href^="/en/signup?"]').click();
  await expect(page).toHaveURL(/\/en\/signup\?/);
  await page.locator('a[href^="/en/signup/healthcare?"]').click();
  await expect(page).toHaveURL(/\/en\/signup\/healthcare\?/);
  await page.reload();
  await expect(page).toHaveURL(/\/en\/signup\/healthcare\?/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBe(target);
});
test("unsafe shop return is not propagated into signup links", async ({
  page,
}) => {
  await page.goto(
    "/th/login?redirect=" +
      encodeURIComponent("/souvenirs?email=private@example.test"),
  );
  await expect(
    page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
  ).toBeVisible();
  const link = page.getByRole("link", { name: "ลงทะเบียน", exact: true });
  await expect(link).toHaveAttribute("href", "/th/signup");
});
test("mocked SSO authentication returns to the shop with locale and filters", async ({
  page,
  apiOrigin,
}) => {
  // Only legacy SSO transport is mocked. This proves the actual incumbent router
  // handoff, not storefront UI (P05) or a real sign-in/provider transaction.
  const encode = (v: object) =>
    Buffer.from(JSON.stringify(v)).toString("base64url");
  const user = {
    id: 11,
    firstName: "ผู้ซื้อ",
    lastName: "สังเคราะห์",
    email: "buyer@example.test",
    role: "general",
  };
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ id: 11, exp: Math.floor(Date.now() / 1000) + 3600 })}.${randomBytes(32).toString("base64url")}`;
  await page.route(apiOrigin + "/auth/sso-verify", (route) =>
    route.fulfill({
      status: route.request().method() === "OPTIONS" ? 204 : 200,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "Content-Type",
      },
      contentType: "application/json",
      body:
        route.request().method() === "OPTIONS"
          ? ""
          : JSON.stringify({ success: true, user, token }),
    }),
  );
  await page.goto(
    "/th/auth/sso?sso=synthetic-local-token&redirect=" +
      encodeURIComponent(target),
  );
  await expect(page).toHaveURL("/th" + target);
});

const shopPaths = [
  "/souvenirs/cart",
  "/souvenirs/checkout",
  "/souvenirs/orders",
  `/souvenirs/orders/${ids.order}`,
];
for (const path of shopPaths)
  test(`opening ${path} directly while signed out goes to login and returns to the same path`, async ({
    page,
  }) => {
    await page.goto("/th" + path);
    await expect(page).toHaveURL(/\/th\/login\?/);
    expect(new URL(page.url()).searchParams.get("redirect")).toBe(path);
    await login(page);
    await page.goto("/th" + path);
    await expect(page).toHaveURL("/th" + path);
    await expect(page.locator("main").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
    ).toHaveCount(0);
    await expect(page).toHaveURL("/th" + path);
  });

test("unsafe redirects are not forwarded by the login page", async ({
  page,
}) => {
  await page.goto("/th/login?redirect=" + encodeURIComponent("//evil.example"));
  await expect(
    page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
  ).toBeVisible();
  const link = page.getByRole("link", { name: "ลงทะเบียน", exact: true });
  await expect(link).toHaveAttribute("href", "/th/signup");
  await page.goto(
    "/th/login?redirect=" + encodeURIComponent("/souvenirs/cart?x=1"),
  );
  await expect(link).toHaveAttribute("href", "/th/signup");
});

const LINE = {
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/14.0.0",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 Line/14.0.0",
};
for (const [name, userAgent] of Object.entries(LINE))
  test(`LINE ${name} in-app browser opens a product, adds to cart after login and shows a long-pressable QR`, async ({
    browser,
    apiOrigin,
    baseURL,
  }) => {
    const context = await browser.newContext({ userAgent, baseURL });
    const fake = new FakeMerchApi();
    await fake.install(context, apiOrigin);
    const product = makeSingle();
    fake.products = [product];
    const page = await context.newPage();
    await login(page);
    await page.goto(`/th/souvenirs/products/${product.id}`);
    expect(await page.evaluate(() => navigator.userAgent)).toContain(
      "Line/14.0.0",
    );
    await page
      .getByRole("button", { name: /เพิ่มลงตะกร้า/ })
      .first()
      .click();
    await expect.poll(() => fake.cart.items.length).toBe(1);
    // Let the add flow finish its own navigation before moving on.
    await page.waitForLoadState("networkidle");
    const order = makeOrder();
    fake.orders.set(order.id, order);
    // A late client-side navigation from the add flow may interrupt the first goto.
    await expect(async () => {
      await page.goto(`/th/souvenirs/orders/${order.id}`);
    }).toPass();
    const qr = page.locator(".merch-payment-panel img");
    await expect(qr).toBeVisible();
    await expect(qr).toHaveAttribute("alt", /QR/);
    const styles = await qr.evaluate((e) => {
      const chain: CSSStyleDeclaration[] = [];
      for (let n: Element | null = e; n; n = n.parentElement)
        chain.push(getComputedStyle(n));
      return chain.map((s) => [
        s.pointerEvents,
        s.userSelect,
        s.webkitUserSelect,
      ]);
    });
    for (const [pointer, select, webkit] of styles) {
      expect(pointer).not.toBe("none");
      expect(select).not.toBe("none");
      expect(webkit).not.toBe("none");
    }
    await context.close();
  });
