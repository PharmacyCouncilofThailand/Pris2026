import { test, expect } from "./fixtures";
import { image, makeSingle, makeSizeImagesProduct, stubImages } from "./data";

test("one frame navigates images without changing purchase quantity", async ({
  page,
  context,
  fake,
}) => {
  await stubImages(context);
  const p = makeSingle({ images: [image(1), image(2), image(3)] });
  fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  const gallery = page.locator(".merch-detail-gallery");
  const next = gallery.getByRole("button", { name: "รูปถัดไป" });
  const previous = gallery.getByRole("button", { name: "รูปก่อนหน้า" });
  await expect(gallery.locator("figure img")).toHaveCount(1);
  await expect(previous).toBeDisabled();
  await expect(gallery.getByRole("status")).toHaveText("1/3");
  await page.getByLabel("จำนวน", { exact: true }).fill("4");
  await next.click();
  await expect(gallery.locator("img")).toHaveAttribute("src", /2\.png/);
  await expect(gallery.getByRole("status")).toHaveText("2/3");
  await next.click();
  await expect(next).toBeDisabled();
  await expect(gallery.getByRole("status")).toHaveText("3/3");
  await previous.focus();
  await page.keyboard.press("Enter");
  await expect(gallery.getByRole("status")).toHaveText("2/3");
  await expect(page.getByLabel("จำนวน", { exact: true })).toHaveValue("4");
  await expect(gallery.locator("figcaption")).toHaveText("พรีออเดอร์");
});

for (const width of [390, 820, 1440]) {
  test(`gallery fits ${width}px and handles horizontal gestures only`, async ({
    page,
    context,
    fake,
  }) => {
    await page.setViewportSize({ width, height: 1180 });
    await stubImages(context);
    const p = makeSingle({
      images: [image(1), { ...image(2), width: 300, height: 900 }],
    });
    fake.products = [p];
    await page.goto(`/th/souvenirs/products/${p.id}`);
    const gallery = page.locator(".merch-detail-gallery");
    const frame = gallery.locator("figure");
    await expect(gallery.getByRole("status")).toHaveText("1/2");
    const before = (await frame.boundingBox())!;
    expect(Math.abs(before.width - before.height)).toBeLessThan(2);
    await frame.dispatchEvent("touchstart", {
      touches: [{ identifier: 0, clientX: 250, clientY: 200 }],
    });
    await frame.dispatchEvent("touchend", {
      changedTouches: [{ identifier: 0, clientX: 100, clientY: 210 }],
    });
    await expect(gallery.getByRole("status")).toHaveText("2/2");
    const after = (await frame.boundingBox())!;
    expect(after.height).toBeCloseTo(before.height, 0);
    await frame.dispatchEvent("touchstart", {
      touches: [{ identifier: 0, clientX: 100, clientY: 100 }],
    });
    await frame.dispatchEvent("touchend", {
      changedTouches: [{ identifier: 0, clientX: 120, clientY: 300 }],
    });
    await expect(gallery.getByRole("status")).toHaveText("2/2");
    await frame.dispatchEvent("touchstart", {
      touches: [{ identifier: 0, clientX: 100, clientY: 200 }],
    });
    await frame.dispatchEvent("touchend", {
      changedTouches: [{ identifier: 0, clientX: 250, clientY: 210 }],
    });
    await expect(gallery.getByRole("status")).toHaveText("1/2");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/product-gallery-${width}.png`,
      fullPage: true,
    });
  });
}

test("choosing a size resets the frame to its photo", async ({
  page,
  context,
  fake,
}) => {
  await stubImages(context);
  const p = makeSizeImagesProduct();
  fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  const gallery = page.locator(".merch-detail-gallery");
  await gallery.getByRole("button", { name: "รูปถัดไป" }).click();
  await page.getByRole("button", { name: "46Oz", exact: true }).click();
  await expect(gallery.getByRole("status")).toHaveText(`1/${p.images.length}`);
  await expect(gallery.locator("img")).toHaveAttribute("src", /912/);
});

for (const state of ["single", "empty", "failed"] as const) {
  test(`${state} gallery hides navigation`, async ({ page, context, fake }) => {
    await stubImages(context);
    if (state === "failed") {
      await context.route("https://img.example.test/1.png", (route) =>
        route.fulfill({ status: 404 }),
      );
    }
    const p = makeSingle({ images: state === "empty" ? [] : [image(1)] });
    fake.products = [p];
    await page.goto(`/th/souvenirs/products/${p.id}`);
    const gallery = page.locator(".merch-detail-gallery");
    if (state === "single") await expect(gallery.locator("img")).toBeVisible();
    else
      await expect(gallery.locator(".merch-image-placeholder")).toBeVisible();
    await expect(
      gallery.getByRole("button", { name: /รูปก่อนหน้า|รูปถัดไป/ }),
    ).toHaveCount(0);
    await expect(gallery.getByRole("status")).toHaveCount(0);
  });
}

test("a failed last slide leaves a valid single image", async ({
  page,
  context,
  fake,
}) => {
  await stubImages(context);
  await context.route("https://img.example.test/2.png", (route) =>
    route.fulfill({ status: 404 }),
  );
  const p = makeSingle({ images: [image(1), image(2)] });
  fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  const gallery = page.locator(".merch-detail-gallery");
  await gallery.getByRole("button", { name: "รูปถัดไป" }).click();
  await expect(gallery.locator("img")).toHaveAttribute("src", /1\.png/);
  await expect(
    gallery.getByRole("button", { name: /รูปก่อนหน้า|รูปถัดไป/ }),
  ).toHaveCount(0);
});
