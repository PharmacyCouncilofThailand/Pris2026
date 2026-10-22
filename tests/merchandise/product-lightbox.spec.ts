import { test, expect } from "./fixtures";
import { image, makeSingle, stubImages } from "./data";

test("viewer opens current photo, navigates, traps focus, and restores the gallery", async ({
  page,
  context,
  fake,
}) => {
  await stubImages(context);
  const p = makeSingle({ images: [image(1), image(2), image(3)] });
  fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  await page.getByLabel("จำนวน", { exact: true }).fill("4");
  const gallery = page.locator(".merch-detail-gallery");
  await gallery.getByRole("button", { name: "รูปถัดไป" }).click();
  const trigger = gallery.getByRole("button", {
    name: `ดูรูปขยาย ${p.nameTh}`,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: p.nameTh });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("src", /2\.png/);
  await dialog.locator("img").click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "รูปถัดไป" }).click();
  await expect(dialog.getByRole("status")).toHaveText("3/3");
  await expect(dialog.getByRole("button", { name: "รูปถัดไป" })).toBeDisabled();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(gallery.getByRole("status")).toHaveText("3/3");
  await expect(page.getByLabel("จำนวน", { exact: true })).toHaveValue("4");
  await trigger.click();
  await dialog.getByRole("button", { name: "ปิดรูปขยาย" }).click();
  await expect(dialog).toHaveCount(0);
  await trigger.click();
  await page
    .locator(".merch-lightbox-backdrop")
    .click({ position: { x: 2, y: 2 } });
  await expect(dialog).toHaveCount(0);
});

for (const width of [390, 820, 1440]) {
  test(`viewer image fits ${width}px and swipes without dismissal`, async ({
    page,
    context,
    fake,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await stubImages(context);
    await context.route("https://img.example.test/2.png", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="900"><rect width="300" height="900" fill="#fff"/><rect x="20" y="20" width="260" height="860" rx="28" fill="#0055ff"/></svg>',
      }),
    );
    const p = makeSingle({
      images: [image(1), { ...image(2), width: 300, height: 900 }],
    });
    fake.products = [p];
    await page.goto(`/th/souvenirs/products/${p.id}`);
    await page.getByRole("button", { name: `ดูรูปขยาย ${p.nameTh}` }).click();
    const dialog = page.getByRole("dialog");
    const stage = dialog.locator(".merch-lightbox-stage");
    await stage.dispatchEvent("touchstart", {
      touches: [{ identifier: 0, clientX: 250, clientY: 200 }],
    });
    await stage.dispatchEvent("touchend", {
      changedTouches: [{ identifier: 0, clientX: 100, clientY: 210 }],
    });
    await stage.dispatchEvent("click");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("status")).toHaveText("2/2");
    await expect(dialog.locator("img")).toHaveJSProperty("naturalHeight", 900);
    const bounds = (await stage.boundingBox())!;
    const photo = (await dialog.locator("img").boundingBox())!;
    expect(photo.width).toBeLessThanOrEqual(bounds.width + 1);
    expect(photo.height).toBeLessThanOrEqual(bounds.height + 1);
    expect(photo.height).toBeGreaterThan(bounds.height * 0.8);
    expect(photo.height / photo.width).toBeCloseTo(3, 1);
    expect(photo.y).toBeGreaterThanOrEqual(bounds.y - 1);
    expect(photo.y + photo.height).toBeLessThanOrEqual(844);
    await page.screenshot({
      path: `test-results/product-lightbox-${width}.png`,
    });
    await dialog.getByRole("button", { name: "ปิดรูปขยาย" }).click();
    const frame = page.locator(".merch-detail-gallery figure");
    await frame.dispatchEvent("touchstart", {
      touches: [{ identifier: 0, clientX: 100, clientY: 200 }],
    });
    await frame.dispatchEvent("touchend", {
      changedTouches: [{ identifier: 0, clientX: 250, clientY: 210 }],
    });
    await frame
      .getByRole("button", { name: /ดูรูปขยาย/ })
      .dispatchEvent("click");
    await expect(dialog).toHaveCount(0);
  });
}

test("single photo viewer hides navigation and failed images have no viewer trigger", async ({
  page,
  context,
  fake,
}) => {
  await stubImages(context);
  const p = makeSingle({ images: [image(1)] });
  fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  await page.getByRole("button", { name: /ดูรูปขยาย/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button")).toHaveCount(1);
  await expect(dialog.getByRole("status")).toHaveCount(0);
  await dialog.locator("img").dispatchEvent("error");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.locator(".merch-detail-gallery .merch-image-placeholder"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /ดูรูปขยาย/ })).toHaveCount(0);
});
