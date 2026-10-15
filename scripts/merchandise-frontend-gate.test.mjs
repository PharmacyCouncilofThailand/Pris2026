import test from "node:test";
import assert from "node:assert/strict";
import { digest } from "./merchandise-start-gate.mjs";
import {
  assertFrontendCompletion,
  assertFinalBrowserResult,
  assertIntegratedLoad,
  readOwnedProof,
  requiredChecks,
  requiredDevelopmentChecks,
  releaseConditions,
} from "./merchandise-frontend-gate.mjs";

function fixture() {
  const files = new Map(),
    put = (path, value) =>
      files.set(
        path,
        Buffer.from(typeof value === "string" ? value : JSON.stringify(value)),
      );
  const browser = {
    stats: { expected: 339, unexpected: 0, skipped: 0, flaky: 0 },
    errors: [],
    config: {
      projects: ["chromium", "firefox", "webkit"].map((name) => ({
        name,
        retries: 0,
      })),
    },
    suites: [
      {
        specs: [
          {
            tests: Array.from({ length: 339 }, () => ({
              expectedStatus: "passed",
              status: "expected",
              results: [{ status: "passed", retry: 0 }],
            })),
          },
        ],
      },
    ],
  };
  const load = {
    kind: "integrated_full",
    status: "passed",
    fixtureOnly: true,
    configuredStoreSessions: 1000,
    peakActiveSessions: 1000,
    observedUniqueAccounts: 1050,
    systemErrors: 0,
    workerErrors: 0,
    failedJourneys: 0,
    legacyBefore: { payments: 0 },
    legacyAfter: { payments: 0 },
    workload: { rampSeconds: 300, steadySeconds: 1200, cooldownSeconds: 300 },
    timeSeries: Array.from({ length: 38 }, (_, i) => ({
      seconds: 330 + i * 30,
      activeSessions: 1000,
      observedStoreAccounts: 1000,
    })),
    frontend: {
      additionalOwners: 3,
      representativeBrowsers: 3,
      observations: ["chromium", "firefox", "webkit"].map((browser) => ({
        browser,
        runtimeErrors: 0,
        start: {
          phase: "steady",
          sample: { activeSessions: 1000, observedStoreAccounts: 1000 },
        },
      })),
    },
    requests: 100,
    exportsCompleted: 1,
    bulkCompleted: 1,
    health: {
      queue: 0,
      unmatchedReferences: 0,
      lagMs: 0,
      claimed: 0,
      queuedEmails: 0,
      stuckCreation: 1,
      unknownSend: 2,
    },
    providerCalls: { create: 37 },
    injectedMailUnknown: 1,
    injectedCommitFailures: 1,
    actualProviderEvidence: "deferred_to_user_test",
  };
  const summary = Object.fromEntries(
    ["units", "types", "lint", "gateUnits", "build"].map((name) => [
      name,
      { exitCode: 0, log: `logs/${name}.txt` },
    ]),
  );
  put("logs/units.txt", "pass 153\nfail 0\nskipped 0\n");
  put("logs/types.txt", "");
  put("logs/gateUnits.txt", "pass 10\nfail 0\nskipped 0\n");
  put("logs/build.txt", "Compiled successfully");
  put("logs/lint.txt", {
    status: "baseline_only",
    newFindings: 0,
    errors: 23,
    warnings: 6,
    files: 23,
  });
  put("proof/summary.json", summary);
  put("proof/browser.json", browser);
  put("proof/load.json", load);
  put("logs/browser.txt", "339 passed");
  put("proof/browser-command.json", {
    exitCode: 0,
    command: "npx playwright test -c playwright.merchandise.final.config.ts",
    log: "logs/browser.txt",
  });
  put("proof/approval.json", {
    status: "approved_by_user",
    approvedBy: "user",
    approvalSource: {
      kind: "direct_human_reply_in_this_chat",
      answer: "ยืนยัน P03 ทุกภาพ",
    },
  });
  put(
    "proof/check.md",
    "Actual evidence fixture for verifier unit tests, not acceptance evidence.",
  );
  put("src/fixture.ts", "export const fixture = true;\n");
  put("proof/ledger.json", {
    executionMode: "this_chat_sequential_no_subagents",
    tasks: Array.from({ length: 14 }, (_, index) => ({
      id: `P${String(index + 1).padStart(2, "0")}`,
      status: index < 12 ? "passed" : "passed_development",
      commit: index < 13 ? "a".repeat(40) : null,
    })),
  });
  const artifact = (path) => ({
    path,
    format: "bytes",
    sha256: digest(files.get(path)),
    ...(files.get(path).length === 0 ? { allowEmpty: true } : {}),
  });
  const record = {
    gate: "G_PRIS",
    status: "passed",
    scope: "development",
    releaseGate: "not_ready",
    livePaymentsEnabled: false,
    realProvider: "deferred_to_user_test",
    unresolved: [],
    sourceCommit: "a".repeat(40),
    requiredDevelopmentChecks,
    deferredRelease: releaseConditions.map((id) => ({
      id,
      status: "deferred_to_user_test",
    })),
    database: {
      name: "pris_merchandise_dev_test",
      deletion: "explicit_user_instruction_only",
    },
    checks: requiredChecks.map((id) => ({
      id,
      status: id === "P-DEVICE" ? "deferred_to_user_test" : "passed",
      scope: id === "P-DEVICE" ? "release" : "development",
      evidencePath: "proof/check.md",
    })),
    artifacts: [...files.keys()]
      .filter((p) => p !== "src/fixture.ts")
      .map(artifact),
    sourceInputs: [artifact("src/fixture.ts")],
    verification: {
      summaryPath: "proof/summary.json",
      browserCommandPath: "proof/browser-command.json",
      browserResultPath: "proof/browser.json",
      loadPath: "proof/load.json",
      approvalPath: "proof/approval.json",
      ledgerPath: "proof/ledger.json",
    },
    lint: {
      fullLintIsPassed: false,
      status: "approved_baseline_exception",
      newFindings: 0,
    },
  };
  const read = (path, allowEmpty = false) => {
    const value = files.get(path);
    assert(value, path);
    assert(allowEmpty || value.length, path);
    return value;
  };
  const update = (path, value) => {
    put(path, value);
    const old = record.artifacts.find((a) => a.path === path);
    if (old) old.sha256 = digest(files.get(path));
  };
  return { record, files, read, update, browser, load, summary };
}
test("development evidence passes while physical/provider release remains closed", () => {
  const f = fixture();
  assertFrontendCompletion(f.record, f.read);
});
test("an unfinished task or missing checkpoint cannot be hidden by a complete final test count", () => {
  for (const change of [
    (ledger) => {
      ledger.tasks[7].status = "in_progress";
    },
    (ledger) => {
      ledger.tasks[5].commit = null;
    },
  ]) {
    const f = fixture(),
      ledger = JSON.parse(f.read("proof/ledger.json"));
    change(ledger);
    f.update("proof/ledger.json", ledger);
    assert.throws(() => assertFrontendCompletion(f.record, f.read));
  }
});
test("missing and duplicate required checks cannot pass", () => {
  for (const change of [
    (r) => r.checks.pop(),
    (r) => {
      r.checks[0] = r.checks[1];
    },
  ]) {
    const f = fixture();
    change(f.record);
    assert.throws(() => assertFrontendCompletion(f.record, f.read));
  }
});
test("device approval cannot be inferred from an emulator or a passed string", () => {
  const f = fixture();
  f.record.checks.find((c) => c.id === "P-DEVICE").status = "passed";
  assert.throws(() => assertFrontendCompletion(f.record, f.read));
});
test("live activation and missing release blockers are rejected", () => {
  for (const change of [
    (r) => {
      r.livePaymentsEnabled = true;
    },
    (r) => {
      r.releaseGate = "ready";
    },
    (r) => {
      r.scope = "release";
    },
    (r) => r.deferredRelease.pop(),
  ]) {
    const f = fixture();
    change(f.record);
    assert.throws(() => assertFrontendCompletion(f.record, f.read));
  }
});
test("missing and tampered real evidence fails its digest", () => {
  for (const change of [
    (f) => f.files.delete("proof/load.json"),
    (f) => f.files.set("src/fixture.ts", Buffer.from("changed")),
  ]) {
    const f = fixture();
    change(f);
    assert.throws(() => assertFrontendCompletion(f.record, f.read));
  }
});
test("verification files must be in the checksum manifest", () => {
  const f = fixture();
  f.record.artifacts = f.record.artifacts.filter(
    (a) => a.path !== "proof/summary.json",
  );
  assert.throws(() => assertFrontendCompletion(f.record, f.read));
});
test("a forged passing summary cannot hide a nonzero command or new lint findings", () => {
  for (const change of [
    (f) => {
      f.summary.types.exitCode = 1;
      f.update("proof/summary.json", f.summary);
    },
    (f) =>
      f.update("logs/lint.txt", {
        status: "baseline_only",
        errors: 23,
        warnings: 6,
        files: 23,
        newFindings: 1,
      }),
    (f) => f.update("logs/units.txt", "pass 153\nfail 1\nskipped 0"),
  ]) {
    const f = fixture();
    change(f);
    assert.throws(() => assertFrontendCompletion(f.record, f.read));
  }
});
test("skipped, retried, failed and expected-failure browser cases are rejected", () => {
  for (const change of [
    (b) => {
      b.stats.skipped = 1;
    },
    (b) => {
      b.config.projects[0].retries = 1;
    },
    (b) => {
      b.suites[0].specs[0].tests[0].results[0].status = "failed";
    },
    (b) => {
      b.suites[0].specs[0].tests[0].expectedStatus = "failed";
    },
  ]) {
    const f = fixture();
    change(f.browser);
    assert.throws(() => assertFinalBrowserResult(f.browser));
  }
});
test("API-only or smoke load cannot stand in for the integrated 1,000-session observation", () => {
  for (const change of [
    (l) => {
      l.kind = "smoke";
    },
    (l) => {
      l.peakActiveSessions = 999;
    },
    (l) => {
      l.timeSeries[3].observedStoreAccounts = 999;
    },
    (l) => {
      l.frontend.observations.pop();
    },
    (l) => {
      l.health.queue = 1;
    },
    (l) => {
      l.legacyAfter.payments = 1;
    },
  ]) {
    const f = fixture();
    change(f.load);
    assert.throws(() => assertIntegratedLoad(f.load));
  }
});
test("absolute, traversal and backslash paths cannot read outside the evidence root", () => {
  for (const path of [
    "../secret",
    "C:/secret",
    "/secret",
    "docs/../secret",
    "docs\\secret",
    "",
    "./package.json",
  ])
    assert.throws(() => readOwnedProof(process.cwd(), path));
});
