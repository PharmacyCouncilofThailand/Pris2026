import assert from "node:assert/strict";
import test from "node:test";
import { getAbstractGateState } from "./registrationGate.js";

test("keeps abstract submission open through final Round 1 instant", () => {
  assert.deepEqual(
    getAbstractGateState(new Date("2026-08-31T16:59:59.999Z")),
    { open: true, phase: "round1" },
  );
});

test("switches directly to Round 2 at Sep 1 Bangkok with no closed gap", () => {
  assert.deepEqual(
    getAbstractGateState(new Date("2026-08-31T17:00:00.000Z")),
    { open: true, phase: "round2" },
  );
});

test("closes at Sep 21 Bangkok exclusive boundary", () => {
  assert.deepEqual(
    getAbstractGateState(new Date("2026-09-20T16:59:59.999Z")),
    { open: true, phase: "round2" },
  );
  assert.deepEqual(
    getAbstractGateState(new Date("2026-09-20T17:00:00.000Z")),
    { open: false, phase: "closed" },
  );
});
