import { test, expect, login } from "./fixtures";
import { makeStore, makeSingle } from "./data";

test("storefront calls the fake store API", async ({ page, fake }) => {
  fake.store = makeStore({ state: "open" });
  fake.products = [makeSingle()];
  await login(page);
  await page.goto("/th/souvenirs");
  await expect
    .poll(() =>
      fake.calls.some(
        (c) => c.method === "GET" && c.path.endsWith("/events/PRIS-2026/store"),
      ),
    )
    .toBe(true);
});
