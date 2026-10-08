# Lucky Wheel Daily Attendance Readiness Implementation Plan

**Goal:** Give PRIS administrators an explicit, audited setup operation that enables daily Main Session check-in, safely imports proven legacy check-ins, and prevents Lucky Wheel from opening with missing attendance configuration.

**Architecture:** Keep wheel initialization and daily-attendance activation separate. Add a read-only readiness service and an admin setup transaction; make attendance writers share a per-event/session cutover fence. Continue using daily attendance as the only check-in evidence for QR claims and spins, with a distinct configuration error when the daily policy is missing.

**Tech Stack:** TypeScript, Fastify, Zod, Drizzle/PostgreSQL, Node test runner via tsx, Next.js/React, next-intl, PostgreSQL 16 in a dedicated local Docker container (T01 amendment approved 2026-10-05).

**Execution:** Work inline, task-by-task. Steps use checkbox syntax. No subagent or superpowers execution dependency is required. Use brainstorming to keep decisions within this approved scope; stop and report any conflict before expanding the plan.

## Approved basis and verified defect

The user selected explicit admin setup plus readiness checks, rather than a one-off SQL repair or automatic activation during wheel creation. On 2026-10-05 the inspected `conference-api/.env` DATABASE_URL pointed to Local Docker `confer_db`, not Railway. The photographed registration had a confirmed Main Session entitlement and a legacy timestamp, but no daily policy or daily history. Its daily QR was also closed. Those observations explain the incident; they are not permanent event/session IDs for implementation.

Current `initializeWheel` only creates the paused wheel. `checkInSession` writes `registration_sessions.checked_in_at` when the daily policy is absent, while `claimQrCredit` and `createSpin` require `session_daily_checkins`. Existing integration fixtures usually insert daily history directly, so they do not prove operational setup from an empty policy state.

Existing design references:

- `conference-api/docs/superpowers/specs/2026-10-04-lucky-wheel-initialization-design.md`
- `Pris2026/docs/superpowers/specs/2026-10-04-lucky-wheel-shared-qr-credits-design.md`
- `Pris2026/docs/superpowers/specs/2026-10-04-lucky-wheel-backoffice-simplification-design.md`

## Global constraints

- Workspace root: `D:/confer/confer/conference`. Paths below are relative to that root and identify the owning Git repository explicitly.
- Preserve original tickets, QR entry codes, registrations, entitlements, and the single configured PRIS Main Session. Never create another Main Session or duplicate entitlement to repair attendance.
- Enable daily attendance only for the existing wheel's PRIS Main Session. Workshops and other events retain their current rules.
- Account/event participation rules, one claim per account/QR, credit lifetime, prize allocation, stock, redemption and correction rules remain unchanged.
- Use server time and `Asia/Bangkok`. Never accept attendance date, user ID, checked-in timestamp, or scanner ID from this new setup request.
- No fallback from daily attendance to the legacy timestamp in QR/spin eligibility.
- Do not fabricate check-in for confirmed registrations. Import only evidenced legacy timestamps with a valid original scanner; preserve the source fields.
- Never overwrite or delete existing daily history, cancellation, spins, credits, redemption, audit, stock, or source timestamps. Ambiguous conflicts stop the entire setup transaction.
- Setup must run with the wheel paused. It does not unpause the wheel, open QR codes, publish prizes, or create credits.
- Require an active admin, a reason, a readiness fingerprint and an idempotency key for setup. QR open/close reasons remain optional as previously approved.
- Do not add a policy-disable button. Reverting live attendance semantics is a separate reviewed operation.
- No new schema migration is expected: migrations 0033–0036 contain the required tables and audit facilities. If a schema change becomes necessary, stop and request an amendment before implementing it.
- Tests use dedicated test databases only. Never run destructive test fixtures against DATABASE_URL, confer-postgres-dev, or Railway.
- Do not push or deploy. A live activation requires confirmation that every API writer instance runs the cutover-fence version.
- Finish and test each task before the next. Record a prerequisite exception only when a later task is genuinely required; re-test it immediately after that prerequisite passes.
- Commit with title and body after T01–T06 and T07–T12, grouped per affected repository. Keep unrelated user changes out of commits.
- After all task gates pass, perform final integrated verification. Do not label an unperformed browser/device check PASS.
- Ask before deleting test containers/volumes or altering another environment's operational data. Preserve backups.
- Use caveman only for chat/status summaries; code, tests, audit reasons and documentation use normal clear language.

## File ownership

| File                                                                                                     | Responsibility                                                                      |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `conference-api/src/modules/attendance/readiness.ts` (new)                                               | Typed readiness inventory, classification, stable fingerprint, scoped legacy import |
| `conference-api/src/modules/attendance/cutover-lock.ts` (new)                                            | Shared/exclusive transaction-scoped event/session fence                             |
| `conference-api/src/modules/attendance/service.ts`                                                       | Fence existing check-in and cancellation writers before row locks                   |
| `conference-api/src/modules/lucky-wheel/attendance-setup.ts` (new)                                       | Authorized admin setup transaction and exactly-once audit/replay                    |
| `conference-api/src/modules/lucky-wheel/access.ts`                                                       | Daily-policy runtime prerequisite and error type                                    |
| `conference-api/src/modules/lucky-wheel/service.ts`                                                      | Admin state readiness, open/spin/eligibility integration                            |
| `conference-api/src/modules/lucky-wheel/qr-credits.ts`                                                   | QR opening/claim runtime prerequisite                                               |
| `conference-api/src/modules/lucky-wheel/routes.ts`, `schemas.ts`, `types.ts`                             | Authenticated setup route and strict contracts                                      |
| `conference-api/src/routes/backoffice/checkins.ts`                                                       | Legacy undo fence and optional test-only database injection through plugin options  |
| `conference-backoffice/src/components/lucky-wheel/AttendanceSetup.tsx` (new)                             | Readiness card, reviewed setup dialog, result/reload/retry UI                       |
| `conference-backoffice/src/app/lucky-wheel/page.tsx`                                                     | Mount setup card, readiness warnings and open-button gate                           |
| `conference-backoffice/src/components/lucky-wheel/QrRights.tsx`                                          | Missing-policy warning and QR-open prerequisite                                     |
| `conference-backoffice/src/lib/api.ts`, `src/types/lucky-wheel.ts`                                       | Admin client and shared readiness/setup contracts                                   |
| `conference-backoffice/src/app/checkin/page.tsx`                                                         | Explicit server-day/daily-mode scanner labels                                       |
| `Pris2026/src/lib/luckyWheel.ts`                                                                         | Attendee configuration block code                                                   |
| `Pris2026/src/app/[locale]/lucky-wheel/claim/page.tsx`                                                   | Setup-specific TH/EN claim message and retry                                        |
| `Pris2026/src/components/lucky-wheel/ActivityTicket.tsx`                                                 | Setup-specific wheel message                                                        |
| `Pris2026/messages/th.json`, `messages/en.json`                                                          | Matching localized copy                                                             |
| `conference-api/sql/lucky-wheel-setup/README.md`, `00_readiness.sql`, `01_backfill_daily_attendance.sql` | Current release/cutover runbook and scoped read-only operator inventory             |

Do not split or restructure unrelated route/service modules. New modules above keep setup and cutover logic out of the existing large wheel service.

## Exact contracts

### Readiness

Create these types in `conference-api/src/modules/attendance/readiness.ts`; mirror the public DTO in Backoffice's wheel types.

```ts
export type AttendanceSetupBlocker =
  | "SCHEMA_REQUIRED"
  | "INVALID_MAIN_SESSION"
  | "MISSING_ENTITLEMENTS"
  | "UNLINKED_ACCOUNTS"
  | "LEGACY_SCANNER_MISSING"
  | "LEGACY_TIME_INVALID"
  | "LEGACY_DAILY_CONFLICT"
  | "CANCELLATION_CONFLICT";

export type AttendanceReadiness = {
  eventId: number;
  mainSessionId: number;
  serverDate: string;
  policyEnabled: boolean;
  runtimeReady: boolean;
  setupComplete: boolean;
  revision: string;
  counts: {
    confirmedRegistrations: number;
    confirmedEntitlements: number;
    missingEntitlements: number;
    unlinkedAccounts: number;
    legacySources: number;
    pendingLegacyImports: number;
    alreadyImported: number;
    alreadyCovered: number;
    conflicts: number;
  };
  blockers: Array<{ code: AttendanceSetupBlocker; count: number }>;
};
```

- `runtimeReady`: required schema exists, wheel points to a valid active Main Session for PRIS, and its exact policy is enabled in daily mode.
- `setupComplete`: runtimeReady, no setup blocker, and pendingLegacyImports is zero. An already-covered active record is not pending.
- Existing attendance and confirmed-user checks remain per participant. Do not deny all participants merely because another registration is missing an entitlement after setup.
- `revision`: SHA-256 of canonical, ordered setup evidence, not a time-based value. Include target binding/session validity, policy state, confirmed registration IDs/user links, matching entitlement IDs, relevant legacy timestamp/scanner text, and relevant daily row IDs/date/scanner/source/cancellation state. Exclude server time, QR state, wheel configuration/prize stock and unrelated event data.
- Do not return participant names/email/raw QR tokens from the summary. Detailed conflict evidence stays in the authorized operational inventory.
- Readiness is observational. No insert, policy enablement, backfill, or scan occurs when the card loads.

### Admin setup mutation

```http
POST /api/backoffice/lucky-wheel/events/:eventId/attendance-setup
Content-Type: application/json

{
  "mainSessionId": 1,
  "expectedReadinessRevision": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "reason": "Enable reviewed PRIS daily attendance",
  "idempotencyKey": "31957689-7f1b-460c-a1f6-2df1c520a9af"
}
```

The example values illustrate valid formatting; derive the real ID and revision from the server preview and generate a fresh request UUID. Strict request validation rejects extra properties and malformed fingerprints/IDs. New success returns 201; same actor/key/request replay returns 200.

```ts
export type AttendanceSetupInput = {
  mainSessionId: number;
  expectedReadinessRevision: string;
  reason: string;
  idempotencyKey: string;
};
export type AttendanceSetupResult = {
  eventId: number;
  mainSessionId: number;
  policyEnabled: true;
  importedCount: number;
  alreadyImportedCount: number;
  alreadyCoveredCount: number;
  auditId: string;
  replayed: boolean;
};
```

Public functions:

```ts
readAttendanceReadiness(database: WheelDatabase, eventId: number,
  mainSessionId: number): Promise<AttendanceReadiness>

lockAttendanceCutover(database: WheelDatabase, eventId: number,
  sessionId: number, mode: "shared" | "exclusive"): Promise<void>

importLegacyAttendance(database: WheelDatabase, eventId: number,
  mainSessionId: number): Promise<{
    importedCount: number; alreadyImportedCount: number;
    alreadyCoveredCount: number;
  }>

setupWheelAttendance(database: WheelDatabase, actor: AdminWheelActor,
  eventId: number, input: AttendanceSetupInput): Promise<AttendanceSetupResult>

requireDailyAttendanceReady(database: WheelDatabase, eventId: number,
  mainSessionId: number): Promise<void>
```

`importLegacyAttendance` is an internal transaction helper: never expose it as another public write endpoint or call it without the exclusive fence and locked/revalidated target. A new readiness GET endpoint is unnecessary: include `attendanceReadiness` in `readAdminWheelState` and its existing authenticated GET response.

### Errors

| HTTP | Code                              | Meaning and action                                                                                  |
| ---- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| 409  | `ATTENDANCE_SETUP_REQUIRED`       | Daily policy missing/disabled; attendee sees organizer setup message; no credit/spin/stock mutation |
| 409  | `ATTENDANCE_SETUP_STALE`          | Evidence changed since preview; reload readiness and review again                                   |
| 409  | `ATTENDANCE_SETUP_CONFLICT`       | Ambiguous history, invalid binding, or setup blockers; review counts and reconcile explicitly       |
| 409  | `ATTENDANCE_SETUP_BUSY`           | Scoped lock timed out; nothing committed; retry original request/key                                |
| 409  | `ATTENDANCE_SETUP_REQUIRES_PAUSE` | New setup requires the wheel already paused; committed setup replay does not require pausing again  |
| 409  | `IDEMPOTENCY_CONFLICT`            | Same actor/key with different request hash                                                          |
| 403  | `ADMIN_REQUIRED`                  | Existing active-admin guard rejects actor                                                           |

Use `ATTENDANCE_SETUP_REQUIRED` as the new attendee BlockCode. Add the setup-only error codes to WheelError's accepted union, not to participant-specific eligibility logic. A missing database schema is a configuration/service failure, never CHECKIN_REQUIRED.

### Legacy classification

Legacy timestamp fields are UTC `timestamp without time zone`. Convert explicitly:

```sql
rs.checked_in_at AT TIME ZONE 'UTC' AS instant,
((rs.checked_in_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok')::date AS day,
'registration_sessions:' || rs.id::text AS source_key
```

For this exact event/session only:

1. No legacy timestamp: no candidate, no created daily attendance.
2. Existing row with source_key, even cancelled: alreadyImported; never recreate or reactivate it.
3. Active daily row on the proven day with exactly matching instant and scanner: alreadyCovered; keep it unchanged and do not add another row.
4. Active daily row on that day with different evidence: LEGACY_DAILY_CONFLICT; rollback whole setup.
5. Cancelled daily history for that entitlement/day without a processed legacy source: CANCELLATION_CONFLICT; rollback rather than resurrect attendance.
6. Missing/unknown original scanner or non-finite/out-of-session timestamp: corresponding blocker; do not invent staff attribution or correct time automatically.
7. Otherwise insert one daily record with the original instant/scanner and unique source_key.

Historical candidate discovery does not discard proven attendance merely because its registration is no longer confirmed. Current confirmed/ownership checks still govern playing. Setup reports historical candidates separately from current confirmed entitlement completeness.

## Task 1 — Safe baseline, isolated test container and evidence ledger

**Files:** Create `Pris2026/docs/superpowers/verification/lucky-wheel-attendance-readiness/acceptance.md`; create `conference-api/src/modules/attendance/readiness-test-fixture.ts` with synthetic fixture utilities as needed by the following tasks.

**Consumes:** Existing schema/migrations 0033–0036 and test guards in `src/modules/session-grants/test-database.ts`.

**Produces:** Dedicated test database targets, baseline result ledger, repeatable synthetic PRIS fixtures.

- [x] Record all three Git statuses and heads; inspect relevant AGENTS.md if any. Inventory current Docker names and ports without printing secrets.
- [x] Check port 65436 and container name are unused before creation. If occupied, stop and report rather than deleting/reusing someone else's database.
- [x] Start one container and verify readiness:

```powershell
docker run -d --name pris2026-attendance-readiness-test-20261005 `
  -e POSTGRES_USER=wheel_test -e POSTGRES_PASSWORD=wheel_test `
  -e POSTGRES_DB=attendance_readiness_test -p 127.0.0.1:65436:5432 postgres:16-alpine
docker exec pris2026-attendance-readiness-test-20261005 pg_isready -U wheel_test
docker exec pris2026-attendance-readiness-test-20261005 createdb -U wheel_test wheel_readiness_test
```

- [x] Initialize the non-destructive attendance test database with a schema-only copy of the reviewed local development database, never its data. Use native pg_dump/psql within Docker; retain the schema artifact outside Git and verify migration 0033–0036 state. Record source database/schema version. Stop if the development schema is missing prerequisites. This matches existing attendance tests' full-schema requirement; a schema-only local read is not a dev data mutation.
- [x] Keep destructive wheel fixtures on wheel_readiness_test; run suites sequentially. Use `openSessionGrantTestDatabase` to verify the test marker and separation from DATABASE_URL before any fixture cleanup.
- [x] Fixtures use invented `.invalid` accounts, synthetic PRIS event, one Main Session and one workshop. Never copy real participant data or assume Local/Railway IDs.
- [x] Run baseline API build and wheel tests against wheel_readiness_test; attendance tests against attendance_readiness_test. Record unrelated pre-existing failures rather than silently marking them PASS.

```powershell
$env:TEST_DATABASE_URL='postgres://wheel_test:wheel_test@127.0.0.1:65436/wheel_readiness_test'
npx tsx --test --test-concurrency=1 src/modules/lucky-wheel/policy.test.ts src/modules/lucky-wheel/routes.test.ts src/modules/lucky-wheel/service.integration.test.ts src/modules/lucky-wheel/qr-credits.integration.test.ts
npm run build
```

**Gate:** Container healthy; fixture guard enforced; baseline recorded; existing databases unchanged. Record the exact attendance-suite bootstrap separately from destructive wheel fixtures.

## Task 2 — Readiness inventory, classification and stable revision

**Files:** Create `conference-api/src/modules/attendance/readiness.ts`, `readiness.test.ts`, `readiness.integration.test.ts`.

**Consumes:** WheelDatabase; existing wheel/Main Session binding; Legacy classification above.

**Produces:** `readAttendanceReadiness` and internal ordered evidence/classification for import.

- [x] Add pure classification tests before implementing classification. Cover absent evidence, valid import, matching active history, conflicting active history, processed cancelled source, unprocessed cancellation, unknown scanner and invalid time.

```ts
assert.equal(
  classifyLegacy(source, {
    sourceAlreadyRecorded: true,
    active: null,
    cancelledOnDay: true,
  }),
  "alreadyImported",
);
assert.equal(
  classifyLegacy(source, {
    sourceAlreadyRecorded: false,
    active: null,
    cancelledOnDay: true,
  }),
  "cancellationConflict",
);
```

`classifyLegacy` is a module-local pure helper exported only if required for focused tests; its source/evidence types are defined in readiness.ts. An exact matching active record returns alreadyCovered, not import.

- [x] Add integration assertions against synthetic full-schema fixtures: no policy is not runtimeReady; enabled policy makes runtimeReady true; pending import makes setupComplete false; another event's policy never counts; missing confirmed entitlement and null user are counted without repairing rows.

```ts
const state = await readAttendanceReadiness(
  database,
  fixture.eventId,
  fixture.mainSessionId,
);
assert.equal(state.runtimeReady, false);
assert.equal(state.counts.missingEntitlements, 0);
assert.equal(state.counts.pendingLegacyImports, 1);
```

- [x] Implement schema presence probing with `to_regclass`/catalog reads before querying new tables. Return SCHEMA_REQUIRED without leaking SQL errors or pretending a participant failed check-in.
- [x] Query target by joined wheel/event/session identities, verify PRIS code, active Main Session and valid time interval. Query registrations, entitlement evidence and daily rows separately to avoid join multiplication.
- [x] Read inventory in one coherent database snapshot: use a read-only REPEATABLE READ transaction for the public preview, and the already locked transaction for setup revalidation. Keep the evidence collector reusable internally; do not start a nested independent transaction during setup.
- [x] Implement stable canonical JSON ordering and SHA-256 revision. Repeat inventory without writes must retain revision; changing relevant cancellation, user link, policy or source time must change it. Changing unrelated event data or elapsed time must not.
- [x] Keep runtimeReady and setupComplete separate as defined above.
- [x] Run:

```powershell
$env:TEST_DATABASE_URL='postgres://wheel_test:wheel_test@127.0.0.1:65436/attendance_readiness_test'
npx tsx --test --test-concurrency=1 src/modules/attendance/readiness.test.ts src/modules/attendance/readiness.integration.test.ts
npm run build
```

**Gate:** Read-only inventory is correctly scoped, counts are not multiplied, no mutation, all listed classification/revision tests pass.

## Task 3 — Shared scanner/cancellation cutover fence

**Files:** Create `conference-api/src/modules/attendance/cutover-lock.ts`; modify `attendance/service.ts`, `attendance/service.integration.test.ts`, `routes/backoffice/checkins.ts`; create `attendance/cutover-lock.integration.test.ts`.

**Consumes:** WheelDatabase transactions; event/session discovery from existing entitlements.

**Produces:** `lockAttendanceCutover` and compliant attendance write paths.

- [x] Add a two-connection test that holds an exclusive fence while a shared-fenced check-in is attempted. Assert it cannot commit before the exclusive transaction releases. Use promise barriers, not timing-only sleeps.
- [x] Implement exact fence key and SQL with parameterized values:

```ts
const key = `pris:attendance:${eventId}:${sessionId}`;
if (mode === "shared") {
  await database.execute(
    sql`SELECT pg_advisory_xact_lock_shared(hashtextextended(${key}, 0))`,
  );
} else {
  await database.execute(
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`,
  );
}
```

- [x] In checkInSession, discover event/session without a row lock inside the transaction, acquire shared fence, then re-read the entitlement with FOR UPDATE and execute existing authorization/time/policy logic. Do not acquire the fence after the entitlement lock.
- [x] Apply the same ordering to cancelDailyCheckin and the legacy undo mutation in checkins.ts. Revalidate discovered IDs after the fence; stale/missing entitlement fails rather than switching targets.
- [x] All assigned/selected/check-all scans already call checkInSession; verify they continue to do so. Do not add an alternative direct writer.
- [x] Check lock ordering: fence → entitlement → daily attendance for normal writers; setup's event/session/wheel locks are specified in Task 4. Add concurrent scan/cancel coverage without introducing deadlocks.
- [x] Keep single-session behavior for workshops; a fence alone does not enable daily mode.
- [x] Run attendance tests including original backfill/cancellation regression and API build.

**Gate:** Scan and both undo paths honor the fence; normal single/daily behavior remains correct. All production API writer instances must run this task's code before operational cutover.

## Task 4 — Atomic, scoped admin setup and import

**Files:** Create `conference-api/src/modules/lucky-wheel/attendance-setup.ts`, `attendance-setup.integration.test.ts`; extend `attendance/readiness.ts` with `importLegacyAttendance`.

**Consumes:** Task 2 readiness/evidence; Task 3 fence; existing active admin validation and wheel audit table.

**Produces:** setupWheelAttendance and immutable result/replay audit.

- [x] Add failing tests for valid setup, non-admin, wrong session/event, unpaused wheel, stale revision, missing entitlement, unknown scanner, historical active conflict and cancellation conflict. Every rejection asserts zero newly imported history and unchanged policy.
- [x] Implement one transaction with local lock/statement timeouts (5s/60s). Lock ordering: exclusive attendance fence → exact event FOR UPDATE NOWAIT → exact Main Session FOR UPDATE NOWAIT → wheel FOR UPDATE NOWAIT → event registrations in ascending ID FOR UPDATE NOWAIT → matching entitlement rows in ascending ID FOR UPDATE NOWAIT → related daily rows in ascending ID FOR UPDATE NOWAIT. Amendment approved 2026-10-06: every setup row lock is nonwaiting so existing grant writers cannot form a wait cycle; 55P03 returns ATTENDANCE_SETUP_BUSY and rolls back. Event/session parent locks prevent new relevant FK insertions crossing the snapshot; row locks protect current evidence. Inspect existing grant writer lock order before adding locks; stop if it conflicts with this order.
- [x] Revalidate active admin and exact PRIS target, then check prior `attendance_setup` audit for event/actor/idempotency key before current pause/blocker/revision prerequisites. Compare canonical request hash; identical retry returns saved result, differing request returns IDEMPOTENCY_CONFLICT. Test a successful setup replay after the wheel has subsequently been unpaused.
- [x] For a new request only, require wheel.paused=true. No automatic pause or policy enablement occurs before this check.
- [x] Re-read locked evidence, classify all legacy candidates and recompute revision. If revision changed or any blocker exists, throw and rollback everything.
- [x] Enable/upsert the exact policy and perform classified imports in the same transaction:

```sql
INSERT INTO session_attendance_policies (event_id, session_id, mode, enabled)
VALUES ($1, $2, 'daily', true)
ON CONFLICT (event_id, session_id)
DO UPDATE SET mode = 'daily', enabled = true, updated_at = clock_timestamp();

INSERT INTO session_daily_checkins
  (id, registration_session_id, attendance_date, checked_in_at,
   checked_in_by, legacy_source_key)
VALUES (gen_random_uuid(), $1, $2::date, $3::timestamptz, $4, $5);
```

Bind the second statement from proven server-read source evidence, not the setup body. Do not use DO NOTHING to silently hide a revalidation conflict; constraints remain the final defense.

- [x] Preserve original legacy fields. Count alreadyImported/alreadyCovered separately. Assert active daily uniqueness, completed import classification, original entitlement count unchanged, and no change to existing cancelled rows before committing.
- [x] Add `attendance_setup` audit with actor/time/reason, request hash, before/after policy, source manifest digest, imported IDs/counts and saved public result. Public audit summary contains counts; avoid including QR secrets or participant PII in generic wheel audit snapshots.
- [x] Map only expected lock-timeout PostgreSQL codes to ATTENDANCE_SETUP_BUSY; rollback and keep key for retry. Unexpected DB errors remain server failures without credential/SQL leakage.
- [x] Test 100 identical concurrent requests: one setup/audit/import, all retries return original result. Two independently keyed requests from the same stale preview must not create duplicates; one may succeed, the stale one must reload.

```ts
const results = await Promise.all(
  Array.from({ length: 100 }, () =>
    setupWheelAttendance(database, admin, fixture.eventId, input),
  ),
);
assert.equal(results.filter((result) => !result.replayed).length, 1);
assert.equal(await countSetupAudits(fixture.eventId), 1);
assert.equal(await countImportedSource(fixture.entitlementId), 1);
```

Test helpers countSetupAudits/countImportedSource belong to the integration fixture; no product endpoints are added for them.

- [x] Run setup integration, readiness tests, attendance fence tests, and API build.

**Gate:** Exactly one atomic audited setup; all conflicts roll back; no fabricated history, no cancelled-source resurrection, no changed source/entitlement/stock.

## Task 5 — Authenticated setup API and admin state

**Files:** Modify `conference-api/src/modules/lucky-wheel/routes.ts`, `schemas.ts`, `routes.test.ts`, `service.ts`, `access.ts`; create `attendance-setup.routes.test.ts` for the new setup contract assertions.

**Consumes:** setupWheelAttendance; readAttendanceReadiness; existing admin route/request guard.

**Produces:** POST attendance-setup and `attendanceReadiness` in existing GET wheel state.

- [x] Add strict schema:

```ts
export const attendanceSetupBodySchema = z
  .object({
    mainSessionId: z.number().int().positive(),
    expectedReadinessRevision: z.string().regex(/^[a-f0-9]{64}$/),
    reason: z.string().trim().min(1).max(500),
    idempotencyKey: z.string().uuid(),
  })
  .strict();
```

- [x] Add route dependency injection for setup tests following LuckyWheelRouteOptions conventions. RequireAdminFromRequest derives actor; eventId comes from validated path. Request cannot nominate actor/user/date/scanner.
- [x] Add POST route with no-store, existing account-based admin rate limiter, bodyLimit 4 KiB, 201 new/200 replay, existing WheelError handling and redacted logs.
- [x] Extend readAdminWheelState with attendanceReadiness. Keep GET observational; creating wheel still creates no policy/history.
- [x] Add tests for unauthenticated/non-admin/inactive actor, wrong event, extra body properties, blank reason, malformed revision/key and correct role-derived actor. Test response codes, no-store and replay semantics.
- [x] Run routes/setup integration/API build.

**Gate:** Admin contract complete and tested against actual service, no new schema required. Add setup-only codes to WheelError without changing legacy client contracts unintentionally.

## Task 6 — Runtime prerequisites and first passing commit batch

**Files:** Modify `conference-api/src/modules/lucky-wheel/access.ts`, `types.ts`, `service.ts`, `qr-credits.ts`, `service.integration.test.ts`, `qr-credits.integration.test.ts`, `routes.test.ts`, `load.integration.test.ts` and affected wheel fixture bootstrap.

**Consumes:** exact daily policy/binding; Task 5 error contract.

**Produces:** requireDailyAttendanceReady and consistent guards.

- [x] Add failing assertions: missing or disabled daily policy returns ATTENDANCE_SETUP_REQUIRED, while enabled policy with no check-in returns CHECKIN_REQUIRED.
- [x] Implement requireDailyAttendanceReady for exact event/session, mode='daily', enabled=true and valid binding. Use a read query; do not import or enable anything during eligibility.
- [x] Call prerequisite before accepting a new QR claim or spin and before admin opens a QR or unpauses the wheel. Pausing, closing QR, downloading QR, reading historical results/proofs, preparing prizes and editing schedules remain possible without daily policy.
- [x] Add prerequisite to getEligibility. Current-result/idempotent replay paths must still return an already-committed credit/spin/result even if policy later becomes unavailable; do not hide awards or create second allocations. Preserve existing claim replay's spent/revoked/prior-day states; missing prerequisite can mark an unspent existing credit blocked.
- [x] Preserve all account/registration/entitlement/day/check-in/stock checks. No legacy fallback and no daily-play limit reintroduced.
- [x] Update wheel/load fixtures to create the real policy when expecting an enabled activity. Add a dedicated no-policy case; do not remove guards just to retain old fixture assumptions.
- [x] Run complete affected API/attendance suites sequentially on their respective test DBs, then API build.
- [x] Record T01–T06 evidence and commit API changes with title/body. No push.

Suggested title: `fix(lucky-wheel): require explicit daily attendance setup`.

**Gate:** Configuration vs participant failure distinguished; denied operations make no claim/spin/stock mutation; historical/idempotent results remain accessible.

## Task 7 — Backoffice readiness and reviewed setup action

**Files:** Create `conference-backoffice/src/components/lucky-wheel/AttendanceSetup.tsx`; modify `src/app/lucky-wheel/page.tsx`, `src/lib/api.ts`, `src/types/lucky-wheel.ts`; create focused pure helper tests only for setup retry/revision state if extracting such logic is necessary.

**Consumes:** attendanceReadiness in AdminWheelState and Task 5 POST.

**Produces:** Explicit setup card and mutation UI using actual API.

- [x] Mirror public contracts exactly; add `api.luckyWheel.setupAttendance(token,eventId,input)`.
- [x] Render readiness card above wheel configuration with existing Backoffice cards/buttons/dialog patterns. Show Main Session name/ID, policy status, confirmed entitlement count, pending imports and blocker counts.
- [x] Readiness missing/error means unknown/unavailable, never green-ready. Disable setup when blockers, missing revision, busy, or wheel unpaused; explain required pause using the existing pause control.
- [x] Dialog states exact session, imported-history count, preservation of source data, and that QR/play remain controlled separately. Require reason and admin confirmation; do not expose arbitrary session/date/participant selectors.
- [x] Build request from server-bound session/revision, generated UUID and reason. Retain the exact request/key after an uncertain network result. Retry same request; do not silently generate a new key/revision while uncertain. On known STALE reload and require review/new confirmation; on successful replay show recorded result.

```ts
const input = pendingRequest ?? {
  mainSessionId: readiness.mainSessionId,
  expectedReadinessRevision: readiness.revision,
  reason: reason.trim(),
  idempotencyKey: crypto.randomUUID(),
};
```

- [x] After success reload admin state, display imported/alreadyImported/alreadyCovered counts and actor/time from audit. A refresh failure reports setup succeeded but state needs reload; never report mutation failure or automatically repeat with a new key.
- [x] Expose recognized blocker labels in Thai and explain that data conflicts require admin reconciliation. No fake repair/missing-entitlement grant action is added.
- [x] Run scoped ESLint, tsc --noEmit and production build; inspect desktop/mobile layout against real synthetic API state before marking visual verification PASS.

**Gate:** No local fake readiness; action review/uncertain retry/stale flow correct and accessible.

## Task 8 — Backoffice opening and scanner consistency

**Files:** Modify `conference-backoffice/src/app/lucky-wheel/page.tsx`, `src/components/lucky-wheel/QrRights.tsx`, `src/app/checkin/page.tsx`, `src/app/checkins/page.tsx` only where actual verification identifies missing daily-mode refresh/label behavior.

**Consumes:** runtimeReady and existing server attendanceMode/serverDate responses.

**Produces:** Correct prerequisite warnings, server-day scanning UI, clear independent QR state.

- [x] Disable Open activity/Open QR when runtimeReady=false and explain setup requirement. Keep Pause, Close QR, QR download and preparation paths usable. Backend guards from T06 remain authoritative.
- [x] Keep QR status separate from policy. A closed QR must say closed; enabling attendance never opens it. Configured day selection/download behavior from previous work remains unchanged.
- [x] Scanner label for daily Main Session: `Main Session — เช็คอินวันที่ <serverDate>`. Use API date, not browser Date.now to determine attendance day.
- [x] Ensure refreshing stats or reselecting Main Session after setup refreshes attendanceMode. Do not hide a single-session response while displaying a misleading daily label.
- [x] Verify selected session, assigned session and check-all responses show daily attendance ID/date for Main Session and single mode for the workshop.
- [x] Verify checkins list/date filter/export and undo target the correct daily attendance ID. Only fix defects established during this verification; don't redesign unrelated reports.
- [x] Run scoped ESLint, tsc and Backoffice build; browser verify warnings, dialog, scanner server date and mobile layout.

**Gate:** Admin cannot overlook missing policy; QR status is explicit; scanners display mode/date returned by server.

## Task 9 — Participant setup-specific errors and recovery

**Files:** Modify `Pris2026/src/lib/luckyWheel.ts`, `src/lib/luckyWheel.test.ts`, `src/components/lucky-wheel/ActivityTicket.tsx`, `src/app/[locale]/lucky-wheel/claim/page.tsx`, `messages/th.json`, `messages/en.json`.

**Consumes:** ATTENDANCE_SETUP_REQUIRED from API.

**Produces:** Consistent TH/EN system-configuration message, preserving participant checks.

- [x] Add new code to type/error coverage and message mapping for claim and eligibility.
- [x] Thai copy: `กิจกรรมยังตั้งค่าระบบเช็คอินไม่ครบ กรุณาติดต่อเจ้าหน้าที่`.
- [x] English copy: `The activity's check-in setup is not ready. Please contact staff.`
- [x] For this configuration error do not tell the participant to check in again or imply ticket ownership is invalid. Keep CHECKIN_REQUIRED's ticket link for genuine missing daily attendance.
- [x] Add a user-triggered retry to the configuration-error claim state. Re-read/claim the same QR through existing authenticated flow; no credit is created locally. Preserve uncertain-outcome handling and per-QR duplicate protection.
- [x] Test error normalization and code/message mapping for configuration vs check-in vs closed QR; keep non-owner and network tests unchanged.
- [x] Run npm test, scoped ESLint, tsc --noEmit and production build in PRIS.

**Gate:** Attendee receives accurate cause and can retry after admin repair without duplicate rights.

## Task 10 — Test the real scan API and reports

**Files:** Modify `conference-api/src/routes/backoffice/checkins.ts` only to accept optional database through plugin options; create `src/modules/attendance/checkin-flow.integration.test.ts`; extend `src/modules/attendance/readers.integration.test.ts` when coverage gaps are found.

**Consumes:** Shared fenced writer, setup service, real route validation/readers.

**Produces:** Real route-level regression proof without mocking the attendance write.

- [x] Import existing db as defaultDb and resolve `const db = options.database ?? defaultDb` inside the route plugin. Production registration passes no override. Do not replace authentication/authorization or change URL contracts.
- [x] Register real checkins plugin in Fastify with guarded test database and an authenticated synthetic request actor. Use actual synthetic registrations/entitlements; avoid stubbing checkInSession.
- [x] Test selected Main Session, assigned staff Main Session and checkInAll paths. Assert daily response, persisted daily ID and server attendance date; workshop remains single.
- [x] Test 100 concurrent scans: one active daily row; first timestamp preserved; duplicates return ALREADY_CHECKED_IN with original date/time.
- [x] Test a previous day's daily row and unchanged original QR/entitlement: today's scan creates today's row even when legacy checked_in_at is non-null.
- [x] Test daily cancellation/re-check-in and date-scoped reports: cancellation on today does not change yesterday; one active row after re-check-in; unique attendees and occurrence totals retain different meanings.
- [x] Test confirmed status, missing entitlement, unassigned staff and session-time rejection. None creates history.
- [x] Run real-route flow/readers/attendance tests against attendance_readiness_test and API build.

**Gate:** Actual API scan paths and reports work after explicit setup; no fixture-only shortcut proves the flow.

## Task 11 — Complete QR/spin flow and cutover races

**Files:** Create `conference-api/src/modules/lucky-wheel/attendance-flow.integration.test.ts`; extend `attendance-setup.integration.test.ts`, `qr-credits.integration.test.ts`, `load.integration.test.ts` only for relevant coverage.

**Consumes:** Real setup + scanner + claim/spin + daily cancellation services/routes; synthetic published wheel/stock/day/QR.

**Produces:** End-to-end evidence and cutover concurrency proof.

- [x] Build synthetic confirmed account/entitlement, paused published wheel, initial physical prize stock, today's server-derived day window and initially closed QR. Do not seed daily history for the main happy path.
- [x] Before setup: open/unpause/claim/eligibility are blocked by ATTENDANCE_SETUP_REQUIRED, with no mutation.
- [x] Run admin setup, assert no attendance invented for a user with no legacy timestamp, then scan through actual checkins route. Open activity and reviewed QR through real admin services/routes.
- [x] Claim QR-A once, claim it again, claim QR-B once; assert two credits total and one per QR/account. Spin twice; assert two credits spent and stock allocated twice. A third spin must require credit.
- [x] Test import path separately: actual legacy timestamp/scanner → setup → owned QR claim succeeds without asking for a duplicate scan; source timestamp and original ticket remain unchanged.
- [x] Test cancellation before an unspent credit's spin blocks without spending; same-day re-check-in restores usability of the original credit but does not allow another QR-A claim. Cancellation after committed spin does not refund rights/stock or remove reward.
- [x] Test paused/out-of-stock/closed QR/outside window and prior-day expiry; reject with correct code and no unintended credit/stock mutation. QR download never grants a credit or opens QR.
- [x] Midnight pure boundary assertions plus DB tests with previous-day rows:

```ts
assert.equal(bangkokDay(new Date("2026-10-05T16:59:59.999Z")), "2026-10-05");
assert.equal(bangkokDay(new Date("2026-10-05T17:00:00.000Z")), "2026-10-06");
```

Do not mutate a shared server clock. Derive today's integration windows from PostgreSQL clock; clients do not nominate attendance dates.

- [x] Hold setup's exclusive fence, queue scans, release and assert scans re-read daily policy. Hold an in-flight legacy scan's shared fence, start setup and assert setup waits then rejects ATTENDANCE_SETUP_STALE with zero setup writes and preserves the committed scan. Reload/review the new revision and submit a new command/key; import succeeds exactly once, including replay (user-approved T11 amendment). Add cancelled-source and two-admin setup races.
- [x] Recheck SQL invariants: duplicate active daily attendance=0; duplicate account/QR claims=0; duplicate credit spends=0; negative stock=0; original entitlement/ticket count unchanged; source data unchanged; setup audit exactly once.
- [x] Run complete wheel suite on wheel_readiness_test, then attendance flow suites on attendance_readiness_test; no parallel destructive fixtures.

**Gate:** Proven flow starts with missing policy and ends with server-recorded claims/spins; race protections survive real concurrent connections.

## Task 12 — Runbook, reviewed local repair, final verification and commits

**Files:** Modify `conference-api/sql/lucky-wheel-setup/README.md`, `00_readiness.sql`, `01_backfill_daily_attendance.sql`; update acceptance ledger in PRIS.

**Consumes:** Passing T01–T11, exact current target inventory and authorized operational repair.

**Produces:** Current runbook, reproducible evidence, explicit environment state, committed implementation.

- [x] Update runbook to current shared-QR-credit rules and simplified prize pickup. Remove obsolete once-per-day spin, mandatory collection deadline and zero-initial-stock instructions.
- [x] Make readiness SQL explicitly scoped to reviewed `event_id`/`main_session_id`, with identity/PRIS/Main Session mismatch rejection. Do not use hardcoded Local IDs or dump participant details into generic logs.
- [x] Replace the historical standalone backfill mutation entry point with a clearly documented scoped read-only candidate/conflict inventory. Actual activation/import must use the audited admin service, avoiding an unfenced second live writer. Retain the file; do not silently execute historical write SQL from the new runbook. Adapt the old attendance integration test to exercise import through setup rather than expecting the retired unscoped SQL writer.
- [x] Deployment order: backup/restore proof → verify 0033–0036 → deploy every writer with shared fence → verify version and paused wheel → review readiness → admin setup/import → validate daily scanning → configure/open appropriate day QR → controlled claim/spin verification.
- [x] Record rollback behavior: leave schema/history/source data intact; pause wheel and close new claims if needed. Do not revert daily policy or restore an old single-session writer after live daily attendance without a separate reviewed incident decision.
- [x] Before any Local repair, re-read DATABASE_URL target without showing credentials; confirm selected event/session by code and wheel binding, not prior observations. Take targeted/full backup and verify it. Use an authenticated admin through the new endpoint; record actual actor/reason and pre/post evidence. The implementation request must authorize this operational step; if authorization is absent, finish code/tests and ask once with concrete target details.
- [x] For the photographed Local incident, import only proven legacy history via setup. Do not open today's QR automatically. If opening that QR has been explicitly authorized, use the existing admin status endpoint for the exact named/date-reviewed QR. Otherwise report its closed state as an intentional remaining operational action.
- [x] Railway activation is a separate environment step. If newest writer deployment is not verified, record schema-ready but policy not enabled. Do not push/deploy or enable policy there under a Local-only implementation request.
- [x] Verify actual browser UI against authenticated Local/test API: setup preview, uncertain retry, state reload, daily scanner, claim error distinction, open QR, owned credits/history. Never alter admin passwords to bypass a login blocker. Ask user to log in or record the check as NOT VERIFIED and stop the dependent gate.
- [x] Run final automated commands, with each API suite's TEST_DATABASE_URL set to its guarded test target:

```powershell
# conference-api, destructive wheel fixtures only
$env:TEST_DATABASE_URL='postgres://wheel_test:wheel_test@127.0.0.1:65436/wheel_readiness_test'
npx tsx --test --test-concurrency=1 src/modules/lucky-wheel/policy.test.ts src/modules/lucky-wheel/routes.test.ts src/modules/lucky-wheel/service.integration.test.ts src/modules/lucky-wheel/qr-credits.integration.test.ts src/modules/lucky-wheel/rewards.test.ts src/modules/lucky-wheel/rewards.integration.test.ts src/modules/lucky-wheel/images.test.ts src/modules/lucky-wheel/day-schedule.integration.test.ts src/modules/lucky-wheel/migration.integration.test.ts src/modules/lucky-wheel/load.integration.test.ts

# conference-api, reviewed full-schema synthetic attendance target
$env:TEST_DATABASE_URL='postgres://wheel_test:wheel_test@127.0.0.1:65436/attendance_readiness_test'
npx tsx --test --test-concurrency=1 src/modules/attendance/readiness.test.ts src/modules/attendance/readiness.integration.test.ts src/modules/attendance/cutover-lock.integration.test.ts src/modules/attendance/service.integration.test.ts src/modules/attendance/readers.integration.test.ts src/modules/attendance/checkin-flow.integration.test.ts src/modules/lucky-wheel/attendance-setup.integration.test.ts src/modules/lucky-wheel/attendance-setup.routes.test.ts src/modules/lucky-wheel/attendance-flow.integration.test.ts
npm run build

# conference-backoffice
npx eslint src/app/lucky-wheel/page.tsx src/components/lucky-wheel/AttendanceSetup.tsx src/components/lucky-wheel/QrRights.tsx src/app/checkin/page.tsx src/app/checkins/page.tsx src/lib/api.ts src/types/lucky-wheel.ts
npx tsc --noEmit
npm run build

# Pris2026
npm test
npx eslint src/lib/luckyWheel.ts src/components/lucky-wheel/ActivityTicket.tsx 'src/app/[locale]/lucky-wheel/claim/page.tsx'
npx tsc --noEmit
npm run build
```

Run commands from their owning repo; check every exit code rather than letting PowerShell continue after a failure. If a named test file is consolidated into another listed file during implementation, update the canonical command and ledger before running; no phantom test evidence.

- [x] Inspect all diffs, git diff --check, schema/data invariants and coverage matrix below. Mark every gate with actual evidence, including any prerequisite re-tests.
- [x] Commit T07–T12 per repo with title/body, and API remainder since T06. Suggested titles: `feat(backoffice): add reviewed daily attendance setup`, `fix(pris): distinguish incomplete attendance setup`, `test(lucky-wheel): verify attendance cutover through QR and spin`.
- [x] Verify Git status after commits; no push/deploy. Report all commit hashes, test results and actual environment policy/QR state. Ask before container/volume deletion; retain backups. Code completion and live event activation are separate outcomes.

**Gate:** Automated checks pass; browser results honestly recorded; authorized data repair verified; runbook no longer bypasses audited/fenced setup; commits complete.

## Acceptance coverage matrix

| Requirement                                        | Tasks               | Proof                                                                           |
| -------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------- |
| Original Main Session/ticket/entitlement preserved | T02,T04,T10,T11,T12 | Same IDs/counts; no extra grants/sessions                                       |
| Explicit admin policy setup                        | T04,T05,T07         | Authenticated audited transaction; no GET/init side effect                      |
| Evidence-only historical import                    | T02,T04,T11         | Correct UTC→Thai day/scanner; no fabricated rows                                |
| No duplicates/resurrection                         | T02,T04,T10,T11     | Source and active-day uniqueness; cancelled sources remain cancelled            |
| Safe concurrent cutover                            | T03,T04,T11         | Shared/exclusive fence barriers and row-lock revalidation                       |
| Accurate readiness/error                           | T02,T05,T06,T07,T09 | Configuration error differs from missing participant check-in                   |
| QR state independent                               | T06,T08,T11,T12     | Closed QR stays closed through setup; download grants nothing                   |
| One account/QR, multiple credits                   | T11                 | QR-A duplicate denied, QR-B adds one, multiple spins spend separate credits     |
| Thai daily semantics and reports                   | T10,T11             | Current server day, previous-day separation, correct distinct/occurrence counts |
| Workshops unchanged                                | T03,T10             | Single mode and previous duplicate-scan behavior preserved                      |
| Reward/stock/history retained                      | T06,T11,T12         | No refund/deletion; replay and owner proof still work                           |
| Local/Railway operations distinguished             | T01,T12             | Reviewed URL/IDs/version/backup per environment                                 |

## Stop conditions

Stop at an unexpected schema requirement, contradictory existing lock order, unknown live writer version, ambiguous legacy cancellation/time/scanner evidence, missing entitlement/account ownership, unreviewed target, failed restore, failed test, or unavailable required authentication. Report target, decisive evidence, unchanged state and smallest needed decision. Do not silently switch to legacy eligibility, fabricate attendance, mock the backend contract, deploy, grant rights, or overwrite history to pass a gate.

## Completion report

Report task PASS states from the acceptance ledger, original/source-data preservation evidence, policy/import/QR status for each actually touched environment, passing tests/builds, unperformed browser/device checks, backup/container retention and commit hashes. Keep the summary short; link this plan and the ledger for full detail.
