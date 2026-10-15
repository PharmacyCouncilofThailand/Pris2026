import test from "node:test";
import assert from "node:assert/strict";
import {
  assertFrontendStart,
  requiredApiChecks,
  requiredBoChecks,
} from "../../scripts/merchandise-start-gate.mjs";

function fixture() {
  const common = {
    status: "passed",
    scope: "development",
    unresolved: [],
    contractSha256: "contract",
    specSha256: "spec",
    typesSha256: "types",
    livePaymentsEnabled: false,
    releaseGate: "not_ready",
  };
  return {
    api: {
      ...common,
      gate: "G_API",
      checks: [
        ...requiredApiChecks.map((id) => ({ id, status: "passed" })),
        { id: "A-REAL-PROVIDER", status: "skipped" },
      ],
    },
    backoffice: {
      ...common,
      gate: "G_BO",
      checks: requiredBoChecks.map((id) => ({ id, status: "passed" })),
      artifacts: [{ name: "merchandise-storefront-view", sha256: "renderer" }],
      realProvider: "deferred_to_user_test",
      lint: { status: "approved_baseline_exception", newFindings: 0 },
    },
    rendererSha256: "renderer",
  };
}
test("frontend starts only with all development prerequisites and the verified renderer while live payments remain disabled", () => {
  assert.doesNotThrow(() => assertFrontendStart(fixture()));
});
test("missing, skipped, failed and duplicate development checks block frontend start", () => {
  for (const scope of ["api", "backoffice"] as const) {
    for (const status of ["failed", "skipped"]) {
      const f = fixture();
      f[scope].checks[0].status = status;
      assert.throws(() => assertFrontendStart(f));
    }
    const missing = fixture();
    missing[scope].checks.shift();
    assert.throws(() => assertFrontendStart(missing));
    const duplicate = fixture();
    duplicate[scope].checks.push(duplicate[scope].checks[0]);
    assert.throws(() => assertFrontendStart(duplicate));
  }
});
test("mismatched contracts, specs, types, renderer and unapproved lint debt cannot be accepted", () => {
  for (const field of [
    "contractSha256",
    "specSha256",
    "typesSha256",
  ] as const) {
    const f = fixture();
    f.backoffice[field] = "different";
    assert.throws(() => assertFrontendStart(f));
  }
  const f = fixture();
  f.rendererSha256 = "different";
  assert.throws(() => assertFrontendStart(f));
  const lint = fixture();
  lint.backoffice.lint.status = "unapproved";
  assert.throws(() => assertFrontendStart(lint));
});
test("wrong gate, unresolved work and live-payment claims cannot cross the development gate", () => {
  const wrong = fixture();
  wrong.api.gate = "G_BO";
  assert.throws(() => assertFrontendStart(wrong));
  const unresolved = fixture();
  Object.assign(unresolved.backoffice, { unresolved: ["missing proof"] });
  assert.throws(() => assertFrontendStart(unresolved));
  const live = fixture();
  live.api.livePaymentsEnabled = true;
  assert.throws(() => assertFrontendStart(live));
});
