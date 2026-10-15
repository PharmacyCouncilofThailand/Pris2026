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
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: process.env.PRIS_MERCHANDISE_TEST_URL
    ? undefined
    : {
        command: "npx next dev --webpack -p 3102 --hostname 127.0.0.1",
        url: "http://127.0.0.1:3102/th/about",
        reuseExistingServer: false,
        timeout: 120000,
        env: {
          NEXT_PUBLIC_API_URL:
            process.env.MERCHANDISE_TEST_API_ORIGIN ?? "http://127.0.0.1:3103",
          NEXT_PUBLIC_EVENT_CODE: "PRIS-2026",
        },
      },
});
