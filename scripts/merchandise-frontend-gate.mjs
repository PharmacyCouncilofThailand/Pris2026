import assert from "node:assert/strict";
import fs from "node:fs";
import { resolve, relative, isAbsolute, win32, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { digest, verifyFrontendStart } from "./merchandise-start-gate.mjs";

export const requiredChecks =
  "START CLIENT DESIGN ROUTES AUTH HOME RESPONSIVE SELECTION CART ADDRESS QUOTE CONFIRM PAYMENT HISTORY ACCESSIBILITY REGRESSION PERFORMANCE FULL-FLOW DEVICE LOAD"
    .split(" ")
    .map((id) => "P-" + id);
export const requiredDevelopmentChecks = requiredChecks.filter(
  (id) => id !== "P-DEVICE",
);
export const releaseConditions = [
  "real_merchant_payment",
  "inquiry_postback_timezone_contract",
  "actual_nipamail_delivery",
  "physical_ios_android_line_bank_saved_qr",
  "real_catalog_prices_options_bundles",
  "asset_rights_and_banners",
  "thai_preorder_window",
  "provider_budgets_and_operations",
];
export const finalBrowserCount = 339;
export function readOwnedProof(root, path, allowEmpty = false) {
  assert(
    typeof path === "string" &&
      path &&
      !isAbsolute(path) &&
      !win32.isAbsolute(path) &&
      !path.includes("\\") &&
      path.split("/").every((p) => p && p !== "." && p !== ".."),
    "Invalid evidence path",
  );
  const base = fs.realpathSync(root),
    full = fs.realpathSync(resolve(base, path)),
    rel = relative(base, full);
  assert(
    rel !== ".." && !rel.startsWith(".." + sep) && !isAbsolute(rel),
    "Evidence must stay inside its repository",
  );
  const bytes = fs.readFileSync(full);
  assert(allowEmpty || bytes.length > 0, path);
  return bytes;
}
const normalized = (bytes, format) => {
  assert(["lf", "bytes"].includes(format));
  return format === "lf" ? bytes.toString("utf8").replaceAll("\r", "") : bytes;
};
export function assertFinalBrowserResult(result) {
  assert.equal(result.stats.expected, finalBrowserCount);
  for (const name of ["unexpected", "flaky", "skipped"])
    assert.equal(result.stats[name], 0, name);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.config.projects.map((p) => p.name).sort(), [
    "chromium",
    "firefox",
    "webkit",
  ]);
  assert(result.config.projects.every((p) => p.retries === 0));
  let count = 0;
  const visit = (suites) => {
    for (const suite of suites) {
      for (const spec of suite.specs ?? [])
        for (const test of spec.tests) {
          count++;
          assert.equal(test.expectedStatus, "passed");
          assert.equal(test.status, "expected");
          assert.equal(test.results.length, 1);
          assert.equal(test.results[0].status, "passed");
          assert.equal(test.results[0].retry, 0);
        }
      visit(suite.suites ?? []);
    }
  };
  visit(result.suites);
  assert.equal(count, finalBrowserCount);
}
export function assertIntegratedLoad(result) {
  assert.equal(result.kind, "integrated_full");
  assert.equal(result.status, "passed");
  assert.equal(result.fixtureOnly, true);
  assert.equal(result.configuredStoreSessions, 1000);
  assert.equal(result.peakActiveSessions, 1000);
  assert.equal(result.observedUniqueAccounts, 1050);
  for (const key of ["systemErrors", "workerErrors", "failedJourneys"])
    assert.equal(result[key], 0, key);
  assert.deepEqual(result.legacyAfter, result.legacyBefore);
  assert.equal(result.workload.rampSeconds, 300);
  assert.equal(result.workload.steadySeconds, 1200);
  assert.equal(result.workload.cooldownSeconds, 300);
  const steady = result.timeSeries.filter(
    (s) => s.seconds >= 330 && s.seconds < 1470,
  );
  assert(steady.length >= 35);
  assert(
    steady.every(
      (s) => s.activeSessions === 1000 && s.observedStoreAccounts === 1000,
    ),
  );
  assert.equal(result.frontend.additionalOwners, 3);
  assert.equal(result.frontend.representativeBrowsers, 3);
  for (const engine of ["chromium", "firefox", "webkit"])
    assert(
      result.frontend.observations.some(
        (o) =>
          o.browser === engine &&
          o.runtimeErrors === 0 &&
          o.start.phase === "steady" &&
          o.start.sample?.activeSessions === 1000 &&
          o.start.sample?.observedStoreAccounts === 1000,
      ),
      engine,
    );
  assert(result.frontend.observations.every((o) => o.runtimeErrors === 0));
  assert(
    result.requests > 0 &&
      result.exportsCompleted > 0 &&
      result.bulkCompleted > 0,
  );
  for (const key of [
    "queue",
    "unmatchedReferences",
    "lagMs",
    "claimed",
    "queuedEmails",
  ])
    assert.equal(result.health[key], 0, key);
  // These retained unknowns are the explicitly injected faults, not unexpected backlog.
  assert.equal(
    result.health.stuckCreation,
    Math.floor(result.providerCalls.create / 37),
  );
  assert.equal(
    result.health.unknownSend,
    result.injectedMailUnknown + result.injectedCommitFailures,
  );
  assert.equal(result.actualProviderEvidence, "deferred_to_user_test");
}
export function assertFrontendCompletion(record, read) {
  assert.equal(record.gate, "G_PRIS");
  assert.equal(record.status, "passed");
  assert.equal(record.scope, "development");
  assert.equal(record.releaseGate, "not_ready");
  assert.equal(record.livePaymentsEnabled, false);
  assert.equal(record.realProvider, "deferred_to_user_test");
  assert.deepEqual(record.unresolved, []);
  assert.match(record.sourceCommit, /^[a-f0-9]{40}$/);
  assert.deepEqual(record.requiredDevelopmentChecks, requiredDevelopmentChecks);
  assert.deepEqual(
    record.deferredRelease.map((c) => c.id).sort(),
    [...releaseConditions].sort(),
  );
  assert(
    record.deferredRelease.every(
      (c) =>
        c.status === "deferred_to_user_test" ||
        c.status === "awaiting_admin_input",
    ),
  );
  assert.equal(record.database.name, "pris_merchandise_dev_test");
  assert.equal(record.database.deletion, "explicit_user_instruction_only");
  assert.equal(
    new Set(record.checks.map((c) => c.id)).size,
    requiredChecks.length,
  );
  assert.equal(record.checks.length, requiredChecks.length);
  const artifactPaths = new Set(record.artifacts.map((a) => a.path));
  assert.equal(artifactPaths.size, record.artifacts.length);
  for (const id of requiredChecks) {
    const check = record.checks.find((c) => c.id === id);
    assert(check, id);
    assert.equal(
      check.status,
      id === "P-DEVICE" ? "deferred_to_user_test" : "passed",
      id,
    );
    assert.equal(
      check.scope,
      id === "P-DEVICE" ? "release" : "development",
      id,
    );
    assert(artifactPaths.has(check.evidencePath), id);
    read(check.evidencePath);
  }
  for (const entry of [...record.artifacts, ...record.sourceInputs]) {
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert.equal(
      digest(
        normalized(read(entry.path, entry.allowEmpty === true), entry.format),
      ),
      entry.sha256,
      entry.path,
    );
  }
  assert(record.sourceInputs.length > 0);
  assert.equal(
    new Set(record.sourceInputs.map((s) => s.path)).size,
    record.sourceInputs.length,
  );
  const json = (path) =>
    JSON.parse(
      read(path)
        .toString("utf8")
        .replace(/^\uFEFF/, ""),
    );
  for (const path of Object.values(record.verification))
    assert(artifactPaths.has(path), path);
  const summary = json(record.verification.summaryPath);
  for (const name of ["units", "types", "lint", "gateUnits", "build"]) {
    assert.equal(summary[name].exitCode, 0, name);
    assert(artifactPaths.has(summary[name].log), name);
  }
  for (const name of ["units", "gateUnits"]) {
    const text = read(summary[name].log).toString();
    assert.match(text, /fail\s+0\b/);
    assert.match(text, /skipped\s+0\b/);
  }
  assert.match(read(summary.units.log).toString(), /pass 153/);
  assert.equal(read(summary.types.log, true).length, 0);
  assert.match(read(summary.gateUnits.log).toString(), /pass [1-9]\d*/);
  assert.match(read(summary.build.log).toString(), /Compiled successfully/);
  const lint = json(summary.lint.log);
  assert.equal(lint.status, "baseline_only");
  assert.equal(lint.newFindings, 0);
  assert.equal(lint.errors, 23);
  assert.equal(lint.warnings, 6);
  assert.equal(lint.files, 23);
  assert.equal(record.lint.fullLintIsPassed, false);
  assert.equal(record.lint.newFindings, 0);
  assert.equal(record.lint.status, "approved_baseline_exception");
  const command = json(record.verification.browserCommandPath);
  assert.equal(command.exitCode, 0);
  assert.equal(
    command.command,
    "npx playwright test -c playwright.merchandise.final.config.ts",
  );
  assert.match(read(command.log).toString(), /339 passed/);
  assertFinalBrowserResult(json(record.verification.browserResultPath));
  assertIntegratedLoad(json(record.verification.loadPath));
  const approval = json(record.verification.approvalPath);
  assert.equal(approval.status, "approved_by_user");
  assert.equal(approval.approvedBy, "user");
  assert.equal(approval.approvalSource.kind, "direct_human_reply_in_this_chat");
  assert.equal(approval.approvalSource.answer, "ยืนยัน P03 ทุกภาพ");
  const ledger = json(record.verification.ledgerPath);
  assert.equal(ledger.executionMode, "this_chat_sequential_no_subagents");
  assert.equal(ledger.tasks.length, 14);
  for (let number = 1; number <= 14; number++) {
    const id = `P${String(number).padStart(2, "0")}`;
    const tasks = ledger.tasks.filter((task) => task.id === id);
    assert.equal(tasks.length, 1, id);
    assert.equal(
      tasks[0].status,
      number < 13 ? "passed" : "passed_development",
      id,
    );
    if (number < 14) assert.match(tasks[0].commit, /^[a-f0-9]{40}$/, id);
  }
}
export function verificationSources(root) {
  const paths = execFileSync(
    "git",
    [
      "ls-files",
      "-z",
      "--",
      "src",
      "scripts",
      "tests",
      "package.json",
      "package-lock.json",
      "next.config.*",
      "tsconfig.json",
      "eslint.config.mjs",
      "playwright.merchandise*.config.ts",
      "vendor",
    ],
    { cwd: root, encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean);
  paths.push(
    "scripts/merchandise-frontend-gate.mjs",
    "scripts/merchandise-frontend-gate.test.mjs",
    "playwright.merchandise.final.config.ts",
  );
  return [...new Set(paths)].sort();
}
export function verifyFrontendCompletion(root, path) {
  const read = (p, empty = false) => readOwnedProof(root, p, empty),
    record = JSON.parse(read(path));
  assertFrontendCompletion(record, read);
  const upstream = verifyFrontendStart(root);
  for (const key of [
    "contractSha256",
    "specSha256",
    "typesSha256",
    "canonicalBodySha256",
  ])
    assert.equal(record[key], upstream[key], key);
  assert.equal(record.upstream.apiHead, upstream.apiHead);
  assert.equal(record.upstream.backofficeHead, upstream.backofficeHead);
  assert.equal(record.renderer.sha256, upstream.renderer.sha256);
  assert.equal(record.renderer.version, "1.0.0");
  assert.equal(
    digest(read(upstream.renderer.vendorPath)),
    upstream.renderer.sha256,
  );
  const canonical = fs
    .readFileSync(
      resolve(root, "../conference-api/docs/contracts/merchandise-v1.types.ts"),
      "utf8",
    )
    .replaceAll("\r", "");
  assert.equal(
    read("src/types/merchandise.ts")
      .toString()
      .replaceAll("\r", "")
      .split("\n")
      .slice(1)
      .join("\n"),
    canonical,
  );
  assert.deepEqual(
    record.sourceInputs.map((s) => s.path).sort(),
    verificationSources(root),
  );
  execFileSync(
    "git",
    ["merge-base", "--is-ancestor", record.sourceCommit, "HEAD"],
    { cwd: root },
  );
  execFileSync(
    "git",
    [
      "diff",
      "--exit-code",
      record.sourceCommit,
      "--",
      "src",
      "package.json",
      "package-lock.json",
      "vendor",
    ],
    { cwd: root, stdio: "pipe" },
  );
  const load = JSON.parse(read(record.verification.loadPath));
  for (const input of load.sourceInputs)
    assert.equal(
      digest(
        readOwnedProof(resolve(root, "../conference-api"), input.path)
          .toString()
          .replaceAll("\r", ""),
      ),
      input.sha256,
      input.path,
    );
  for (const input of load.orchestrationSource)
    assert.equal(digest(read(input.path)), input.sha256, input.path);
  execFileSync(
    process.execPath,
    [
      "docs/design/merchandise/subsequent-screens/verify-references.mjs",
      "--require-approval",
    ],
    { cwd: root, stdio: "pipe" },
  );
  return {
    gate: "G_PRIS",
    status: "passed",
    scope: "development",
    requiredPassed: requiredDevelopmentChecks.length,
    physicalDeviceAcceptance: "deferred_to_user_test",
    releaseGate: "not_ready",
    livePaymentsEnabled: false,
    artifacts: record.artifacts.length,
    sourceInputs: record.sourceInputs.length,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  assert.equal(process.argv.length, 4);
  assert.equal(process.argv[2], "--record");
  console.log(
    JSON.stringify(verifyFrontendCompletion(process.cwd(), process.argv[3])),
  );
}
