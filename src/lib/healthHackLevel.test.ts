import assert from "node:assert/strict";
import test from "node:test";
import { getHealthHackLevel } from "./healthHackLevel.js";

test("HealthHack level requires a matching secondary grade but no undergraduate grade", () => {
  for (const grade of ["m1", "m2", "m3"])
    assert.equal(getHealthHackLevel("lower", grade), grade);
  for (const grade of ["m4", "m5", "m6"])
    assert.equal(getHealthHackLevel("upper", grade), grade);
  for (const grade of ["", "m1", "m6"])
    assert.equal(getHealthHackLevel("undergraduate", grade), "undergraduate");
  assert.equal(getHealthHackLevel("", "m1"), "");
  assert.equal(getHealthHackLevel("lower", ""), "");
  assert.equal(getHealthHackLevel("upper", ""), "");
  assert.equal(getHealthHackLevel("lower", "m4"), "");
  assert.equal(getHealthHackLevel("upper", "m3"), "");
  assert.equal(getHealthHackLevel("upper", "m7"), "");
});
