import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/agenda",
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.PRIS_AGENDA_TEST_URL ?? "http://127.0.0.1:3012",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "android", use: { ...devices["Pixel 7"] } },
    { name: "iphone", use: { ...devices["iPhone 14"] } },
  ],
  webServer: process.env.PRIS_AGENDA_TEST_URL
    ? undefined
    : {
        command: "npx next dev --webpack -p 3012 --hostname 127.0.0.1",
        url: "http://127.0.0.1:3012/th/agenda",
        reuseExistingServer: false,
        timeout: 180000,
      },
});
