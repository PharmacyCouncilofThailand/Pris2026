import { test, expect } from "./fixtures";
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
