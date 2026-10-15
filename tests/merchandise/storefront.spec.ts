import { test, expect } from "./live-fixture";
test("draft catalog is public without prices or a purchase action", async ({
  page,
  merchandise,
}) => {
  await page.goto("/th/souvenirs");
  await expect(
    page.getByText("ยังไม่มีสินค้าที่เปิดแสดง", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".merch-primary")).toBeDisabled();
  await expect(page.locator(".merch-banner")).toHaveCount(0);
  expect(
    (await merchandise.command<{ cartReads: number }>("inspect")).cartReads,
  ).toBe(0);
});
test("public catalog uses real local API filters, categories, bundles and manual banners", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 3 });
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  await expect(
    page.getByRole("button", { name: "แบนเนอร์ถัดไป", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "แบนเนอร์ถัดไป", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "ดูแบนเนอร์ 2", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await page
    .getByRole("button", { name: "แบนเนอร์ถัดไป", exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("button", { name: "ดูแบนเนอร์ 3", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await page.locator(".merch-banner-art").dispatchEvent("pointerdown", {
    pointerType: "touch",
    clientX: 240,
    clientY: 180,
  });
  await page.locator(".merch-banner-art").dispatchEvent("pointerup", {
    pointerType: "touch",
    clientX: 100,
    clientY: 180,
  });
  await expect(
    page.getByRole("button", { name: "ดูแบนเนอร์ 1", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await page
    .getByRole("searchbox", { name: "ค้นหาสินค้า", exact: true })
    .fill("ไม่พบคำนี้");
  await expect(
    page.getByText("ไม่พบสินค้าตามคำค้นหาหรือหมวดที่เลือก", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true })
    .click();
  await expect(page.locator(".merch-product")).toHaveCount(12);
  await page.getByRole("button", { name: "ชุดสินค้า", exact: true }).click();
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await page.getByRole("button", { name: "ทั้งหมด", exact: true }).click();
  await expect(page.locator(".merch-product")).toHaveCount(12);
  await page
    .getByRole("button", { name: "หมวดสังเคราะห์", exact: true })
    .click();
  await expect(page.locator(".merch-product")).toHaveCount(11);
  await page
    .getByRole("searchbox", { name: "ค้นหาสินค้า", exact: true })
    .fill("Mug");
  await page
    .getByRole("button", { name: "หมวดสังเคราะห์", exact: true })
    .click();
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await page.getByRole("button", { name: "ชุดสินค้า", exact: true }).click();
  await expect(
    page.getByText("ไม่พบสินค้าตามคำค้นหาหรือหมวดที่เลือก", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true })
    .click();
  await expect(page.locator(".merch-product")).toHaveCount(12);
});
test("P04 dependency: login before Add resumes the exact intent once and shares owner cart state", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 1 });
  await merchandise.mockLogin(page);
  await page.goto("/th/souvenirs?q=" + encodeURIComponent("แก้ว Mug"));
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await page
    .getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true })
    .click();
  await expect(page).toHaveURL(/\/th\/login\?redirect=/);
  expect(
    (await merchandise.command<{ cartMutations: number }>("inspect"))
      .cartMutations,
  ).toBe(0);
  await page.getByLabel("อีเมล", { exact: true }).fill("buyer@example.test");
  await page
    .getByLabel("รหัสผ่าน", { exact: true })
    .fill("synthetic-not-a-real-password");
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page).toHaveURL(/\/th\/souvenirs\?q=/);
  await expect(page.locator(".merch-cart-badge")).toHaveText("1");
  await expect(page).not.toHaveURL(/intentId=/);
  await page.reload();
  await expect(page.locator(".merch-cart-badge")).toHaveText("1");
  const data = await merchandise.command<{
    cartMutations: number;
    unitCount: string;
  }>("inspect");
  expect(data.cartMutations).toBe(1);
  expect(data.unitCount).toBe("1");
});

test("unknown Add replays the real committed mutation without another unit, even after closing", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 0 });
  await merchandise.login(page);
  const keys: string[] = [],
    bodies: string[] = [];
  await page.route(
    merchandise.origin + "/api/v1/merchandise/events/PRIS-2026/cart/items",
    async (route) => {
      keys.push(route.request().headers()["idempotency-key"]);
      bodies.push(route.request().postData()!);
      const response = await route.fetch();
      if (keys.length === 1) await route.abort("failed");
      else await route.fulfill({ response });
    },
  );
  await page.goto("/th/souvenirs?q=Mug");
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await page
    .getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true })
    .dblclick();
  await expect(
    page.getByText(
      "ยังยืนยันผลเพิ่มสินค้าลงตะกร้าไม่ได้ กรุณาตรวจสอบอีกครั้ง",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true }),
  ).toBeDisabled();
  await merchandise.command("closeStore");
  await page
    .getByRole("button", { name: "ตรวจสอบอีกครั้ง", exact: true })
    .click();
  await expect(page.locator(".merch-cart-badge")).toHaveText("1");
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
  expect(bodies[0]).toBe(bodies[1]);
  expect(
    (await merchandise.command<{ unitCount: string }>("inspect")).unitCount,
  ).toBe("1");
});
test("closed catalog remains readable with buying disabled and no invented schedule", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 0 });
  await merchandise.command("closeStore");
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  await expect(
    page.getByRole("status").filter({ hasText: "ปิดรับพรีออเดอร์แล้ว" }),
  ).toBeVisible();
  for (const b of await page
    .getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true })
    .all())
    await expect(b).toBeDisabled();
  await expect(page.locator(".merch-primary")).toBeDisabled();
  await expect(page.getByText("กำหนดจัดส่ง", { exact: true })).toHaveCount(0);
});
test("owner replacement hides the previous cart and non-shop pages make no owner reads", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 1 });
  await merchandise.login(page);
  await page.goto("/th/souvenirs?q=Mug");
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await page
    .getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true })
    .click();
  await expect(page.locator(".merch-cart-badge")).toHaveText("1");
  await page.evaluate(
    ({ token }) => {
      localStorage.setItem(
        "pris_user",
        JSON.stringify({
          id: 2,
          firstName: "ผู้ซื้ออื่น",
          lastName: "ทดสอบ",
          email: "other@example.test",
        }),
      );
      localStorage.setItem("pris_token", token);
    },
    { token: merchandise.otherBuyerToken },
  );
  await page.reload();
  await expect(page.locator(".merch-cart-badge")).toHaveText("0");
  const before = await merchandise.command<{ cartReads: number }>("inspect");
  await page.goto("/th/about", { waitUntil: "domcontentloaded" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("header")).toBeVisible();
  expect(
    (await merchandise.command<{ cartReads: number }>("inspect")).cartReads,
  ).toBe(before.cartReads);
});
test("catalog transport failure offers retry without claiming an empty catalog", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 0 });
  const pattern = /\/api\/v1\/merchandise\/events\/PRIS-2026\/products\?/;
  await page.route(pattern, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        success: false,
        code: "MERCH_UNAVAILABLE",
        error: "private diagnostic must not render",
        requestId: "fixture-error",
      }),
    }),
  );
  await page.goto("/th/souvenirs");
  await expect(
    page.locator(".merchandise-host-message").getByRole("alert"),
  ).toHaveText("โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง");
  await expect(
    page.getByText("ยังไม่มีสินค้าที่เปิดแสดง", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("private diagnostic must not render", { exact: true }),
  ).toHaveCount(0);
  await page.unroute(pattern);
  await page
    .getByRole("button", { name: "ลองโหลดอีกครั้ง", exact: true })
    .click();
  await expect(page.locator(".merch-product")).toHaveCount(12);
});
test("cart badge caps the visual number and keeps the full accessible quantity", async ({
  page,
  merchandise,
}) => {
  const catalog = await merchandise.command<{
    products: { id: string; variants: { id: string }[] }[];
  }>("catalog", { banners: 1 });
  const product = catalog.products[0];
  const result = await page.request.post(
    merchandise.origin + "/api/v1/merchandise/events/PRIS-2026/cart/items",
    {
      headers: {
        authorization: `Bearer ${merchandise.buyerToken}`,
        "idempotency-key": "synthetic-badge-count",
      },
      data: {
        productId: product.id,
        variantId: product.variants[0].id,
        bundleSelections: [],
        quantity: 100,
        expectedRevision: 0,
      },
    },
  );
  expect(result.ok()).toBe(true);
  await merchandise.login(page);
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-cart-badge")).toHaveText("99+");
  await expect(
    page.getByRole("button", { name: "ตะกร้า 100 รายการ", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "แบนเนอร์ถัดไป", exact: true }),
  ).toHaveCount(0);
});

for (const failure of ["rejected", "expired"] as const)
  test(`P04 ${failure} session recovery retains the original unknown Add key through reauthentication`, async ({
    page,
    merchandise,
  }) => {
    await merchandise.command("catalog", { banners: 0 });
    await merchandise.login(page);
    await merchandise.mockLogin(page);
    let posts = 0;
    await page.route(
      merchandise.origin + "/api/v1/merchandise/events/PRIS-2026/cart/items",
      async (route) => {
        posts++;
        const response = await route.fetch();
        if (posts === 1) await route.abort("failed");
        else await route.fulfill({ response });
      },
    );
    await page.goto("/th/souvenirs?q=Mug");
    await expect(page.locator(".merch-product")).toHaveCount(1);
    await page
      .getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true })
      .click();
    await expect(
      page.getByText(
        "ยังยืนยันผลเพิ่มสินค้าลงตะกร้าไม่ได้ กรุณาตรวจสอบอีกครั้ง",
        { exact: true },
      ),
    ).toBeVisible();
    const intent = await page.evaluate(
      () =>
        JSON.parse(sessionStorage.getItem("pris_merchandise_intent")!)
          .id as string,
    );
    // The browser still has a JWT-shaped session, while the real fixture rejects
    // its signature. No authentication success is faked at the merchandise routes.
    await page.evaluate(
      ({ token, failure }) => {
        const p = token.split(".");
        if (failure === "expired")
          p[1] = btoa(JSON.stringify({ ...JSON.parse(atob(p[1])), exp: 1 }));
        p[2] = "invalid-local-signature";
        localStorage.setItem("pris_token", p.join("."));
        localStorage.setItem("pris_user", sessionStorage.getItem("pris_user")!);
      },
      { token: merchandise.buyerToken, failure },
    );
    await page.reload();
    if (failure === "rejected") {
      await page
        .getByRole("link", { name: "เข้าสู่ระบบอีกครั้ง", exact: true })
        .click();
      await expect(page).toHaveURL(/reauth=merchandise/);
    }
    await expect(
      page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => JSON.parse(sessionStorage.getItem("pris_merchandise_intent")!).id,
      ),
    ).toBe(intent);
    await page.getByLabel("อีเมล", { exact: true }).fill("buyer@example.test");
    await page
      .getByLabel("รหัสผ่าน", { exact: true })
      .fill("synthetic-not-a-real-password");
    await page
      .getByRole("button", { name: "เข้าสู่ระบบ", exact: true })
      .click();
    await expect(page.locator(".merch-cart-badge")).toHaveText("1");
    // The badge can read the already committed cart before replay finishes.
    await expect.poll(() => posts).toBe(2);
    await expect
      .poll(() =>
        page.evaluate(() => sessionStorage.getItem("pris_merchandise_intent")),
      )
      .toBeNull();
    expect(
      (await merchandise.command<{ unitCount: string }>("inspect")).unitCount,
    ).toBe("1");
  });
