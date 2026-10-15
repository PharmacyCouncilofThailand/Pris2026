import { test, expect } from "./live-fixture";
import type { Page, Route } from "@playwright/test";
import { execFileSync } from "node:child_process";

const ticket = {
  registrationId: 17,
  eventId: 1,
  eventCode: "PRIS-2026",
  status: "confirmed",
  regCode: "REG-SYNTHETIC-17",
  ticketName: "บัตรทดสอบเดิม",
  eventName: "PRIS 2026",
  eventStartDate: "2026-11-01T00:00:00Z",
  eventEndDate: "2026-11-02T00:00:00Z",
  eventLocation: "สถานที่ทดสอบ",
  includes: [],
  paidAmount: "1000.00",
  receiptUrl: "https://receipt.example.invalid/legacy.pdf",
};
async function legacyTransport(page: Page, origin: string, paid = true) {
  await page.route("https://challenges.cloudflare.com/**", (r) =>
    r.abort("blockedbyclient"),
  );
  await page.route(origin + "/**", async (route: Route) => {
    const path = new URL(route.request().url()).pathname;
    // Only the incumbent transport is mocked. Shop API remains a real isolated backend.
    if (path.startsWith("/api/v1/merchandise")) return route.continue();
    let body: unknown = { success: true, data: [] };
    if (path === "/api/users/profile")
      body = {
        success: true,
        user: {
          id: 1,
          firstName: "ผู้ซื้อ",
          lastName: "ทดสอบ",
          email: "buyer@example.test",
          role: "general",
          phone: "0812345678",
          status: "active",
        },
      };
    if (path === "/api/registrations/check")
      body = { success: true, isRegistered: true, regCode: ticket.regCode };
    if (path === "/api/payments/my-tickets")
      body = {
        success: true,
        data: [
          {
            ...ticket,
            paidAmount: paid ? "1000.00" : "0.00",
            receiptUrl: paid ? ticket.receiptUrl : null,
          },
        ],
      };
    if (path.includes("/booth-membership"))
      body = { success: true, membership: null };
    if (path.includes("/booths"))
      body = {
        success: true,
        booths: [
          {
            id: 11,
            eventId: 1,
            name: "Booth เดิมสังเคราะห์",
            type: "standard",
          },
        ],
        pagination: { totalPages: 1 },
      };
    if (path === "/auth/sso-token")
      body = {
        success: true,
        ssoToken: "synthetic-not-an-actual-ott",
        targetUrl: "https://conference-web.example.invalid",
      };
    if (path.includes("/presentation"))
      body = {
        success: true,
        data: {
          abstractId: 51,
          trackingId: "SYNTHETIC-P001",
          title: "ผลงานเดิมสังเคราะห์",
          submitterName: "ผู้ส่งทดสอบ",
          presentationType: "poster",
          categoryName: "หมวดทดสอบ",
          round: 1,
          serverNow: "2026-10-14T03:00:00Z",
          mainClosesAt: "2026-10-16T17:00:00Z",
          canUpload: true,
          blockCode: null,
          mode: "initial",
          currentUpload: null,
          uploads: [],
          selectedRequest: null,
        },
      };
    if (path.includes("/session-invitations/current"))
      body = {
        invitationId: "synthetic",
        status: "accepted",
        respondedAt: "2026-10-14T03:00:00Z",
        effectiveDeadline: "2026-10-16T17:00:00Z",
        recipientFirstName: "ผู้รับทดสอบ",
        session: {
          sessionName: "กิจกรรมเดิมสังเคราะห์",
          sessionType: "workshop",
          startTime: "2026-11-01T03:00:00Z",
          endTime: "2026-11-01T04:00:00Z",
          room: "ห้องทดสอบ",
        },
      };
    await route.fulfill({
      status: route.request().method() === "OPTIONS" ? 204 : 200,
      contentType: "application/json",
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers":
          "Authorization, Content-Type, X-Source-App",
        "access-control-allow-methods": "GET,POST,PUT,OPTIONS",
      },
      body: route.request().method() === "OPTIONS" ? "" : JSON.stringify(body),
    });
  });
}

test("incumbent homepage header, scroll, menu and locale remain outside the shop resource boundary", async ({
  page,
  merchandise,
}) => {
  const shopCalls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/v1/merchandise")) shopCalls.push(r.url());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/th");
  await expect(page.locator("body")).not.toHaveClass(/hero-playing/);
  const menu = page.getByRole("button", {
    name: "Toggle mobile menu",
    exact: true,
  });
  await expect(menu).toBeVisible();
  await page.evaluate(() => scrollTo(0, 700));
  await expect(page.locator("header")).toBeVisible();
  await menu.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("link", { name: "ของที่ระลึก", exact: true }),
  ).toHaveAttribute("href", "/th/souvenirs");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en$/);
  expect(shopCalls).toEqual([]);
  expect(
    (await merchandise.command<{ cartReads: number }>("inspect")).cartReads,
  ).toBe(0);
});

test("registration keeps its login and conference-web SSO boundary rather than using shop checkout", async ({
  page,
  merchandise,
}) => {
  await legacyTransport(page, merchandise.origin);
  await page.goto("/th/registration");
  await page.locator("button.registration-floating-cta-button").click();
  await expect(page).toHaveURL(/\/th\/login\?redirect=%2Fregistration/);
  await merchandise.login(page);
  await page.goto("/th/registration");
  await page.route("https://conference-web.example.invalid/**", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<main>Explicit mocked legacy SSO destination</main>",
    }),
  );
  const sso = page.waitForRequest(
    (r) => r.url().endsWith("/auth/sso-token") && r.method() === "POST",
  );
  await page.locator("button.registration-floating-cta-button").click();
  const request = await sso;
  expect(request.postDataJSON()).toEqual({ targetApp: "conference-web" });
  await expect(page).toHaveURL(/conference-web\.example\.invalid\/auth\/sso\?/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBe(
    "/events/PRIS-2026",
  );
});

for (const paid of [false, true])
  test(`legacy ${paid ? "paid" : "free"} registration ticket and receipt semantics survive`, async ({
    page,
    merchandise,
  }) => {
    await legacyTransport(page, merchandise.origin, paid);
    await merchandise.login(page);
    await page.goto("/th/ticket");
    await expect(
      page.getByText(ticket.regCode, { exact: true }).first(),
    ).toBeVisible();
    await expect(page.locator("main")).toContainText(ticket.ticketName);
    await page.goto("/th/profile");
    const receipt = page.getByRole("link", {
      name: "ดาวน์โหลดใบเสร็จ",
      exact: true,
    });
    if (paid) await expect(receipt).toHaveAttribute("href", ticket.receiptUrl);
    else await expect(receipt).toHaveCount(0);
    expect(
      await page.locator(".merch-cart-bar,.merch-payment-panel").count(),
    ).toBe(0);
  });

test("Booth signup, invitation and presentation direct reloads retain their incumbent resource and route contracts", async ({
  page,
  merchandise,
}) => {
  await legacyTransport(page, merchandise.origin);
  await page.goto("/th/signup/booth");
  const booth = page.locator("#boothId");
  await expect(booth).toBeEnabled();
  await booth.click();
  await page
    .getByRole("option", { name: "Booth เดิมสังเคราะห์", exact: true })
    .click();
  await expect(booth).toContainText("Booth เดิมสังเคราะห์");
  await page.goto("/th/sessions/confirm?token=" + "a".repeat(64));
  await expect(
    page.getByText("กิจกรรมเดิมสังเคราะห์", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("กิจกรรมเดิมสังเคราะห์", { exact: true }),
  ).toBeVisible();
  await merchandise.login(page);
  await page.goto("/th/presentation-submission?abstractId=51");
  await expect(
    page.getByText("ผลงานเดิมสังเคราะห์", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/presentation-submission\?abstractId=51$/);
  await expect(
    page.getByText("ผลงานเดิมสังเคราะห์", { exact: true }),
  ).toBeVisible();
});

test("lucky-wheel login return and registration success toast remain independent from merchandise payment", async ({
  page,
  merchandise,
}) => {
  await merchandise.mockLogin(page);
  await page.goto("/th/lucky-wheel");
  await expect(page).toHaveURL(/\/th\/login\?redirect=%2Flucky-wheel/);
  await page.goto(
    "/th?status=registered&regCode=REG-SYNTHETIC-17&orderNumber=legacy-order",
  );
  await expect(page.getByText(/REG-SYNTHETIC-17/).first()).toBeVisible();
  await expect(page).not.toHaveURL(/status=|regCode=|orderNumber=/);
  expect(await page.locator(".merch-payment-panel,.merch-paid").count()).toBe(
    0,
  );
});

test("legacy payment, receipt, signup and activity implementations remain byte-identical to the starting revision", async () => {
  const paths = [
    "src/lib/sso.ts",
    "src/lib/entryTicket.ts",
    "src/lib/profileReceipt.ts",
    "src/lib/booths.ts",
    "src/lib/sessionInvitation.ts",
    "src/lib/presentationApi.ts",
    "src/components/sections/RegistrationCTASection.tsx",
    "src/components/layout/PaymentReturnToast.tsx",
    "src/app/[locale]/ticket/page.tsx",
    "src/app/[locale]/profile/page.tsx",
    "src/app/[locale]/lucky-wheel/page.tsx",
  ];
  expect(
    execFileSync(
      "git",
      [
        "diff",
        "--numstat",
        "db6726c5f352736f4b8bfd91452055bf8bca5cf9",
        "--",
        ...paths,
      ],
      { encoding: "utf8" },
    ).trim(),
  ).toBe("");
});
