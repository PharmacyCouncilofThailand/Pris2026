import { test as base, expect, type Page } from "@playwright/test";
import { FakeMerchApi } from "./fakeApi";

const API_ORIGIN =
  process.env.MERCHANDISE_TEST_API_ORIGIN ?? "http://127.0.0.1:3103";

export const test = base.extend<{ apiOrigin: string; fake: FakeMerchApi }>({
  apiOrigin: [API_ORIGIN, { option: true }],
  fake: async ({ context, apiOrigin }, provide) => {
    const fake = new FakeMerchApi();
    await fake.install(context, apiOrigin);
    await provide(fake);
  },
});
export { expect };

const enc = (v: object) => Buffer.from(JSON.stringify(v)).toString("base64url");

export async function login(page: Page, opts: { id?: number } = {}) {
  const id = opts.id ?? 11;
  const user = {
    id,
    firstName: "ผู้ซื้อ",
    lastName: "สังเคราะห์",
    email: "buyer@example.test",
    role: "general",
  };
  const token = `${enc({ alg: "HS256", typ: "JWT" })}.${enc({ id, exp: Math.floor(Date.now() / 1000) + 3600 })}.c3ludGhldGljLXNpZw`;
  await page.addInitScript(
    ([u, t]) => {
      localStorage.setItem("pris_user", u);
      localStorage.setItem("pris_token", t);
    },
    [JSON.stringify(user), token],
  );
}
