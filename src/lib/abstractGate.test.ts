import assert from "node:assert/strict";
import test from "node:test";
import { getAbstractGateState } from "./registrationGate.js";

test("closes immediately when ABSTRACT_OPEN is false", () => {
  assert.deepEqual(
    getAbstractGateState(),
    { open: false, phase: "closed" },
  );
});

test("keeps abstract submission open through final Round 1 instant when open", () => {
  assert.deepEqual(
    getAbstractGateState(new Date("2026-08-31T16:59:59.999Z"), true),
    { open: true, phase: "round1" },
  );
});

test("switches directly to Round 2 at Sep 1 Bangkok with no closed gap when open", () => {
  assert.deepEqual(
    getAbstractGateState(new Date("2026-08-31T17:00:00.000Z"), true),
    { open: true, phase: "round2" },
  );
});

test("closes at Sep 21 Bangkok exclusive boundary when open", () => {
  assert.deepEqual(
    getAbstractGateState(new Date("2026-09-20T16:59:59.999Z"), true),
    { open: true, phase: "round2" },
  );
  assert.deepEqual(
    getAbstractGateState(new Date("2026-09-20T17:00:00.000Z"), true),
    { open: false, phase: "closed" },
  );
});
