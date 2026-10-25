import assert from "node:assert/strict";
import { test } from "node:test";
import { panBy, zoomAt } from "./posterZoom";

const bounds = { width: 1080, height: 1920 };

test("double tap zooms around the tap point", () => {
  const next = zoomAt({ scale: 1, x: 0, y: 0 }, { x: 100, y: 200 }, 2, bounds);
  assert.equal(next.scale, 2);
  // content point under the tap before: (100, 200); after: x*scale + offset
  assert.equal(100 * next.scale + next.x, 100);
  assert.equal(200 * next.scale + next.y, 200);
});

test("scale clamps to 1..3", () => {
  assert.equal(zoomAt({ scale: 1, x: 0, y: 0 }, { x: 540, y: 960 }, 5, bounds).scale, 3);
  const min = zoomAt({ scale: 2, x: -300, y: -500 }, { x: 540, y: 960 }, 0.5, bounds);
  assert.deepEqual(min, { scale: 1, x: 0, y: 0 });
});

test("pan stays inside bounds", () => {
  const state = { scale: 2, x: -200, y: -200 };
  assert.deepEqual(panBy(state, 10000, 10000, bounds), { scale: 2, x: 0, y: 0 });
  assert.deepEqual(panBy(state, -10000, -10000, bounds), {
    scale: 2,
    x: -1080,
    y: -1920,
  });
});
