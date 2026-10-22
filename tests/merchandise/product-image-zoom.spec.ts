import type { Locator } from "@playwright/test";
import { test, expect } from "./fixtures";
import { image, makeSingle } from "./data";

const touch = (identifier: number, clientX: number, clientY: number) => ({
  identifier,
  clientX,
  clientY,
});
async function center(stage: Locator) {
  const box = (await stage.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
async function transform(stage: Locator) {
  return stage.locator("img").evaluate((img) => {
    const matrix = new DOMMatrix(getComputedStyle(img).transform);
    return { scale: matrix.a, x: matrix.e, y: matrix.f };
  });
}

test.beforeEach(async ({ page, context, fake }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await context.route("https://img.example.test/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="1200" height="1200" fill="white"/><circle cx="600" cy="600" r="450" fill="#0055ff"/></svg>',
    }),
  );
  const p = makeSingle({
    images: [image(1), image(2)].map((photo) => ({
      ...photo,
      width: 1200,
      height: 1200,
    })),
  });
  fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  await page.getByRole("button", { name: /ดูรูปขยาย/ }).click();
  await expect(page.getByRole("dialog").locator("img")).toHaveJSProperty(
    "naturalWidth",
    1200,
  );
});

test("two fingers zoom and pan; releasing either finger resets without changing slides", async ({
  page,
}) => {
  const dialog = page.getByRole("dialog");
  const stage = dialog.locator(".merch-lightbox-stage");
  const c = await center(stage);
  await stage.dispatchEvent("touchstart", {
    touches: [touch(1, c.x - 40, c.y), touch(2, c.x + 40, c.y)],
  });
  await stage.dispatchEvent("touchmove", {
    touches: [touch(1, c.x - 120, c.y), touch(2, c.x + 120, c.y)],
  });
  expect((await transform(stage)).scale).toBeCloseTo(3);
  await stage.dispatchEvent("touchmove", {
    touches: [touch(1, c.x - 70, c.y + 30), touch(2, c.x + 170, c.y + 30)],
  });
  expect((await transform(stage)).x).toBeCloseTo(50);
  expect((await transform(stage)).y).toBeCloseTo(30);
  await expect(dialog.getByRole("button", { name: "คืนขนาดรูป" })).toHaveCount(
    0,
  );
  await stage.dispatchEvent("touchmove", {
    touches: [
      touch(1, c.x + 2000, c.y + 2000),
      touch(2, c.x + 2240, c.y + 2000),
    ],
  });
  const geometry = await stage.evaluate((el) => {
    const img = el.querySelector("img")!;
    const matrix = new DOMMatrix(getComputedStyle(img).transform);
    return {
      x: matrix.e,
      y: matrix.f,
      maxX: Math.max(0, (img.offsetWidth * matrix.a - el.clientWidth) / 2),
      maxY: Math.max(0, (img.offsetHeight * matrix.a - el.clientHeight) / 2),
    };
  });
  expect(Math.abs(geometry.x)).toBeLessThanOrEqual(geometry.maxX + 1);
  expect(Math.abs(geometry.y)).toBeLessThanOrEqual(geometry.maxY + 1);
  await stage.dispatchEvent("touchend", {
    touches: [touch(1, c.x + 2000, c.y + 2000)],
    changedTouches: [touch(2, c.x + 2240, c.y + 2000)],
  });
  expect(await transform(stage)).toEqual({ scale: 1, x: 0, y: 0 });
  await stage.dispatchEvent("touchmove", { touches: [touch(1, c.x, c.y)] });
  expect(await transform(stage)).toEqual({ scale: 1, x: 0, y: 0 });
  await stage.dispatchEvent("touchend", {
    changedTouches: [touch(1, c.x, c.y)],
  });
  await stage.dispatchEvent("click");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("status")).toHaveText("1/2");
  expect(await page.evaluate(() => window.visualViewport!.scale)).toBe(1);
});

test("zoom clamps to 1–4, resets between images and after reopening", async ({
  page,
}) => {
  const dialog = page.getByRole("dialog");
  const stage = dialog.locator(".merch-lightbox-stage");
  const c = await center(stage);
  await stage.dispatchEvent("touchstart", {
    touches: [touch(1, c.x - 20, c.y), touch(2, c.x + 20, c.y)],
  });
  await stage.dispatchEvent("touchmove", {
    touches: [touch(1, c.x - 150, c.y), touch(2, c.x + 150, c.y)],
  });
  expect((await transform(stage)).scale).toBe(4);
  await stage.dispatchEvent("touchend", {
    changedTouches: [touch(1, c.x - 150, c.y), touch(2, c.x + 150, c.y)],
  });
  expect((await transform(stage)).scale).toBe(1);
  await stage.dispatchEvent("touchstart", {
    touches: [touch(1, c.x - 50, c.y), touch(2, c.x + 50, c.y)],
  });
  await stage.dispatchEvent("touchmove", {
    touches: [touch(1, c.x - 5, c.y), touch(2, c.x + 5, c.y)],
  });
  await stage.dispatchEvent("touchend", {
    changedTouches: [touch(1, c.x - 5, c.y), touch(2, c.x + 5, c.y)],
  });
  expect((await transform(stage)).scale).toBe(1);
  await expect(dialog.getByRole("status")).toHaveText("1/2");
  await stage.dispatchEvent("touchstart", {
    touches: [touch(1, c.x - 40, c.y), touch(2, c.x + 40, c.y)],
  });
  await stage.dispatchEvent("touchmove", {
    touches: [touch(1, c.x - 80, c.y), touch(2, c.x + 80, c.y)],
  });
  await stage.dispatchEvent("touchcancel");
  expect(await transform(stage)).toEqual({ scale: 1, x: 0, y: 0 });
  await stage.dispatchEvent("touchstart", {
    touches: [touch(1, c.x - 40, c.y), touch(2, c.x + 40, c.y)],
  });
  await stage.dispatchEvent("touchmove", {
    touches: [touch(1, c.x - 80, c.y), touch(2, c.x + 80, c.y)],
  });
  await dialog.getByRole("button", { name: "รูปถัดไป" }).click();
  expect((await transform(stage)).scale).toBe(1);
  await stage.dispatchEvent("touchstart", {
    touches: [touch(1, c.x - 40, c.y), touch(2, c.x + 40, c.y)],
  });
  await stage.dispatchEvent("touchmove", {
    touches: [touch(1, c.x - 80, c.y), touch(2, c.x + 80, c.y)],
  });
  await dialog.getByRole("button", { name: "ปิดรูปขยาย" }).click();
  await page.getByRole("button", { name: /ดูรูปขยาย/ }).click();
  expect((await transform(stage)).scale).toBe(1);
});

test("native Android pinch keeps browser scale fixed", async ({
  page,
  context,
  browserName,
  isMobile,
}) => {
  test.skip(
    browserName !== "chromium" || !isMobile,
    "Native touch dispatch requires mobile Chromium",
  );
  const stage = page.getByRole("dialog").locator(".merch-lightbox-stage");
  const c = await center(stage);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: c.x - 35, y: c.y, id: 1 },
      { x: c.x + 35, y: c.y, id: 2 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: c.x - 100, y: c.y, id: 1 },
      { x: c.x + 100, y: c.y, id: 2 },
    ],
  });
  await expect
    .poll(async () => (await transform(stage)).scale)
    .toBeGreaterThan(2);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect.poll(() => transform(stage)).toEqual({ scale: 1, x: 0, y: 0 });
  expect(await page.evaluate(() => window.visualViewport!.scale)).toBe(1);
  await expect(page.getByRole("dialog")).toBeVisible();
  await cdp.detach();
});
