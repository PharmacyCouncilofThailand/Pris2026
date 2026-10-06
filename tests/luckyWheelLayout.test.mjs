// Run against next dev: node tests/luckyWheelLayout.test.mjs
// Use PLAYWRIGHT_MODULE_PATH when Playwright comes from the bundled runtime.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href : "playwright");
const origin = process.env.LUCKY_WHEEL_TEST_URL || "http://localhost:3003";
const messages = Object.fromEntries(["th", "en"].map((locale) => [locale, JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8")).luckyWheel]));
const segments = [
  ["prize", "เสื้อ", "Shirt", 5],
  ["prize", "แก้วน้ำ", "Mug", 0],
  ["no_prize", "ไว้ครั้งหน้า", "Try again", null],
  ["no_prize", "ไว้ครั้งหน้า", "Try again", null],
  ["no_prize", "ไว้ครั้งหน้า", "Try again", null],
  ["prize", "ปากกา", "Pen", 3],
].map(([kind, th, en, remaining], position) => ({
  id: `db-slot-${position}`, kind, name: { th, en }, remaining,
  position, enabled: true, imageKey: null,
}));
const eligibility = {
  eventId: 7, userId: 11, eligible: true, blockCode: null,
  serverNow: "2026-10-06T04:00:00Z", playDate: "2026-10-06",
  configurationVersion: 4, poolRevision: 6, paused: false,
  configuration: { segments }, availability: segments,
  unspentCredits: 2, spendableCredits: 2, hasExpiredPriorDayCredit: false,
  currentWindow: { id: "window-1", date: "2026-10-06", startAt: "2026-10-06T01:00:00Z", endAt: "2026-10-06T16:00:00Z", version: 3 },
  latestSpin: { id: "previous-spin", segmentId: segments[0].id, outcomeKind: "prize", awardedName: segments[0].name, configurationVersion: 4 }, requestId: "ui-test",
};
const proof = {
  spinId: "11111111-1111-4111-8111-111111111111", eventId: 7,
  owner: { id: 11, firstName: "ผู้ทดสอบ", lastName: "ระบบรางวัล", email: "ui@example.test" },
  prize: { name: { th: "หมอน", en: "pillow" }, imageKey: null, awardedAt: "2026-10-05T21:30:00Z" },
  status: "open", rewardProof: { qrPayload: "UI-TEST-PROOF", displayCode: "UI-TEST-1234" },
};
const screenshots = process.env.LUCKY_WHEEL_SCREENSHOT_DIR;
if (screenshots) mkdirSync(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  await context.addInitScript(() => {
    localStorage.setItem("pris_user", JSON.stringify({ id: 11, firstName: "UI", lastName: "Test" }));
    localStorage.setItem("pris_token", `test.${btoa(JSON.stringify({ exp: 4102444800 }))}.test`);
  });
  let spins = 0;
  await context.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const headers = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,OPTIONS" };
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    let body;
    if (url.pathname === "/api/payments/my-tickets") {
      body = { success: true, data: [{ registrationId: 1, eventId: 7, eventCode: "PRIS-2026", status: "confirmed", regCode: "UI-TEST", ticketName: "Conference" }] };
    } else if (url.pathname.endsWith("/eligibility")) {
      body = eligibility;
    } else if (url.pathname.endsWith(`/spins/${proof.spinId}`)) {
      body = proof;
    } else if (url.pathname.endsWith("/spins") && request.method() === "POST") {
      const payload = request.postDataJSON();
      assert.equal(payload.configurationVersion, 4);
      assert.equal(payload.poolRevision, 6);
      assert.equal(payload.scheduleVersion, 3);
      spins++;
      body = { spin: { id: "spin-ui-test", segmentId: segments[0].id, outcomeKind: "prize", awardedName: segments[0].name, configurationVersion: 4 } };
      eligibility.latestSpin = body.spin;
      eligibility.unspentCredits--;
      eligibility.spendableCredits--;
    } else {
      throw new Error(`Unexpected API call: ${request.method()} ${url.pathname}`);
    }
    await route.fulfill({ headers, contentType: "application/json", body: JSON.stringify(body) });
  });

  for (const [locale, width] of [["th", 320], ["th", 390], ["th", 948], ["en", 390], ["en", 1440]]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${origin}/${locale}/lucky-wheel`);
    await page.getByRole("heading", { name: messages[locale].wheelHeading, exact: true }).waitFor();
    assert.equal(await page.getByText(messages[locale].prizeWon, { exact: true }).count(), 0, "Previous server result must not appear on entry");
    await page.getByRole("button", { name: locale === "th" ? "หมุนวงล้อ" : "Spin the wheel", exact: true }).waitFor();
    assert.ok(await page.locator('header img[alt="Pris 2026 Logo"]').first().isVisible());
    if (width < 1280) assert.ok(await page.getByRole("button", { name: "Toggle mobile menu" }).isVisible());
    assert.equal(await page.locator("foreignObject").count(), segments.length);
    assert.ok((await page.locator('svg[role=img] > g > path').evaluateAll((paths) => paths.map((path) => path.getAttribute("fill")))).every((fill) => fill === "#fff"), "All wheel segments must be white");
    assert.equal(await page.locator("article > div[aria-hidden=true]").evaluate((seam) => getComputedStyle(seam).position), "relative");
    assert.deepEqual(await page.locator("foreignObject > div > span:first-child").allTextContents(), segments.map((segment) => segment.name[locale]));
    assert.equal(await page.locator("section[aria-labelledby=wheel-availability] li").count(), 3);
    assert.ok(await page.locator("section[aria-labelledby=wheel-availability]").getByText(locale === "th" ? "หมดแล้ว" : "Sold out", { exact: true }).isVisible());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Overflow at ${width}px / ${locale}`);
    await page.getByText(messages[locale].playRules, { exact: true }).click();
    assert.ok(await page.locator("details[open]").isVisible());
    await page.getByText(messages[locale].playRules, { exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    if (screenshots) await page.screenshot({ path: join(screenshots, `${locale}-${width}.png`), fullPage: true });
    await page.close();
  }
  const page = await context.newPage();
  await page.goto(`${origin}/th/lucky-wheel`);
  await page.getByRole("button", { name: "หมุนวงล้อ", exact: true }).click();
  await page.getByText("เสื้อ", { exact: true }).first().waitFor();
  await page.getByRole("link", { name: messages.th.viewProof }).waitFor();
  assert.equal(spins, 1);
  assert.ok(await page.getByText(messages.th.prizeWon, { exact: true }).isVisible(), "Current result must survive the eligibility refresh after animation");
  assert.ok((await page.locator('svg[role=img] > g > path').evaluateAll((paths) => paths.map((path) => path.getAttribute("fill")))).every((fill) => fill === "#fff"));
  eligibility.unspentCredits++;
  eligibility.spendableCredits++;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page.getByRole("link", { name: messages.th.viewProof }).waitFor({ state: "hidden" });
  await page.getByRole("button", { name: messages.th.spin, exact: true }).waitFor();
  await page.reload();
  await page.getByRole("button", { name: messages.th.spin, exact: true }).waitFor();
  assert.equal(await page.getByText(messages.th.prizeWon, { exact: true }).count(), 0, "Reload must not restore the previous result");
  assert.ok(eligibility.latestSpin, "Dismissing the UI must preserve the server's reward record");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: messages.th.spin, exact: true }).click();
  await page.getByText(messages.th.spinning, { exact: true }).waitFor();
  await page.getByRole("link", { name: messages.th.viewProof }).waitFor();
  assert.equal(spins, 2, "Both reduced-motion and animated spins must display their committed result");
  await page.close();

  eligibility.eligible = false;
  eligibility.blockCode = "NO_CREDIT";
  eligibility.spendableCredits = 0;
  eligibility.latestSpin = null;
  eligibility.availability = Array.from({ length: 17 }, (_, position) => ({ ...segments[position % segments.length], id: `db-dense-${position}`, position }));
  eligibility.availability[0].enabled = false;
  const blocked = await context.newPage();
  await blocked.setViewportSize({ width: 320, height: 1000 });
  await blocked.goto(`${origin}/th/lucky-wheel`);
  await blocked.getByText(messages.th.noCredit, { exact: true }).first().waitFor();
  assert.equal(await blocked.getByRole("button", { name: messages.th.spin, exact: true }).count(), 0);
  assert.equal(await blocked.locator("foreignObject").count(), 17);
  assert.ok(await blocked.locator("section[aria-labelledby=wheel-availability]").getByText(messages.th.unavailableSegment, { exact: true }).isVisible());
  assert.ok(await blocked.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await blocked.getByRole("button", { name: "EN", exact: true }).click();
  await blocked.waitForURL("**/en/lucky-wheel");
  await blocked.getByRole("heading", { name: messages.en.wheelHeading, exact: true }).waitFor();

  for (const [locale, width] of [["th", 320], ["th", 390], ["th", 1440], ["en", 390]]) {
    const reward = await context.newPage();
    await reward.setViewportSize({ width, height: 1000 });
    await reward.goto(`${origin}/${locale}/lucky-wheel/rewards/${proof.spinId}`);
    await reward.getByRole("heading", { name: messages[locale].rewardProofTitle, exact: true }).waitFor();
    const row = reward.locator("article > section:first-child > div");
    const seam = reward.locator("article > div[aria-hidden=true]");
    assert.equal(await seam.evaluate((node) => getComputedStyle(node).position), "relative");
    assert.equal(await seam.evaluate((node) => getComputedStyle(node).height), "24px");
    assert.equal(await seam.evaluate((node) => getComputedStyle(node).borderTopWidth), "0px", "Ticket must have one perforation, not two dashed borders");
    assert.equal(await reward.locator("article").evaluate((node) => getComputedStyle(node).filter), "none");
    const image = await row.locator(":scope > div").nth(0).boundingBox();
    const information = await row.locator(":scope > div").nth(1).boundingBox();
    assert.ok(image && information);
    assert.ok(image.x + image.width <= information.x, `Reward image must stay left of information at ${width}px`);
    assert.ok(Math.abs(image.y + image.height / 2 - information.y - information.height / 2) < 1);
    assert.equal(await row.locator(":scope > div").nth(1).evaluate((node) => getComputedStyle(node).textAlign), "left");
    assert.ok(await reward.getByRole("img", { name: messages[locale].qrAlt }).isVisible());
    assert.ok(await reward.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    if (screenshots) await reward.screenshot({ path: join(screenshots, `reward-${locale}-${width}.png`), fullPage: true });
    await reward.close();
  }
  console.log("Lucky Wheel UI: white segments, shared ticket frame, current-spin-only results, credit refresh/reload, TH/EN and 320–1440px passed.");
} finally {
  await browser.close();
}
