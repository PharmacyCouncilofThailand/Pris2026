import assert from "node:assert/strict";
import test from "node:test";
import { loadBooths, loadOwnBoothMembership } from "./booths";
test("directory loads all pages and rejects partial results", async (t) => {
  const calls: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string) => {
    calls.push(url);
    const page = Number(new URL(url).searchParams.get("page"));
    return Response.json({
      success: true,
      booths: [{ id: page, eventId: 1, name: "Booth", type: "premium" }],
      pagination: { totalPages: 2 },
    });
  });
  assert.deepEqual(
    (await loadBooths("http://local.test", "EV TEST")).map((x) => x.id),
    [1, 2],
  );
  assert.ok(calls[0].includes("EV%20TEST"));
  t.mock.method(globalThis, "fetch", async (url: string) =>
    new URL(url).searchParams.get("page") === "1"
      ? Response.json({
          success: true,
          booths: [],
          pagination: { totalPages: 2 },
        })
      : new Response("", { status: 500 }),
  );
  await assert.rejects(loadBooths("http://local.test", "EV"));
});
test("owner lookup is authenticated and rejects forged boolean data", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async (_url: string, options: RequestInit) => {
      assert.equal(
        (options.headers as Record<string, string>).Authorization,
        "Bearer TOKEN",
      );
      assert.equal(options.cache, "no-store");
      return Response.json({ success: true, membership: null });
    },
  );
  assert.equal(
    await loadOwnBoothMembership("http://local.test", "EV", "TOKEN"),
    null,
  );
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({
      success: true,
      membership: {
        userId: 1,
        eventId: 1,
        booth: { id: 1, eventId: 1, name: "Booth", type: "premium" },
        mealCouponEligible: "true",
      },
    }),
  );
  await assert.rejects(
    loadOwnBoothMembership("http://local.test", "EV", "TOKEN"),
  );
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("", { status: 401 }),
  );
  await assert.rejects(
    loadOwnBoothMembership("http://local.test", "EV", "TOKEN"),
    { cause: 401 },
  );
});
