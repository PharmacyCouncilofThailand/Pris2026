import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve, relative, isAbsolute, win32, sep } from "node:path";
import { pathToFileURL } from "node:url";

export const requiredApiChecks =
  "PROVIDER-CONTRACT CONTRACT SCHEMA AUTH WINDOW SEED CATALOG MEDIA VARIANTS BUNDLE CART CHECKOUT REVISIONS ADAPTER EXPIRY ATTEMPTS SETTLEMENT POSTBACK WORKER HISTORY SHIPPING EMAIL REPORTS EXPORT PRODUCTION CONTRACT-FREEZE SECURITY REGRESSION LOAD"
    .split(" ")
    .map((id) => "A-" + id);
export const requiredBoChecks =
  "CLIENT ACCESS WINDOW CATALOG VARIANTS BUNDLE MEDIA PREVIEW RENDERER ORDERS REVISIONS SHIPPING REPORTS EXPORT PRODUCTION OPERATIONS REGRESSION ACCEPTANCE"
    .split(" ")
    .map((id) => "B-" + id);
export function assertFrontendStart({ api, backoffice, rendererSha256 }) {
  for (const [record, required] of [
    [api, requiredApiChecks],
    [backoffice, requiredBoChecks],
  ]) {
    assert.equal(record.status, "passed", record.gate);
    assert.equal(record.scope, "development");
    assert.deepEqual(record.unresolved, []);
    assert.equal(
      new Set(record.checks.map((c) => c.id)).size,
      record.checks.length,
    );
    for (const id of required)
      assert.equal(
        record.checks.find((c) => c.id === id)?.status,
        "passed",
        `${record.gate}/${id}`,
      );
    assert.equal(record.livePaymentsEnabled, false);
    assert.equal(record.releaseGate, "not_ready");
  }
  assert.equal(api.gate, "G_API");
  assert.equal(backoffice.gate, "G_BO");
  assert.equal(api.contractSha256, backoffice.contractSha256);
  assert.equal(api.specSha256, backoffice.specSha256);
  assert.equal(api.typesSha256, backoffice.typesSha256);
  assert.ok(
    backoffice.artifacts.some(
      (a) =>
        a.name === "merchandise-storefront-view" && a.sha256 === rendererSha256,
    ),
  );
  assert.equal(
    api.checks.find((c) => c.id === "A-REAL-PROVIDER")?.status,
    "skipped",
  );
  assert.equal(backoffice.realProvider, "deferred_to_user_test");
  assert.equal(backoffice.lint.status, "approved_baseline_exception");
  assert.equal(backoffice.lint.newFindings, 0);
}
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
export function readProof(root, path) {
  assert.ok(
    path &&
      !isAbsolute(path) &&
      !win32.isAbsolute(path) &&
      !path.includes("\\") &&
      path.split("/").every((p) => p && p !== "." && p !== ".."),
  );
  const base = fs.realpathSync(root),
    full = fs.realpathSync(resolve(base, path)),
    rel = relative(base, full);
  assert.ok(rel !== ".." && !rel.startsWith(".." + sep) && !isAbsolute(rel));
  const bytes = fs.readFileSync(full);
  assert.ok(bytes.length);
  return bytes;
}
export function verifyFrontendStart(root = process.cwd()) {
  const apiRoot = resolve(root, "../conference-api"),
    boRoot = resolve(root, "../conference-backoffice"),
    directory = "docs/verification/merchandise/";
  const apiBytes = readProof(apiRoot, directory + "api-completion.json"),
    boBytes = readProof(boRoot, directory + "backoffice-completion.json");
  const api = JSON.parse(apiBytes),
    backoffice = JSON.parse(boBytes);
  const manifest = JSON.parse(
    readProof(boRoot, directory + "renderer-artifact.json"),
  );
  const rendererBytes = readProof(boRoot, manifest.artifact),
    rendererSha256 = digest(rendererBytes);
  assertFrontendStart({ api, backoffice, rendererSha256 });
  const specPath = resolve(
    root,
    "../docs/recovery/pris-souvenir-design-spec-2026-10-14/git-snapshot/docs/superpowers/specs/2026-10-14-pris-souvenir-preorder-design.md",
  );
  assert.equal(
    digest(fs.readFileSync(specPath, "utf8").replace(/\r/g, "")),
    api.specSha256,
  );
  let artifactCount = 0,
    sourceCount = 0;
  for (const [repository, record] of [
    [apiRoot, api],
    [boRoot, backoffice],
  ]) {
    for (const check of record.checks)
      readProof(repository, check.evidencePath);
    for (const artifact of record.artifacts) {
      const bytes = readProof(repository, artifact.path),
        input =
          repository === apiRoot && !artifact.path.endsWith(".xlsx")
            ? bytes.toString().replace(/\r/g, "")
            : bytes;
      assert.equal(digest(input), artifact.sha256, artifact.path);
      artifactCount++;
    }
    const sourceInputs =
      repository === apiRoot
        ? JSON.parse(readProof(repository, directory + "api-load-results.json"))
            .sourceInputs
        : record.sourceInputs;
    for (const input of sourceInputs) {
      const bytes = readProof(repository, input.path);
      assert.equal(
        digest(
          repository === apiRoot ? bytes.toString().replace(/\r/g, "") : bytes,
        ),
        input.sha256,
        input.path,
      );
      sourceCount++;
    }
    execFileSync(
      "git",
      ["merge-base", "--is-ancestor", record.sourceCommit, "HEAD"],
      { cwd: repository },
    );
    assert.equal(
      execFileSync("git", ["status", "--porcelain"], {
        cwd: repository,
        encoding: "utf8",
      }).trim(),
      "",
      "Upstream repository must be committed and clean",
    );
  }
  const apiCheck = execFileSync(
    process.execPath,
    ["scripts/merchandise-api-handoff.mjs", "--check"],
    { cwd: boRoot, encoding: "utf8" },
  );
  assert.equal(JSON.parse(apiCheck.trim()).status, "passed");
  const boState = JSON.parse(
    readProof(boRoot, directory + "execution-state.json"),
  );
  for (let i = 1; i <= 14; i++)
    assert.equal(
      boState.tasks.find((t) => t.id === `B${String(i).padStart(2, "0")}`)
        ?.status,
      "passed",
    );
  const types = readProof(apiRoot, "docs/contracts/merchandise-v1.types.ts")
    .toString()
    .replace(/\r/g, "");
  assert.equal(digest(types), api.typesSha256);
  assert.equal(manifest.version, "1.0.0");
  const gitHead = (cwd) =>
    execFileSync("git", ["rev-parse", "HEAD"], {
      cwd,
      encoding: "utf8",
    }).trim();
  return {
    gate: "G_FRONTEND_START",
    status: "passed",
    scope: "development",
    verifiedAt: new Date().toISOString(),
    thaiTime:
      new Date().toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" }) +
      " Asia/Bangkok",
    frontendBaseline: "db6726c5f352736f4b8bfd91452055bf8bca5cf9",
    frontendHeadAtCheck: gitHead(root),
    apiHead: gitHead(apiRoot),
    apiSourceCommit: api.sourceCommit,
    backofficeHead: gitHead(boRoot),
    backofficeSourceCommit: backoffice.sourceCommit,
    apiCompletionSha256: digest(apiBytes),
    backofficeCompletionSha256: digest(boBytes),
    contractVersion: "1.0.0",
    contractSha256: api.contractSha256,
    specSha256: api.specSha256,
    typesSha256: api.typesSha256,
    canonicalBodySha256: api.canonicalBodySha256,
    renderer: {
      version: "1.0.0",
      sourcePath: manifest.artifact,
      vendorPath: "vendor/conference-merchandise-storefront-view-1.0.0.tgz",
      sha256: rendererSha256,
    },
    requiredApiChecks,
    requiredBoChecks,
    verifiedArtifacts: artifactCount,
    verifiedSourceInputs: sourceCount,
    livePaymentsEnabled: false,
    releaseGate: "not_ready",
    realProvider: "deferred_to_user_test",
    backofficeLintException: directory + "lint-baseline-exception.json",
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  assert.ok(["--check", "--record"].includes(process.argv[2]));
  assert.equal(process.argv.length, 3);
  const record = verifyFrontendStart();
  if (process.argv[2] === "--record") {
    fs.mkdirSync("docs/verification/merchandise", { recursive: true });
    fs.writeFileSync(
      "docs/verification/merchandise/frontend-start.json",
      JSON.stringify(record, null, 2) + "\n",
    );
  }
  console.log(JSON.stringify(record));
}
