import assert from "node:assert/strict";
import test from "node:test";
import { createRenderCache } from "./posterRenderCache.js";

test("keeps the most recent entries and drops the evicted one", () => {
  const cache = createRenderCache<string>(2);
  cache.set("a", "A");
  cache.set("b", "B");
  cache.set("c", "C");
  assert.equal(cache.get("a"), undefined);
  assert.equal(cache.get("b"), "B");
  assert.equal(cache.get("c"), "C");
});

test("get refreshes recency", () => {
  const cache = createRenderCache<string>(2);
  cache.set("a", "A");
  cache.set("b", "B");
  assert.equal(cache.get("a"), "A");
  cache.set("c", "C");
  assert.equal(cache.get("b"), undefined);
  assert.equal(cache.get("a"), "A");
});

test("replacing a key keeps the newest value", () => {
  const cache = createRenderCache<string>(2);
  cache.set("a", "A1");
  cache.set("a", "A2");
  assert.equal(cache.get("a"), "A2");
});

test("a value handed out stays usable after its entry is evicted", async () => {
  const cache = createRenderCache<Blob>(1);
  cache.set("a", new Blob(["poster-a"]));
  const handedOut = cache.get("a") as Blob;
  cache.set("b", new Blob(["poster-b"]));
  assert.equal(cache.get("a"), undefined);
  assert.equal(await handedOut.text(), "poster-a");
});
