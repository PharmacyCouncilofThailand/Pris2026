import { test, expect } from "./live-fixture";
import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

test("public and authenticated storefront scope requests without duplicate Header cart reads", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 1 });
  const calls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/v1/merchandise/"))
      calls.push(new URL(r.url()).pathname);
  });
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  expect(calls.filter((p) => /\/cart$/.test(p))).toHaveLength(0);
  expect(calls.some((p) => /orders|payment/.test(p))).toBe(false);
  calls.length = 0;
  await merchandise.login(page);
  await page.reload();
  await expect(page.locator(".merch-cart-badge")).toHaveText("0");
  expect(calls.filter((p) => /\/cart$/.test(p))).toHaveLength(1);
  expect(calls.filter((p) => /\/store$/.test(p))).toHaveLength(1);
  calls.length = 0;
  await page.goto("/th/about");
  await expect(page.locator("header")).toBeVisible();
  expect(calls).toEqual([]);
});

test("banner and product assets reserve dimensions, use the approved origin and load only the first banner eagerly", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 3 });
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  const images = await page
    .locator(".merch-banner img,.merch-product img")
    .evaluateAll((elements) =>
      elements.map((e) => {
        const i = e as HTMLImageElement;
        return {
          src: i.src,
          width: i.width,
          height: i.height,
          loading: i.loading,
          banner: !!i.closest(".merch-banner"),
        };
      }),
    );
  expect(images.length).toBeGreaterThan(12);
  for (const image of images) {
    expect(new URL(image.src).origin).toBe(merchandise.origin);
    expect(image.width).toBeGreaterThan(0);
    expect(image.height).toBeGreaterThan(0);
    if (!image.banner) expect(image.loading).toBe("lazy");
  }
  expect(images.filter((i) => i.banner && i.loading !== "lazy")).toHaveLength(
    1,
  );
});

test("measures local browser rendering and current route bytes without inventing a production SLA", async ({
  page,
  merchandise,
}, info) => {
  await merchandise.command("catalog", { banners: 3 });
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const metrics = {
      lcp: null as number | null,
      cls: 0,
      interactionMax: null as number | null,
      supported: PerformanceObserver.supportedEntryTypes,
      shifts: [] as number[],
    };
    Object.assign(window, { __merchMetrics: metrics });
    for (const type of ["largest-contentful-paint", "layout-shift", "event"]) {
      if (!metrics.supported.includes(type)) continue;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const e = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
            interactionId?: number;
          };
          if (type === "largest-contentful-paint") metrics.lcp = e.startTime;
          if (type === "layout-shift" && !e.hadRecentInput) {
            metrics.cls += e.value ?? 0;
            metrics.shifts.push(e.value ?? 0);
          }
          if (type === "event" && e.interactionId)
            metrics.interactionMax = Math.max(
              metrics.interactionMax ?? 0,
              e.duration,
            );
        }
      }).observe({
        type,
        buffered: true,
        ...(type === "event" ? { durationThreshold: 16 } : {}),
      });
    }
  });
  const captures = [];
  for (const path of ["/th/about", "/th/souvenirs"]) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    if (path.endsWith("souvenirs")) {
      await expect(page.locator(".merch-product")).toHaveCount(12);
      await page
        .getByRole("button", { name: "ชุดสินค้า", exact: true })
        .click();
      await expect(page.locator(".merch-product")).toHaveCount(1);
      await page.getByRole("button", { name: "ทั้งหมด", exact: true }).click();
      await expect(page.locator(".merch-product")).toHaveCount(12);
    }
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    captures.push(
      await page.evaluate((path) => {
        const resources = performance.getEntriesByType(
          "resource",
        ) as PerformanceResourceTiming[];
        const scripts = resources.filter((r) => r.initiatorType === "script");
        const fonts = resources.filter((r) => /\.woff2?(\?|$)/.test(r.name));
        return {
          path,
          metrics: (window as Window & { __merchMetrics?: unknown })
            .__merchMetrics,
          scripts: scripts.map((r) => ({
            path: new URL(r.name).pathname,
            encodedBytes: r.encodedBodySize,
            decodedBytes: r.decodedBodySize,
            transferBytes: r.transferSize,
          })),
          fonts: fonts.map((r) => new URL(r.name).pathname),
          navigation: performance
            .getEntriesByType("navigation")
            .map((e) => ({ duration: e.duration })),
        };
      }, path),
    );
  }
  expect(errors).toEqual([]);
  const resources = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((r) => r.name),
  );
  expect(
    resources.some((u) => /fonts\.(googleapis|gstatic)\.com/.test(u)),
  ).toBe(false);
  const fonts = captures[1].fonts;
  expect(new Set(fonts).size).toBe(fonts.length);
  await mkdir("docs/verification/merchandise/performance", { recursive: true });
  await writeFile(
    `docs/verification/merchandise/performance/p12-${info.project.name}.json`,
    JSON.stringify(
      {
        browser: info.project.name,
        viewport: "390x844",
        environment:
          "local production build; synthetic catalogue; no CPU/network throttle",
        interpretation:
          "CLS is observed cumulative non-input layout shift in this bounded run, not a field session-window score. interactionMax is observed Event Timing duration, not field INP. Unsupported/no qualifying entries remain null. Route byte comparison is current incumbent about vs current shop, not a fabricated pre-feature build baseline.",
        captures,
      },
      null,
      2,
    ) + "\n",
  );
});

test("published JavaScript contains no backend merchant credential identifiers or source maps", async ({
  page,
  merchandise,
}) => {
  await merchandise.command("catalog", { banners: 0 });
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product")).toHaveCount(12);
  const files: string[] = [];
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (/\.js(\.map)?$/.test(path)) files.push(path);
    }
  }
  await walk(".next/static");
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    expect(file.endsWith(".map"), file).toBe(false);
    expect(await readFile(file, "utf8"), file).not.toMatch(
      /MERCHANDISE_PAY_SOLUTIONS_(?:AUTH_KEY|API_KEY|SECRET_KEY)|X-Secret-Key|merchantSecretKey/,
    );
  }
});
