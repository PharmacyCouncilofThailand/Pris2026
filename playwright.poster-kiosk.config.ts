import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/poster-kiosk",
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
    baseURL: process.env.PRIS_POSTER_KIOSK_TEST_URL ?? "http://127.0.0.1:3104",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "kiosk",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1080, height: 1920 } },
    },
  ],
  webServer: process.env.PRIS_POSTER_KIOSK_TEST_URL
    ? undefined
    : {
        command: "npx next dev --webpack -p 3104 --hostname 127.0.0.1",
        url: "http://127.0.0.1:3104/th/poster-kiosk",
        reuseExistingServer: false,
        timeout: 240000,
        env: {
          // Fake origin: no real server listens here; tests intercept it.
          NEXT_PUBLIC_API_URL: "http://127.0.0.1:3105",
          NEXT_PUBLIC_EVENT_CODE: "PRIS-2026",
        },
      },
});
