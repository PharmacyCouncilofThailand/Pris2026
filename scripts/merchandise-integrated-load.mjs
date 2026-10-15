import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  symlinkSync,
  realpathSync,
} from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";
import assert from "node:assert/strict";
import { prepareLoadBrowsers } from "./merchandise-load-browsers.mjs";

assert(
  process.argv.length === 3 && ["--smoke", "--full"].includes(process.argv[2]),
  "Select --smoke or --full explicitly",
);
const smoke = process.argv[2] === "--smoke",
  root = process.cwd(),
  api = resolve("../conference-api");
const canonicalPath = resolve(api, "tests/load/merchandise-load.ts"),
  raw = readFileSync(canonicalPath);
const canonicalSha = createHash("sha256").update(raw.toString("utf8").replaceAll("\r", "")).digest("hex");
assert.equal(
  canonicalSha,
  "a4f8538025a595f312f5c9b5f41e55e60e7dba5efb3983874b46a7f4fdb79131",
  "Review upstream harness drift before reusing it",
);
mkdirSync(".merchandise-local", { recursive: true });
const dependencies = resolve(".merchandise-local/node_modules");
if (!existsSync(dependencies))
  symlinkSync(resolve(api, "node_modules"), dependencies, "junction");
assert.equal(
  realpathSync(dependencies).toLowerCase(),
  realpathSync(resolve(api, "node_modules")).toLowerCase(),
);
let source = raw.toString("utf8").replaceAll("\r", "");
function replace(before, after) {
  assert.equal(
    source.split(before).length - 1,
    1,
    `Upstream hook must be unique: ${before.slice(0, 70)}`,
  );
  source = source.replace(before, after);
}
source = source
  .replaceAll('"../../src/', '"../../conference-api/src/')
  .replaceAll("MERCH-LOAD-TEST", "PRIS-2026");
replace(
  'origin:["http://127.0.0.1:3000"]',
  'origin:["http://127.0.0.1:3000","http://127.0.0.1:3102"]',
);
replace(
  "await migrateMerchandise(sql);await registerMerchandiseRoutes",
  `
  const putCatalog=deps.media.putCatalog.bind(deps.media);
  deps.media.putCatalog=async input=>{await putCatalog(input);return 'http://127.0.0.1:3103/_load-media/'+input.eventId+'/'+encodeURIComponent(input.key);};
  app.get('/_load-media/:eventId/:key',async(req,reply)=>{
    const p=req.params as {eventId:string;key:string}, bytes=(deps.media as ReturnType<typeof recordingMedia>).catalog.get(p.eventId+'/'+p.key);
    return bytes ? reply.type('image/png').send(Buffer.from(bytes)) : reply.code(404).send();
  });
  await migrateMerchandise(sql);await registerMerchandiseRoutes`,
);
replace(
  'const origin=await app.listen({host:"127.0.0.1",port:0}),began=performance.now();let endAt=began+(ramp+steady)*1000;',
  `
  const origin=await app.listen({host:"127.0.0.1",port:3103});
  const browserUsers=await sql\`INSERT INTO users(email,password_hash,role,first_name,last_name,status,phone)
    SELECT 'ui-load-'||n||'@example.test','fixture-not-login','general','ผู้ซื้อหน้าจอ',n::text,'active','0812345678' FROM generate_series(1,3) n RETURNING id,email\`;
  process.send?.({type:'ready',origin,buyers:browserUsers.map(u=>({id:u.id,email:u.email,token:app.jwt.sign({id:u.id,role:'general',email:u.email},{expiresIn:'2h'})}))});
  await new Promise<void>(done=>process.once('message',m=>{assert.equal(m,'start-load');done();}));
  const began=performance.now();let endAt=began+(ramp+steady)*1000;
  process.send?.({type:'started',ramp,steady,cooldown});`,
);
replace(
  "await Promise.all([...sessions,...legacy,adminWork]);stopping=true;await worker;",
  `
    await Promise.all([...sessions,...legacy,adminWork]);
    process.send?.({type:'stop-browsers'});
    await new Promise<void>(done=>process.once('message',m=>{assert.equal(m,'browsers-stopped');done();}));
    stopping=true;await worker;`,
);
replace(
  "timeSeries.push({seconds:Math.round(elapsed),activeSessions:active,observedStoreAccounts:observed,requests,inFlight,heapBytes:",
  `process.send?.({type:'sample',seconds:elapsed,activeSessions:active,observedStoreAccounts:observed});
    timeSeries.push({seconds:Math.round(elapsed),activeSessions:active,observedStoreAccounts:observed,requests,inFlight,heapBytes:`,
);
const reportPath = resolve(
  smoke
    ? ".merchandise-local/p13-load-smoke.json"
    : "docs/verification/merchandise/full-load-results.json",
);
replace(
  'const reportPath=smoke ? ".merchandise-local/a21-load-smoke.json" : diagnostic ? ".merchandise-local/a21-load-diagnostic.json" : "docs/verification/merchandise/api-load-results.json";',
  `const reportPath=${JSON.stringify(reportPath)};`,
);
const generated = resolve(".merchandise-local/p13-integrated-runtime.mts");
writeFileSync(generated, source);
const observations = [],
  diagnostics = [];
let clients,
  browserRun,
  startedAt = null,
  phase = null,
  sample = null,
  failed = null;
const progress = () => ({
  seconds: startedAt === null ? null : (performance.now() - startedAt) / 1000,
  phase:
    startedAt === null
      ? "preparation"
      : (performance.now() - startedAt) / 1000 < phase.ramp
        ? "ramp"
        : (performance.now() - startedAt) / 1000 < phase.ramp + phase.steady
          ? "steady"
          : "cooldown",
  sample,
});
const child = spawn(
  process.execPath,
  [
    `--env-file=${resolve(api, ".env.merchandise.local")}`,
    "--import",
    pathToFileURL(resolve(api, "node_modules/tsx/dist/loader.mjs")).href,
    generated,
    ...(smoke ? ["--smoke"] : []),
  ],
  { cwd: api, stdio: ["ignore", "pipe", "pipe", "ipc"] },
);
child.stdout.on("data", (data) => process.stdout.write(data));
child.stderr.on("data", (data) => {
  diagnostics.push(String(data));
  if (diagnostics.length > 20) diagnostics.shift();
});
let queue = Promise.resolve();
const fail = (error) => {
  failed ??= error;
  clients?.stop();
  child.kill();
};
child.on("message", (message) => {
  queue = queue
    .then(async () => {
      if (message.type === "ready") {
        clients = await prepareLoadBrowsers(message, observations, progress);
        child.send("start-load");
      } else if (message.type === "started") {
        startedAt = performance.now();
        phase = message;
        browserRun = clients.start().catch(fail);
      } else if (message.type === "sample")
        sample = {
          seconds: message.seconds,
          activeSessions: message.activeSessions,
          observedStoreAccounts: message.observedStoreAccounts,
        };
      else if (message.type === "stop-browsers") {
        clients.stop();
        await browserRun;
        if (!failed && child.connected) child.send("browsers-stopped");
      }
    })
    .catch(fail);
});
const status = await new Promise((resolveExit) =>
  child.once("exit", (code) => resolveExit(code)),
);
await queue;
clients?.stop();
await browserRun;
await clients?.close();
if (failed || status !== 0) {
  writeFileSync(
    resolve(".merchandise-local/p13-load-failure.txt"),
    diagnostics.join(""),
  );
  throw (
    failed ??
    Error(
      "Integrated load failed; inspect the private diagnostic file and structured report",
    )
  );
}
const report = JSON.parse(readFileSync(reportPath, "utf8"));
assert.equal(report.status, "passed");
assert.equal(report.peakActiveSessions, smoke ? 20 : 1000);
assert.equal(report.systemErrors, 0);
assert.equal(report.workerErrors, 0);
for (const browser of ["chromium", "firefox", "webkit"]) {
  const rows = observations.filter((row) => row.browser === browser);
  assert(rows.length > 0, `${browser} must finish a real DOM journey`);
  if (!smoke)
    assert(
      rows.some(
        (r) =>
          r.start.phase === "steady" &&
          r.start.sample?.activeSessions === 1000 &&
          r.start.sample?.observedStoreAccounts === 1000,
      ),
      `${browser} must be measured during the 1,000-account steady window`,
    );
}
Object.assign(report, {
  kind: smoke ? "integrated_smoke" : "integrated_full",
  apiHarness: {
    path: "../conference-api/tests/load/merchandise-load.ts",
    sha256: canonicalSha,
    reuse:
      "Strictly checked generated test adapter: same workload, workers, Admin exports/bulk and business assertions; fixed loopback/CORS/media and IPC browser lifecycle; original API proof is not overwritten",
  },
  frontend: {
    origin: "http://127.0.0.1:3102",
    representativeBrowsers: 3,
    additionalOwners: 3,
    observations,
    caveats:
      "Three emulated viewport browser clients augment 1,000 API sessions and 50 registration readers. This is not 1,000 full browser processes, physical devices or actual merchant/Nipamail acceptance. Browser clients exercise cart and quote; API load sessions exercise confirmation/payment/settlement.",
  },
  orchestrationSource: [
    "scripts/merchandise-integrated-load.mjs",
    "scripts/merchandise-load-browsers.mjs",
  ].map((path) => ({
    path,
    sha256: createHash("sha256")
      .update(readFileSync(resolve(root, path)))
      .digest("hex"),
  })),
  actualProviderEvidence: "deferred_to_user_test",
});
writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
process.stdout.write(
  JSON.stringify({
    status: report.status,
    kind: report.kind,
    peakActiveSessions: report.peakActiveSessions,
    browserJourneys: observations.length,
  }) + "\n",
);
