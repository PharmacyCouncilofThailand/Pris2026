import assert from "node:assert/strict";
import test from "node:test";
import { createRenderCache } from "./posterRenderCache.js";

test("keeps the most recent entries and revokes the evicted one", () => {
  const revoked: string[] = [];
  const cache = createRenderCache(2, (url) => revoked.push(url));
  cache.set("a", "blob:a");
  cache.set("b", "blob:b");
  cache.set("c", "blob:c");
  assert.equal(cache.get("a"), undefined);
  assert.equal(cache.get("b"), "blob:b");
  assert.equal(cache.get("c"), "blob:c");
  assert.deepEqual(revoked, ["blob:a"]);
});

test("get refreshes recency", () => {
  const revoked: string[] = [];
  const cache = createRenderCache(2, (url) => revoked.push(url));
  cache.set("a", "blob:a");
  cache.set("b", "blob:b");
  assert.equal(cache.get("a"), "blob:a");
  cache.set("c", "blob:c");
  assert.equal(cache.get("b"), undefined);
  assert.equal(cache.get("a"), "blob:a");
  assert.deepEqual(revoked, ["blob:b"]);
});

test("replacing a key revokes the old url", () => {
  const revoked: string[] = [];
  const cache = createRenderCache(2, (url) => revoked.push(url));
  cache.set("a", "blob:a1");
  cache.set("a", "blob:a2");
  assert.equal(cache.get("a"), "blob:a2");
  assert.deepEqual(revoked, ["blob:a1"]);
});
