import { test, expect } from "./fixtures";
test("frontend review uses its dedicated port and preserves the incumbent public about route", async ({
  page,
  baseURL,
  apiOrigin,
}) => {
  expect(new URL(baseURL!).port).toBe("3102");
  expect(apiOrigin).not.toBe(baseURL);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/th/about");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  expect(errors).toEqual([]);
});
