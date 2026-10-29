import assert from "node:assert/strict";
import test from "node:test";
import {
  WHEEL_POINTER_ANGLE,
  angleAtPointerAfterRotation,
  buildWheelSectors,
  normalizeAngle,
  rotationForWinningSegment,
  spreadNoPrizeSegments,
} from "./wheelGeometry.js";

function ids(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `segment-${index}`,
  }));
}

for (const count of [1, 2, 6, 17]) {
  test(`wheel geometry uses equal sectors and lands every slot at pointer for ${count} segments`, () => {
    const segments = ids(count);
    const sectors = buildWheelSectors(segments);
    assert.equal(sectors.length, count);
    const expectedSize = 360 / count;
    for (const sector of sectors) {
      assert.ok(
        Math.abs(sector.endAngle - sector.startAngle - expectedSize) < 1e-9,
      );
      const rotation = rotationForWinningSegment(segments, sector.id, 5);
      assert.ok(
        Math.abs(
          angleAtPointerAfterRotation(sector.centerAngle, rotation) -
            WHEEL_POINTER_ANGLE,
        ) < 1e-9,
        sector.id,
      );
    }
  });
}

test("first and last slot use the same start-angle convention", () => {
  const segments = ids(6);
  const sectors = buildWheelSectors(segments);
  assert.equal(sectors[0].startAngle, -90);
  assert.equal(sectors[0].centerAngle, -60);
  assert.equal(sectors[5].endAngle, 270);
  assert.equal(
    normalizeAngle(
      sectors[5].centerAngle +
        rotationForWinningSegment(segments, segments[5].id, 7),
    ),
    WHEEL_POINTER_ANGLE,
  );
});

test("stable ids, not display names, select the winning slot", () => {
  const segments = [
    { id: "a", name: "Same" },
    { id: "b", name: "Same" },
    { id: "c", name: "Different" },
  ];
  const sectors = buildWheelSectors(segments);
  const a = rotationForWinningSegment(segments, "a", 4);
  const b = rotationForWinningSegment(segments, "b", 4);
  assert.notEqual(a, b);
  assert.equal(
    angleAtPointerAfterRotation(sectors[0].centerAngle, a),
    WHEEL_POINTER_ANGLE,
  );
  assert.equal(
    angleAtPointerAfterRotation(sectors[1].centerAngle, b),
    WHEEL_POINTER_ANGLE,
  );
});

test("unknown winner and invalid turns fail closed", () => {
  const segments = ids(2);
  assert.throws(() => rotationForWinningSegment(segments, "missing"));
  assert.throws(() => rotationForWinningSegment(segments, segments[0].id, -1));
});

function kinds(pattern: string) {
  return [...pattern].map((char, index) => ({
    id: `${char}${index}`,
    kind: char === "P" ? ("prize" as const) : ("no_prize" as const),
  }));
}

function layout(segments: ReadonlyArray<{ kind: string }>) {
  return segments.map((s) => (s.kind === "prize" ? "P" : "N")).join("");
}

test("no-prize slots created back to back are spread between prizes", () => {
  assert.equal(layout(spreadNoPrizeSegments(kinds("PPPNNN"))), "PNPNPN");
  assert.equal(layout(spreadNoPrizeSegments(kinds("PPPPNN"))), "PNPPNP");
  assert.equal(layout(spreadNoPrizeSegments(kinds("NNNNPP"))), "NPNNPN");
});

test("spreading keeps each group's order and every segment", () => {
  const segments = kinds("PPPNNPNN");
  const spread = spreadNoPrizeSegments(segments);
  assert.equal(spread.length, segments.length);
  assert.deepEqual(
    spread.filter((s) => s.kind === "prize").map((s) => s.id),
    ["P0", "P1", "P2", "P5"],
  );
  assert.deepEqual(
    spread.filter((s) => s.kind === "no_prize").map((s) => s.id),
    ["N3", "N4", "N6", "N7"],
  );
});

test("a wheel with only one kind keeps its order", () => {
  assert.equal(layout(spreadNoPrizeSegments(kinds("PPP"))), "PPP");
  assert.equal(layout(spreadNoPrizeSegments(kinds("NN"))), "NN");
  assert.deepEqual(spreadNoPrizeSegments([]), []);
});
