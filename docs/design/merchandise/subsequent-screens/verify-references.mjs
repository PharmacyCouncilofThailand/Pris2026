// File integrity and approval gate for documentation; never a payment/UI acceptance test.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = path.dirname(fileURLToPath(import.meta.url));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const read = async (name) => {
  const resolved = path.resolve(root, name);
  assert(
    resolved.startsWith(root + path.sep),
    "Reference must stay in this directory",
  );
  return readFile(resolved);
};
const json = async (name) => JSON.parse(await read(name));
const inventory = await json("inventory.json");
const approval = await json("approval.json");
const assets = await json("asset-provenance.json");
const layout = await json("layout-checks.json");
const audit = await json("source-audit.json");
assert.equal(inventory.version, approval.version);
assert.equal(inventory.images.length, 25);
assert.equal(new Set(inventory.images.map((i) => i.file)).size, 25);
assert.equal(inventory.images.filter((i) => i.device === "mobile").length, 19);
assert.equal(layout.capturedReferences, 25);
assert.equal(layout.additionalBreakpointChecks, 30);
assert.equal(audit.browserResults.length, 14);
assert(
  audit.browserResults.every(
    (r) => !r.pageErrors.length && !r.unknownApiReads.length,
  ),
);
assert.equal(
  approval.inventorySha256,
  digest(JSON.stringify(await json("inventory.json"))),
);
for (const i of inventory.images) {
  const bytes = await read(i.file);
  assert.equal(digest(bytes), i.sha256, i.file);
  assert.equal(bytes.length, i.bytes, i.file);
  assert.equal(bytes.readUInt32BE(16), i.viewport.width, i.file);
  assert.equal(bytes.readUInt32BE(20), i.pngDimensions.height, i.file);
  const html = (await read(`pages/${i.id}.html`)).toString();
  assert(html.includes("ข้อมูลสังเคราะห์"));
  assert(
    !/<script\b/i.test(html),
    "No prototype or purchase wiring in references",
  );
}
for (const asset of assets.assets)
  assert.equal(digest(await read(asset.file)), asset.sha256, asset.file);
if (process.argv.includes("--require-approval")) {
  assert.equal(
    approval.status,
    "approved_by_user",
    "P03 human approval has not been received",
  );
  assert(approval.approvedAt && approval.approvalSource);
  assert(inventory.images.every((i) => i.approvedAt === approval.approvedAt));
} else if (approval.status === "awaiting_user_review") {
  assert.equal(approval.approvedAt, null);
  assert.equal(approval.P06ThroughP11VisualCodeAllowed, false);
  assert(inventory.images.every((i) => i.approvedAt === null));
}
console.log(
  JSON.stringify({
    fileIntegrity: "passed",
    images: 25,
    assets: assets.assets.length,
    humanApproval: approval.status,
    functionalUiOrProviderAcceptance: false,
  }),
);
