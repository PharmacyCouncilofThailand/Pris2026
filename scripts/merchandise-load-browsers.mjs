import { chromium, firefox, webkit, expect } from "@playwright/test";
import { performance } from "node:perf_hooks";

// Representative browser UI journeys augment the 1,000 API sessions. They do
// not replace physical phones, bank handoff or actual provider acceptance.
export async function prepareLoadBrowsers(ready, observations, progress) {
  const clients = [];
  try {
    for (const [index, [name, engine, width]] of [
      ["chromium", chromium, 390],
      ["firefox", firefox, 834],
      ["webkit", webkit, 1440],
    ].entries()) {
      const browser = await engine.launch();
      const user = ready.buyers[index];
      const context = await browser.newContext({
        baseURL: "http://127.0.0.1:3102",
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      await context.addInitScript(({ token, id, email }) => {
        sessionStorage.setItem("pris_token", token);
        sessionStorage.setItem(
          "pris_user",
          JSON.stringify({
            id,
            email,
            firstName: "ผู้ซื้อหน้าจอ",
            lastName: "ทดสอบ",
            phone: "0812345678",
            role: "general",
          }),
        );
      }, user);
      const page = await context.newPage();
      page.setDefaultTimeout(60000);
      page.setDefaultNavigationTimeout(60000);
      const runtimeErrors = [];
      page.on("pageerror", (e) => runtimeErrors.push(e.message));
      await page.goto("/th/souvenirs");
      await expect(page.locator(".merch-product")).toHaveCount(12);
      clients.push({ browser, page, name, width, runtimeErrors });
    }
  } catch (error) {
    await Promise.all(clients.map((c) => c.browser.close()));
    throw error;
  }
  let stopping = false;
  const sleep = (ms) =>
    new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      wakeups.add(() => {
        clearTimeout(timer);
        resolve();
      });
    });
  const wakeups = new Set();
  const run = async (client) => {
    const { page, name, width, runtimeErrors } = client;
    while (!stopping) {
      const started = performance.now(),
        sampled = progress();
      await page.goto("/th/souvenirs");
      await expect(page.locator(".merch-product")).toHaveCount(12);
      await page
        .getByRole("searchbox", { name: "ค้นหาสินค้า", exact: true })
        .fill("Mug");
      await expect(page.locator(".merch-product")).toHaveCount(1);
      await page
        .getByRole("button", { name: /^ดูรายละเอียด / })
        .last()
        .click();
      await page.getByLabel("จำนวน", { exact: true }).fill("1");
      const add = page.waitForResponse(
        (r) =>
          r.request().method() === "POST" &&
          r.url().endsWith("/cart/items") &&
          r.ok(),
      );
      await page.getByRole("button", { name: /^เพิ่มลงตะกร้า/ }).click();
      await add;
      await expect(page).not.toHaveURL(/intentId=/);
      await page.goto("/th/souvenirs/cart");
      await page.getByRole("button", { name: /^ดำเนินการต่อ/ }).click();
      for (const [label, value] of [
        ["ชื่อ–นามสกุลผู้รับ", `ผู้รับหน้าจอ ${name}`],
        ["เบอร์โทรผู้รับ", "0812345678"],
        ["ที่อยู่", "1 ที่อยู่โหลดสังเคราะห์"],
        ["ตำบล/แขวง", "ทดสอบ"],
        ["อำเภอ/เขต", "ทดสอบ"],
        ["จังหวัด", "กรุงเทพมหานคร"],
        ["รหัสไปรษณีย์", "10100"],
      ])
        await page.getByLabel(label, { exact: true }).fill(value);
      await page
        .getByRole("button", { name: "ตรวจสอบคำสั่งซื้อ", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: /^ยืนยันคำสั่งซื้อ/ }),
      ).toBeEnabled();
      await expect(page.locator("address")).toContainText(
        `ผู้รับหน้าจอ ${name}`,
      );
      await page.goto("/th/souvenirs/orders");
      await expect(
        page.getByRole("heading", { name: "ยังไม่มีคำสั่งซื้อ", exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      expect(runtimeErrors).toEqual([]);
      observations.push({
        browser: name,
        viewportWidth: width,
        version: client.browser.version(),
        durationMs: performance.now() - started,
        start: sampled,
        end: progress(),
        runtimeErrors: runtimeErrors.length,
        journey:
          "catalogue/search/product/Add/cart/address/canonical quote/owner history; no confirmed browser purchase in load",
      });
      if (!stopping) await sleep(15000);
    }
  };
  return {
    start: () => Promise.all(clients.map(run)),
    stop() {
      stopping = true;
      for (const wake of wakeups) wake();
      wakeups.clear();
    },
    close: () => Promise.all(clients.map((c) => c.browser.close())),
  };
}
