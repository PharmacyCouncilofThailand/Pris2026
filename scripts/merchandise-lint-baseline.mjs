import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { ESLint } from "eslint";

const directory = "docs/verification/merchandise/";
const approval = JSON.parse(
  fs.readFileSync(directory + "lint-baseline-exception.json", "utf8"),
);
assert.equal(approval.status, "approved_by_user");
assert.equal(approval.fullLintIsPassed, false);
const baseline = approval.baseline,
  root = process.cwd(),
  eslint = new ESLint({ cwd: root });
const generatedIgnores = [
  ".merchandise-local/**",
  "test-results/**",
  "playwright-report/**",
  "playwright/.auth/**",
];
const fromGit = (file) =>
  execFileSync("git", ["show", `${baseline}:${file}`], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
const norm = (text) => text.replaceAll("\r", "");
const signature = (messages) =>
  messages.map((m) => JSON.stringify([m.ruleId, m.severity, m.message])).sort();
let config = norm(fs.readFileSync("eslint.config.mjs", "utf8"));
for (const ignore of generatedIgnores)
  config = config.replace(`    "${ignore}",\n`, "");
config = config.replace(
  "    // Generated merchandise verification artifacts and private browser sessions.\n",
  "",
);
assert.equal(
  config,
  norm(fromGit("eslint.config.mjs")),
  "Only generated artifact ignores may differ from the original lint rules",
);
const current = await eslint.lintFiles(["."]),
  files = [];
for (const result of current.filter((row) => row.messages.length)) {
  const relative = path.relative(root, result.filePath).replaceAll("\\", "/");
  let previous;
  try {
    previous = fromGit(relative);
  } catch {
    throw Error(`New source has lint findings: ${relative}`);
  }
  assert.equal(
    norm(fs.readFileSync(result.filePath, "utf8")),
    norm(previous),
    `Legacy exception cannot cover changed source: ${relative}`,
  );
  const [old] = await eslint.lintText(previous, { filePath: result.filePath });
  assert.deepEqual(
    signature(result.messages),
    signature(old.messages),
    `New lint findings: ${relative}`,
  );
  files.push({
    path: relative,
    sourceMatchesBaseline: true,
    errors: result.errorCount,
    warnings: result.warningCount,
    findings: result.messages.map((m) => ({
      ruleId: m.ruleId,
      severity: m.severity,
      line: m.line,
      column: m.column,
      message: m.message,
    })),
  });
}
const record = {
  status: "baseline_only",
  baseline,
  tool: "same current ESLint rules applied read-only to baseline Git blobs; no checkout/worktree or source-rule weakening",
  errors: files.reduce((s, f) => s + f.errors, 0),
  warnings: files.reduce((s, f) => s + f.warnings, 0),
  filesWithFindings: files.length,
  newFindings: 0,
  generatedArtifactIgnoreOnly: generatedIgnores,
  files,
};
assert.equal(record.errors, approval.baselineErrors);
assert.equal(record.warnings, approval.baselineWarnings);
assert.equal(record.filesWithFindings, approval.baselineFiles);
fs.writeFileSync(
  directory + "lint-baseline-comparison.json",
  JSON.stringify(record, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    status: record.status,
    errors: record.errors,
    warnings: record.warnings,
    files: files.length,
    newFindings: 0,
    approval: directory + "lint-baseline-exception.json",
    digest: crypto
      .createHash("sha256")
      .update(JSON.stringify(record))
      .digest("hex"),
  }),
);
