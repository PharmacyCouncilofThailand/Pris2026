import { expect, test, type Page, type Route } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const fixture = (name: string) => readFileSync(path.join(__dirname, "fixtures", name));
const PNG = fixture("poster.png");
const PDF = fixture("poster.pdf");
const BROKEN = fixture("broken.pdf");

const R2 = "https://fixture.r2.dev/events/PRIS-2026/presentations";
const png = { url: "/fixture-poster.png", mimeType: "image/png", version: 1 };
const longTitle = "ก".repeat(220);

const item = (trackingId: string, title: string, file: unknown) => ({
  trackingId,
  title,
  submitterName: "ผู้ส่งทดสอบ",
  affiliation: "หน่วยงานทดสอบ",
  categoryName: "RDU",
  presentationType: "poster",
  file,
});

const roster = [
  item("PRIS-2026-P001", "RDU นโยบายเรื่องที่หนึ่ง", png),
  item("PRIS-2026-P002", "RDU นโยบายเรื่องที่สอง", png),
  item("PRIS-2026-P003", "PDFPOSTER งานไฟล์พีดีเอฟ", {
    url: `${R2}/ok.pdf`,
    mimeType: "application/pdf",
    version: 1,
  }),
  item("PRIS-2026-P004", "BROKENPDF งานไฟล์เสีย", {
    url: `${R2}/broken.pdf`,
    mimeType: "application/pdf",
    version: 1,
  }),
  item("PRIS-2026-P005", "NOFILE งานไม่มีไฟล์", null),
  item("PRIS-2026-P006", longTitle, png),
];

const respondRoster = (route: Route, items = roster) =>
  route.fulfill({
    status: 200,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify({ success: true, data: { items } }),
  });

async function stub(page: Page) {
  await page.route("**/api/events/PRIS-2026/poster-kiosk", (route) => respondRoster(route));
  // Only the fixture posters are faked; the logo still goes through the real optimizer.
  await page.route("**/_next/image**", (route) =>
    route.request().url().includes("fixture-poster")
      ? route.fulfill({ status: 200, contentType: "image/png", body: PNG })
      : route.continue(),
  );
  // The proxy fetches R2 server-side, so intercept the same-origin request instead.
  await page.route("**/api/poster-kiosk/file**", (route) => {
    const upstream = new URL(route.request().url()).searchParams.get("url") ?? "";
    return route.fulfill({
      status: 200,
      contentType: "application/pdf",
      body: upstream.endsWith("/broken.pdf") ? BROKEN : PDF,
    });
  });
}

const search = (page: Page) => page.getByRole("searchbox", { name: "ค้นหา Poster" });
const viewer = (page: Page) => page.getByRole("dialog");

test.beforeEach(async ({ page }) => {
  await stub(page);
});

test("kiosk has no site chrome", async ({ page }) => {
  await page.goto("/th/poster-kiosk");
  await expect(search(page)).toBeVisible();
  await expect(page.locator("header")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
});

test("search, view, close returns to an empty idle", async ({ page }) => {
  await page.goto("/th/poster-kiosk");
  await search(page).fill("RDU");
  await expect(page.getByRole("article")).toHaveCount(2);

  await page.getByRole("button", { name: "ดูผลงาน" }).first().click();
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByRole("img", { name: /RDU นโยบายเรื่องที่หนึ่ง/ })).toBeVisible();

  await viewer(page).getByRole("button", { name: "ออกจากหน้านี้" }).click();
  await expect(viewer(page)).toHaveCount(0);
  await expect(search(page)).toHaveValue("");
});

test("pdf poster renders", async ({ page }) => {
  await page.goto("/th/poster-kiosk");
  await search(page).fill("PDFPOSTER");
  await page.getByRole("button", { name: "ดูผลงาน" }).click();
  await expect(viewer(page).getByRole("img", { name: /PDFPOSTER/ })).toHaveAttribute(
    "src",
    /^blob:/,
  );
});

test("broken pdf shows the file error", async ({ page }) => {
  await page.goto("/th/poster-kiosk");
  await search(page).fill("BROKENPDF");
  await page.getByRole("button", { name: "ดูผลงาน" }).click();
  await expect(viewer(page).getByText("เปิดไฟล์ Poster ไม่ได้")).toBeVisible();
  await expect(page.getByText("ไม่มีไฟล์ผลงานในระบบ")).toHaveCount(0);
});

test("no-file and not-listed states", async ({ page }) => {
  await page.goto("/th/poster-kiosk");
  await search(page).fill("NOFILE");
  await expect(page.getByText("ไม่มีไฟล์ผลงานในระบบ")).toBeVisible();
  await expect(page.getByRole("button", { name: "ดูผลงาน" })).toHaveCount(0);

  await search(page).fill("PRIS-2026-O078");
  await expect(page.getByText("ไม่มีในรายชื่อผลงานที่ผ่านการคัดเลือก")).toBeVisible();
});

test("api failure shows retry", async ({ page }) => {
  await page.unroute("**/api/events/PRIS-2026/poster-kiosk");
  await page.route("**/api/events/PRIS-2026/poster-kiosk", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ success: false, code: "POSTER_KIOSK_UNAVAILABLE" }),
    }),
  );
  await page.goto("/th/poster-kiosk");
  await expect(page.getByText("เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่")).toBeVisible();

  await page.unroute("**/api/events/PRIS-2026/poster-kiosk");
  await page.route("**/api/events/PRIS-2026/poster-kiosk", (route) => respondRoster(route));
  await page.getByRole("button", { name: "ลองใหม่" }).click();
  await expect(page.getByText("เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่")).toHaveCount(0);
  await search(page).fill("RDU");
  await expect(page.getByRole("article")).toHaveCount(2);
});

test("idle reset with countdown", async ({ page }) => {
  await page.clock.install();
  await page.goto("/th/poster-kiosk");
  await search(page).fill("RDU");
  await expect(page.getByRole("article")).toHaveCount(2);

  await page.clock.fastForward(49_000);
  await expect(page.getByText(/จะกลับหน้าแรกใน/)).toHaveCount(0);
  await page.clock.fastForward(2_000);
  await expect(page.getByText(/จะกลับหน้าแรกใน/)).toBeVisible();

  await page.clock.fastForward(10_000);
  await expect(search(page)).toHaveValue("");
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("viewer stays open without a countdown", async ({ page }) => {
  await page.setViewportSize({ width: 1080, height: 1920 });
  await page.clock.install();
  await page.goto("/th/poster-kiosk");
  await search(page).fill("RDU");
  await page.getByRole("button", { name: "ดูผลงาน" }).first().click();
  await expect(viewer(page)).toBeVisible();

  await page.clock.fastForward(120_000);
  await expect(viewer(page)).toBeVisible();
  await expect(page.getByText(/จะกลับหน้าแรกใน/)).toHaveCount(0);

  const close = viewer(page).getByRole("button", { name: "ออกจากหน้านี้" });
  await expect(close).toBeVisible();
  const box = (await close.boundingBox())!;
  const vp = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(vp.width / 2);
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height / 2);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
  expect(box.width).toBeLessThanOrEqual(360);
  expect(box.height).toBeLessThanOrEqual(140);
  expect(box.height).toBeGreaterThanOrEqual(64);

  await close.click();
  await expect(viewer(page)).toHaveCount(0);
  await expect(search(page)).toHaveValue("");
});

for (const size of [
  { width: 1080, height: 1920 },
  { width: 768, height: 1366 },
]) {
  test(`idle heading lines each stay on one line at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/th/poster-kiosk");
    const spans = page.getByRole("heading", { level: 1 }).locator("span");
    await expect(spans).toHaveCount(2);
    await expect(spans.nth(0)).toHaveText("ค้นหาผลงาน");
    await expect(spans.nth(1)).toHaveText("Poster ของคุณ");
    for (const i of [0, 1]) {
      const { height, lineHeight } = await spans.nth(i).evaluate((el) => ({
        height: el.getBoundingClientRect().height,
        lineHeight: parseFloat(getComputedStyle(el).lineHeight),
      }));
      expect(height).toBeLessThan(lineHeight * 1.4);
    }
    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    );
    expect(noOverflow).toBe(true);
  });

  test(`search placeholder is not truncated at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/th/poster-kiosk");
    const input = search(page);
    await expect(input).toBeVisible();
    const placeholder = (await input.getAttribute("placeholder"))!;
    const { textWidth, boxWidth } = await input.evaluate((el: HTMLInputElement) => {
      const cs = getComputedStyle(el, "::placeholder");
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const own = getComputedStyle(el);
      return {
        textWidth: ctx.measureText(el.placeholder).width,
        boxWidth: el.clientWidth - parseFloat(own.paddingLeft) - parseFloat(own.paddingRight),
      };
    });
    expect(placeholder.length).toBeGreaterThan(0);
    expect(textWidth).toBeLessThanOrEqual(boxWidth);
  });

  test(`idle content is vertically centred at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/th/poster-kiosk");
    await expect(search(page)).toBeVisible();
    const logo = (await page.locator("main img[src*=\"Logo-Final\"]").boundingBox())!;
    const hint = (await page.getByText("ค้นหาได้จาก Tracking ID").boundingBox())!;
    const centre = (logo.y + hint.y + hint.height) / 2;
    expect(Math.abs(centre - size.height / 2)).toBeLessThan(size.height * 0.1);
  });
}

test("search button uses the static registration gradient", async ({ page }) => {
  await page.goto("/th/poster-kiosk");
  const style = await page.getByRole("button", { name: "ค้นหา", exact: true }).evaluate((el) => {
    const cs = getComputedStyle(el);
    return { image: cs.backgroundImage, animation: cs.animationName };
  });
  expect(style.image).toContain("rgb(0, 85, 255)");
  expect(style.image).toContain("rgb(255, 90, 0)");
  expect(style.animation).toBe("none");
});

test("full-screen poster requests a 2160px q85 variant", async ({ page }) => {
  await page.goto("/th/poster-kiosk");
  await search(page).fill("RDU");
  await page.getByRole("button", { name: "ดูผลงาน" }).first().click();
  const img = viewer(page).getByRole("img", { name: /RDU/ });
  await expect(img).toBeVisible();
  const srcset = (await img.getAttribute("srcset")) ?? "";
  console.log("full srcset:", srcset);
  // Density descriptors (no `sizes`), widest Next image size >= 2160, quality 85.
  expect(srcset).toMatch(/\dx/);
  expect(srcset).not.toMatch(/\d+w/);
  expect(srcset).toMatch(/q=85/);
  const widths = [...srcset.matchAll(/[?&]w=(\d+)/g)].map((m) => Number(m[1]));
  expect(Math.max(...widths)).toBeGreaterThanOrEqual(2160);
});

test("escape closes the viewer and restores focus to the kiosk root", async ({ page }) => {
  await page.goto("/th/poster-kiosk");
  await search(page).fill("RDU");
  await page.getByRole("button", { name: "ดูผลงาน" }).first().click();
  await expect(viewer(page)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(viewer(page)).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.activeElement === document.querySelector("main")))
    .toBe(true);
});

test("long titles do not overflow", async ({ page }) => {
  await page.goto("/th/poster-kiosk");
  await search(page).fill("กกกกกก");
  await expect(page.getByRole("article")).toHaveCount(1);
  const overflows = () =>
    page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  const clamp = () =>
    page.evaluate(() => {
      const el = document.querySelector("article h2") as HTMLElement;
      const lines = Math.round(el.clientHeight / parseFloat(getComputedStyle(el).lineHeight));
      const cta = document.querySelector("article button")!.getBoundingClientRect();
      const card = document.querySelector("article")!.getBoundingClientRect();
      return {
        clamped: el.scrollHeight > el.clientHeight,
        lines,
        ctaInsideCard: cta.bottom <= card.bottom && cta.top >= card.top,
      };
    });
  for (const size of [
    { width: 1080, height: 1920 },
    { width: 768, height: 1366 },
  ]) {
    await page.setViewportSize(size);
    expect(await overflows()).toBe(false);
    const result = await clamp();
    expect(result.clamped).toBe(true);
    expect(result.lines).toBeLessThanOrEqual(4);
    expect(result.ctaInsideCard).toBe(true);
    await expect(page.getByRole("button", { name: "ดูผลงาน" })).toBeVisible();
  }
});

test("idle intro sits between the heading and the search field", async ({ page }) => {
  await page.goto("/th/poster-kiosk");
  const intro = page.getByText("พิมพ์ข้อมูลผลงานเพื่อเปิดดู Poster ของคุณ");
  await expect(intro).toBeVisible();
  for (const size of [
    { width: 1080, height: 1920 },
    { width: 768, height: 1366 },
  ]) {
    await page.setViewportSize(size);
    const i = (await intro.boundingBox())!;
    const s = (await page.getByRole("search").boundingBox())!;
    const h = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
    expect(i.y).toBeGreaterThanOrEqual(h.y + h.height - 1);
    expect(i.y + i.height).toBeLessThanOrEqual(s.y);
  }
});

test("visual capture", async ({ page }) => {
  test.skip(!process.env.POSTER_KIOSK_SHOTS, "set POSTER_KIOSK_SHOTS=1 to capture screenshots");
  await page.goto("/th/poster-kiosk");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: ".impeccable/screenshots/poster-kiosk-idle.png" });
  await search(page).fill("RDU");
  await expect(page.getByRole("article")).toHaveCount(2);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: ".impeccable/screenshots/poster-kiosk-results.png" });
  await page.getByRole("button", { name: "ดูผลงาน" }).first().click();
  await expect(viewer(page).getByRole("img", { name: /RDU/ })).toBeVisible();
  await page.screenshot({ path: ".impeccable/screenshots/poster-kiosk-viewing.png" });
});
