import { test as base, expect } from "@playwright/test";
export const test = base.extend<{ apiOrigin: string }>({
  apiOrigin: [
    process.env.MERCHANDISE_TEST_API_ORIGIN ?? "http://127.0.0.1:3103",
    { option: true },
  ],
});
export { expect };
