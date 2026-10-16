import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/merchandise",
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.PRIS_MERCHANDISE_TEST_URL ?? "http://127.0.0.1:3102",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
  webServer: process.env.PRIS_MERCHANDISE_TEST_URL
    ? undefined
    : {
        command: "npx next dev --webpack -p 3102 --hostname 127.0.0.1",
        url: "http://127.0.0.1:3102/th/about",
        reuseExistingServer: false,
        timeout: 240000,
        env: {
          // Fake origin: no real server listens here; tests intercept it.
          NEXT_PUBLIC_API_URL: "http://127.0.0.1:3103",
          NEXT_PUBLIC_EVENT_CODE: "PRIS-2026",
        },
      },
});
