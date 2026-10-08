# PRIS2026 Lucky Wheel — Approved B Implementation Plan

> Execute Tasks 1–12 sequentially using checkbox (`- [ ]`) tracking and the execution gates below. Use brainstorming to check alignment at every stage. The approved plan and design B remain the implementation boundary.

**Goal:** Let each eligible PRIS account spin once per Bangkok day after today's scan of its existing Main Session QR, receive an atomic allocation and collect it once, using approved mobile composition B.

**Architecture:** Extend the existing PostgreSQL/Fastify API with scoped daily attendance and a transactional wheel module. Keep original entitlements and QR payloads; retain historical daily attendance, configuration snapshots, allocations and audited redemption corrections. Extend the existing backoffice and PRIS app; R2 stores only new wheel images.

**Tech Stack:** TypeScript, Fastify, Drizzle/PostgreSQL/postgres-js, Zod, Next.js/React, existing TH/EN routing, qrcode.react and existing scanner/export components. Tests use node:test/tsx and dedicated PostgreSQL integration databases. Additional runtime packages are limited to the S3 client and image decoding/normalization actually needed by the R2 upload path.

## Global Constraints

- Approved spec: `D:/confer/confer/conference/Pris2026/docs/superpowers/specs/2026-10-03-lucky-wheel-design.md`.
- Approved UI: `D:/confer/confer/conference/Pris2026/.impeccable/mocks/lucky-wheel-b.png` and its JSON approval sidecar; detailed visual brief: `D:/confer/confer/conference/Pris2026/docs/superpowers/specs/2026-10-03-lucky-wheel-surface-brief.md`.
- One PRIS account per event per Bangkok calendar day. Multiple registrations do not grant extra spins.
- Reuse the ONE existing Main Session, existing registration-session entitlements and existing registration QR.
- Daily attendance is enabled only for the explicitly configured PRIS event/Main Session pair.
- All confirmed registration types qualify when the owner has valid attendance for the configured Main Session today.
- Stock is one shared pool throughout the event, no daily quotas, no automatic reset/refill.
- Each eligible segment has probability 1/N. No-prize segments are unlimited. Sold-out/disabled segments have probability zero.
- If no enabled physical-prize segment has stock, return OUT_OF_STOCK without consuming a right, even if no-prize segments remain.
- All wheel management and redemption operations are ADMIN ONLY in phase one. Ordinary attendance staff retain existing attendance scope.
- Window: start <= serverNow < end for the configured Main Session. No invented daily opening-hours window. A multi-day session interval includes overnight hours.
- No production data changes, migrations, R2 provisioning, deployments or live prize allocation during local implementation/testing.
- Existing unrelated user changes must be preserved. Current checkout is suitable; do not create three worktrees merely for a matching task name.
- No extra store, queue, worker, global auth rewrite, GraphQL layer, daily reset cron or sample prize seed in production.

## Repository ownership and checkpoints

Workspace root is `D:/confer/confer/conference`. The root is not a usable Git repository; the applications are separate repositories. Run Git/build commands in the named application directory. This plan and approved spec live in Pris2026 and cover all three apps. References below use exact paths relative to the named repository.

Stages are independently reviewable:

1. **Attendance foundation:** Tasks 1–4. Works without a visible wheel and proves original QR compatibility.
2. **Wheel/stock/redemption administration:** Tasks 5–9. Proves API guarantees and admin operation before exposing a spin button.
3. **Attendee UI B and release proof:** Tasks 10–12. Integrates the approved design only against tested contracts.

Do not mark a task complete on mocked happy-path evidence alone when it owns a database invariant. At each task, run the indicated targeted checks, inspect the scoped diff and record the result. Never stage unrelated changes. A task that changes only documentation requires document validation, not an unrelated application test run.

### Mandatory execution and test gates

- Stay within this plan and its approved requirements. On a conflict, ambiguous requirement that needs a decision, or required scope change, stop implementation immediately, summarize the evidence and impact, and ask the user. Do not silently reinterpret the plan or choose an unapproved workaround.
- Use brainstorming before each task, during decisions and when reviewing its result to verify alignment. Do not reopen approved choices or introduce new features. Use impeccable and frontend-design for the planned UI work and api-design-principles for API contracts. Use caveman only for chat updates and final summaries; keep code, tests, documents and commit messages complete and normally written.
- Track each task as PENDING, RUNNING, DEFERRED_DEPENDENCY, PASS or BLOCKED. Check a step only when its actual work and required verification are complete. Record commands, environment, exit/results and evidence in `Pris2026/docs/superpowers/verification/lucky-wheel/acceptance.md`; do not record credentials or production PII.
- After each task, run its required checks and fix in-scope failures until they pass before starting the next task. Never skip, weaken or replace a required integration check with a mock merely to obtain a pass.
- The sole task-order exception is a demonstrated dependency on an explicitly planned later task. Record the failing task/check, exact failure, causal evidence, dependency task number and retest trigger; mark DEFERRED_DEPENDENCY and continue in planned order. This exception is already authorized and does not require another approval. Missing infrastructure, unknown failures or unrelated baseline errors are not automatically later-task dependencies.
- Immediately after the dependency task passes, rerun all checks it unblocks, oldest deferred task first, and fix failures until they pass BEFORE starting another task. If a separate later dependency is demonstrated, record it explicitly; never silently carry a deferred item forward. An unresolved cycle or change outside the plan is BLOCKED and requires the user's decision.
- A missing required database, credential, device or provider check remains unverified. Complete other independent checks within the current task, then stop and ask for what is needed; do not mark the task PASS or proceed beyond its gate without an explicit user-approved change. Do not ask for secrets in chat.
- At a conflict stop, report task/step, expected versus observed behavior, evidence, impacted requirements, safe options and the exact decision needed. Preserve existing work; do not make destructive changes to get past the blocker.

### Commit checkpoints — local only

- Default logical batches: Tasks 1–6, then Tasks 7–12. Commit the first batch only when every included task is PASS and no required check/deferred dependency remains unresolved. A batch boundary may move to include 6–7 coherent tasks when a recorded planned dependency requires it (for example Tasks 1–7 then the remaining Tasks 8–12); record why. The final remainder may be smaller.
- These are three separate Git repositories. At each logical checkpoint create a separate commit in each repository with relevant changes; skip repositories with no changes. Stage explicit relevant paths, inspect staged diffs, and preserve unrelated user changes. One Git commit cannot span the three repositories.
- Every commit must have a meaningful title AND body. The body states task numbers, behavior changed, verification actually run and material limitations. Record each repository, commit SHA, title and body in the execution evidence. Do not claim skipped checks passed.
- Do not create a separate commit after every task. Do not commit a failing/unfinished batch, amend earlier commits, reset history, push, deploy or apply production migrations. Continue immediately after each successful checkpoint until the plan is complete or a genuine blocker requires the user.
- Complete the final batch commit only after Task 12 AND the separate final comprehensive verification below pass, so that final integration fixes and evidence are included. If later planned work requires a correction to an earlier batch, include the correction in the current batch with its task reference and rerun affected checks; preserve prior commits.

## Verified incumbent files and non-obvious findings

| Repo / path                                                   | Existing responsibility / consequence                                                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| conference-api/src/database/schema.ts                         | users, registrations, registration_sessions, sessions, staff assignments; extend without cloning entitlements                 |
| conference-api/src/routes/backoffice/checkins.ts              | all three scan writers, list, stats and undo; every daily path must share one policy                                          |
| conference-api/src/schemas/checkins.schema.ts                 | current list/create/stats/undo validation                                                                                     |
| conference-api/src/routes/backoffice/registrations.ts         | registration-detail checkedInAt reader                                                                                        |
| conference-api/src/modules/session-grants/test-database.ts    | existing dedicated TEST_DATABASE_URL guard; reuse safe URL validation; do not invoke its destructive reset against runtime    |
| conference-api/src/modules/session-grants/invitation-token.ts | existing AES-GCM token-envelope pattern; reuse pattern without importing invitation-specific errors or secret                 |
| conference-api/src/index.ts                                   | route registration, JWT, CORS, multipart, IP-based global rate limit                                                          |
| conference-api/drizzle/0032_admin_session_invitations.sql     | latest numbered application migration observed; reserve 0033/0034 after rechecking at execution                               |
| conference-api/drizzle/meta/_journal.json                     | ends at 0007 despite later SQL files: do not assume journal migration covers manually managed SQL                             |
| conference-backoffice/src/app/checkin/page.tsx                | scanner, session selection, daily header and recent rows                                                                      |
| conference-backoffice/src/app/checkins/page.tsx               | date-filtered list, exportToExcel, undo; current row.id is registration-session identity                                      |
| conference-backoffice/src/app/registrations/[id]/page.tsx     | admission history summary                                                                                                     |
| conference-backoffice/src/app/reports/page.tsx                | attendance is currently synthetic; replace the attendance portion with live results, do not certify unrelated revenue samples |
| conference-backoffice/src/lib/api.ts                          | central client and ApiError, auth failure event, check-in contracts                                                           |
| Pris2026/src/lib/entryTicket.ts                               | ticket reader AND ticket-specific return query; do not break existing callers when generalizing return journeys               |
| Pris2026/src/lib/refreshRedirect.ts                           | exempts ticket/invitation routes from global reload-to-home behavior                                                          |
| Pris2026/src/components/layout/Header.tsx                     | route light-surface classification and original shared logo                                                                   |
| Pris2026/src/components/layout/Footer.tsx                     | existing exact ticket/login/signup exclusions                                                                                 |
| Pris2026/src/app/[locale]/ticket/ticket.module.css            | current white/orange/black ticket visual source; its fixed aspect-ratio is NOT a wheel requirement                            |
| Pris2026/messages/th.json and en.json                         | actual locale message paths                                                                                                   |

## Contract names used by all tasks

Names below are proposed additions. Keep these consistent across tasks; route readers serialize dates to ISO strings and SQL dates to YYYY-MM-DD.

```ts
export type Actor = { id: number; role: string };
export type SegmentKind = "prize" | "no_prize";
export type AttendancePolicy = "single" | "daily";
export type AttendanceState = {
  policy: AttendancePolicy;
  registrationSessionId: number;
  attendanceId: string | null;
  attendanceDate: string;
  checkedInAt: string | null;
  checkedInBy: number | null;
};
export type WheelSegment = {
  id: string;
  kind: SegmentKind;
  name: { th: string; en: string };
  imageKey: string | null;
  enabled: boolean;
  position: number;
  remaining: number | null;
};
export type SpinInput = {
  eventId: number;
  configurationVersion: number;
  poolRevision: number;
  idempotencyKey: string;
};
export type RedemptionInput = {
  eventId: number;
  spinId: string;
  claimGeneration: number;
  idempotencyKey: string;
  identityChecked: true;
  collectionPoint: string;
  deliveredDetails: string | null;
};
export type BlockCode =
  | "CHECKIN_REQUIRED"
  | "REGISTRATION_REQUIRED"
  | "ACCOUNT_UNAVAILABLE"
  | "SESSION_CLOSED"
  | "WHEEL_PAUSED"
  | "WHEEL_NOT_READY"
  | "OUT_OF_STOCK"
  | "ALREADY_SPUN"
  | "WHEEL_UPDATED"
  | "IDEMPOTENCY_CONFLICT"
  | "REDEMPTION_CLOSED"
  | "ADMIN_REQUIRED";
```

The attendee client must not import server modules. Mirror wire types in the two client feature modules or consume an existing shared-contract convention if one is found; do not introduce a new package solely to share these types.

## Task 1: Scoped daily-attendance schema and readiness query

**Files — conference-api:**

- Modify `src/database/schema.ts`.
- Create `drizzle/0033_pris_daily_attendance.sql`.
- Create `sql/lucky-wheel-setup/00_readiness.sql` and `sql/lucky-wheel-setup/README.md`.
- Create `src/modules/attendance/migration.integration.test.ts`.

**Interfaces:** Produces `sessionAttendancePolicies` and `sessionDailyCheckins` schema exports. A policy row contains eventId, sessionId, mode=daily and enabled; only an audited explicit setup enables the known PRIS pair, never every isMainSession row.

- [ ] Write a guarded migration test using the existing TEST_DATABASE_URL validator. Two transactions inserting the same active registrationSessionId/day must leave one active row. Cancellation then re-insert must preserve two historical rows and one active row. Re-running migration must retain both.
- [ ] Run `npx tsx --test src/modules/attendance/migration.integration.test.ts` in conference-api; before implementation it must fail on missing relation, and after implementation pass against a dedicated test database.
- [ ] Create the policy/check-in tables with foreign keys and cancellation consistency checks. The active uniqueness mechanism is exactly:

```sql
CREATE UNIQUE INDEX session_daily_checkins_active_day_unique
ON session_daily_checkins (registration_session_id, attendance_date)
WHERE cancelled_at IS NULL;

CREATE UNIQUE INDEX session_daily_checkins_legacy_source_unique
ON session_daily_checkins (legacy_source_key)
WHERE legacy_source_key IS NOT NULL;
```

- [ ] Store actual scan time as timestamptz, calendar date as date, scannedBy, cancelledAt/cancelledBy/reason and legacySourceKey. Do not use cascading deletion for attendance evidence referenced by spins. A cancellation is all-or-none and requires a nonblank reason. Add only useful indexes for entitlement/day history and date reports.
- [ ] Add this read-only readiness query and separate result sets for configured Main Sessions, null-user registrations and existing check-ins; no auto-repair write:

```sql
SELECT r.id, r.reg_code, r.user_id, s.id AS main_session_id,
       rs.id AS registration_session_id
FROM registrations r
JOIN events e ON e.id = r.event_id
JOIN sessions s ON s.event_id = e.id AND s.is_main_session = true
LEFT JOIN registration_sessions rs
  ON rs.registration_id = r.id AND rs.session_id = s.id
WHERE e.event_code = 'PRIS-2026'
  AND r.status = 'confirmed'
ORDER BY r.id, s.id;
```

- [ ] Add an explicit migration/setup runbook that accounts for the stale Drizzle journal. Never use db:push as proof that a manual SQL migration is applied. Verify expected tables/indexes from pg_catalog.
- [ ] Review schema and migration together; gate on constraints and preserved original entitlement counts. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 2: Shared daily scan writer, cancellation and legacy cutover

**Files — conference-api:**

- Create `src/modules/attendance/policy.ts`, `service.ts`, `service.integration.test.ts`, `policy.test.ts`.
- Modify `src/routes/backoffice/checkins.ts`, `src/schemas/checkins.schema.ts`.
- Create `sql/lucky-wheel-setup/01_backfill_daily_attendance.sql`.

**Interfaces:** `readAttendanceState(database, registrationSessionId, now): Promise<AttendanceState>`; `checkInSession(database, {registrationSessionId, actor}): Promise<{created: boolean; state: AttendanceState}>`; `cancelDailyCheckin(database, {attendanceId, actor, reason}): Promise<AttendanceState>`. The database argument is `typeof db` from the existing database module; internal transactions infer their own Drizzle type. Do not pass client time/day into the writer.

- [ ] Add a small runnable time-policy check, including the Bangkok midnight boundary and non-PRIS policy isolation:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { bangkokDay, isWithinSession } from "./policy.js";

test("server instants use Bangkok midnight and an exclusive session end", () => {
  assert.equal(bangkokDay(new Date("2026-10-29T16:59:59.999Z")), "2026-10-29");
  assert.equal(bangkokDay(new Date("2026-10-29T17:00:00Z")), "2026-10-30");
  const start = new Date("2026-10-29T02:00:00Z");
  const end = new Date("2026-10-30T10:00:00Z");
  assert.equal(isWithinSession(start, start, end), true);
  assert.equal(isWithinSession(end, start, end), false);
});
```

- [ ] Implement the tested pure helpers using UTC ISO day after the fixed Bangkok offset, or Intl parts with explicit timezone. Never depend on process locale:

```ts
export function bangkokDay(now: Date): string {
  return new Date(now.getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}
export function isWithinSession(now: Date, start: Date, end: Date): boolean {
  return start.getTime() <= now.getTime() && now.getTime() < end.getTime();
}
```

- [ ] Route all three scan modes through the writer. Resolve registration entitlement and existing role/event/session permissions server-side; reject non-confirmed records and out-of-window scans. Within a transaction lock the original entitlement, obtain database time, select policy and insert today's history with conflict handling. Duplicate scans return the existing active timestamp. Legacy sessions retain their once-per-session response/time behavior.
- [ ] Daily undo requires attendanceId/reason; keep legacy undo for ordinary sessions. Reject registrationSessionId-only undo for a daily-policy record. Preserve the non-admin five-minute cancellation restriction. Lock the targeted history row before cancelling; do not modify other dates or any spin/stock record.
- [ ] Implement repeat-safe backfill only during controlled cutover. Source time conversion and source identity are fixed:

```sql
SELECT rs.id,
       ((rs.checked_in_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok')::date AS attendance_date,
       rs.checked_in_at AT TIME ZONE 'UTC' AS checked_in_at,
       rs.checked_in_by,
       'registration_sessions:' || rs.id::text AS legacy_source_key
FROM registration_sessions rs
JOIN sessions s ON s.id = rs.session_id
JOIN session_attendance_policies p
  ON p.session_id = s.id AND p.event_id = s.event_id
WHERE p.mode = 'daily' AND rs.checked_in_at IS NOT NULL;
```

- [ ] Backfill inserts by legacy source key and active uniqueness; if existing history conflicts with a legacy source, report it for reconciliation instead of overwriting. Never re-import a cancelled legacy source. Activate only after the shared writer is deployed and cutover checks pass; do not update legacy checkedInAt on every daily scan, which would create false legacy history on retry.
- [ ] Integration checks: same QR day one/day two, concurrent same-day scans, cancellation/re-scan, invalid entitlement, batch with daily Main Session plus single workshop, staff assignment, server midnight, legacy actor/date preservation and migration replay after cancellation.
- [ ] Run `npx tsx --test src/modules/attendance/policy.test.ts src/modules/attendance/service.integration.test.ts` and existing check-in invitation-separation regression. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 3: Real daily readers, counts and exports

**Files — conference-api:** Create `src/modules/attendance/readers.ts` and `readers.integration.test.ts`; modify `src/routes/backoffice/checkins.ts`, `src/routes/backoffice/registrations.ts`, `src/schemas/checkins.schema.ts`.

**Interfaces:** `readAttendanceSummary(database, {eventId, sessionId, date, actor})` returns `serverNow`, `serverDate`, `selectedDate`, `eligibleRegistrations`, `checkedInPeopleOnDate`, `uniquePeople`, `attendanceOccurrences`, `unlinkedRegistrationCount`; `readAttendanceRows` returns discriminated single/daily rows plus stable pagination. Daily rows carry attendanceId and registrationSessionId separately.

- [ ] Fixture: one account with two registrations and active check-ins on two dates; another account with one attendance; one cancelled attendance and one null-user registration. Assert entitlement count is independent of daily join, user counts do not duplicate the two registrations, cancelled rows do not count as active attendance, and unresolved identities remain visible.
- [ ] Build counts from independent pre-aggregated sets, not one multiplying entitlement/history join. Attendance occurrences for identified participants use `(user_id, attendance_date)` distinct pairs for the configured Main Session. Example count source:

```sql
WITH active_people_days AS (
  SELECT DISTINCT r.user_id, c.attendance_date
  FROM session_daily_checkins c
  JOIN registration_sessions rs ON rs.id = c.registration_session_id
  JOIN registrations r ON r.id = rs.registration_id
  WHERE c.cancelled_at IS NULL AND r.status = 'confirmed'
    AND r.user_id IS NOT NULL
    AND r.event_id = $1 AND rs.session_id = $2
)
SELECT COUNT(DISTINCT user_id)::integer AS unique_people,
       COUNT(*)::integer AS attendance_occurrences,
       COUNT(DISTINCT user_id) FILTER (WHERE attendance_date = $3)::integer AS checked_in_people_on_date
FROM active_people_days;
```

- [ ] Validate ISO dates strictly; scope all reads by authorized event/session; allow active/cancelled/all history filters to authorized operators. Return unknown/loading/error distinctly from zero rows. Select today's default from server time.
- [ ] Extend registration detail with selected-day state and history; retain legacy summary field only as historical compatibility. Apply consistent event/session/date/university/search filters to list and export. Page through exports rather than assuming the first page is complete; serialize Bangkok date and ISO timestamps deliberately.
- [ ] Run `npx tsx --test src/modules/attendance/readers.integration.test.ts` and `npm run build`. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 4: Scanner, check-in list, registration detail and Reports UI

**Files — conference-backoffice:** Modify `src/lib/api.ts`, `src/app/checkin/page.tsx`, `src/app/checkins/page.tsx`, `src/app/registrations/[id]/page.tsx`, `src/app/reports/page.tsx`; reuse `src/lib/exportExcel.ts`.

**Interfaces:** Consume Task 3 response fields exactly. Current check-in row.id must no longer ambiguously identify both daily attendance and entitlement. API wrappers expose separate `undoDaily(attendanceId, reason)` and unchanged legacy `undo(registrationSessionId)`.

- [ ] Reuse native date input. Scanner header uses serverDate, labels daily policy explicitly, and refreshes server state when the tab resumes or server midnight is reached. Display duplicate time with “เช็คอินวันนี้แล้ว”; no attendance-date field in create requests.
- [ ] Add date/history filters and cancellation reason flow to the list and registration detail. Single sessions retain familiar single attendance UI. Cancel buttons target the row's actual daily attendance ID. Preserve cancelled rows in history.
- [ ] Replace only Reports attendance sample rows/totals with Task 3 data, including loading/error/retry and date selection. Do not present the existing unrelated mock revenue totals as verified live data; label any retained demonstration section explicitly where necessary.
- [ ] Export the currently applied filters and all matching rows, including attendance day, scan time, actor and cancellation fields as selected. Distinguish people counts, entitlement counts and occurrences in headings.
- [ ] Check with two fixture days, then a mixed-policy event, duplicate scan, rejected scan and cancelled row. Confirm the same original QR opens both days and no extra entitlement is created.
- [ ] Run `npx tsc --noEmit` and `npx eslint src/app/checkin/page.tsx src/app/checkins/page.tsx src/app/reports/page.tsx src/app/registrations/[id]/page.tsx src/lib/api.ts`; compare existing baseline warnings if encountered. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 5: Wheel tables, equal-slot policy and API validation

**Files — conference-api:** Modify `src/database/schema.ts`; create `drizzle/0034_lucky_wheel.sql`, `src/modules/lucky-wheel/types.ts`, `schemas.ts`, `policy.ts`, `policy.test.ts`, `migration.integration.test.ts`.

**Interfaces:** Types at the top of this plan; `candidateSegments(segments: WheelSegment[]): WheelSegment[]`; `chooseSegment(segments, draw: (max: number) => number): WheelSegment`. Production injects `randomInt`, tests supply exact draw indices.

- [ ] Policy assertions cover zero physical stock plus unlimited losing slots, disabled real stock, duplicate losing labels, preserved segment ordering, one eligible prize, and each possible candidate index. No stochastic pass/fail test that requires equal observed counts in a short run.

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { candidateSegments } from "./policy.js";
import type { WheelSegment } from "./types.js";

test("no physical stock closes a wheel even with unlimited no-prize slots", () => {
  const segments: WheelSegment[] = [
    {
      id: "pen",
      kind: "prize",
      name: { th: "ปากกา", en: "Pen" },
      imageKey: null,
      enabled: true,
      position: 0,
      remaining: 0,
    },
    {
      id: "lose",
      kind: "no_prize",
      name: { th: "เสียใจด้วย", en: "No prize" },
      imageKey: null,
      enabled: true,
      position: 1,
      remaining: null,
    },
  ];
  assert.deepEqual(candidateSegments(segments), []);
  segments[0].remaining = 1;
  assert.deepEqual(
    candidateSegments(segments).map((s) => s.id),
    ["pen", "lose"],
  );
});
```

- [ ] Implement candidate calculation without mutating the displayed configuration:

```ts
export function candidateSegments(segments: WheelSegment[]): WheelSegment[] {
  const live = segments.filter(
    (s) => s.enabled && (s.kind === "no_prize" || (s.remaining ?? 0) > 0),
  );
  return live.some((s) => s.kind === "prize") ? live : [];
}
```

- [ ] Tables: `lucky_wheels` (event/Main Session, enabled/paused, version/pool revision, published configuration, collection instructions/deadline); `lucky_wheel_segments` (stable identities and live stock/type); `lucky_wheel_spins` (immutable allocation/evidence/request snapshot); `lucky_wheel_audit_events` (publication, pause, stock and deadline audit); `lucky_wheel_redemptions` plus correction history; `lucky_wheel_images` for validated owned object references. Use JSONB for the published display configuration and per-spin snapshot rather than a future multi-draft CMS.
- [ ] Add unique (event_id,user_id,play_date), unique request keys scoped by actor/event/operation, foreign keys with historical preservation, stock >= 0 and type/quantity consistency checks. No-prize quantity is NULL, never an arbitrary huge integer. Validate event/Main Session relationship and timestamps before enabling.
- [ ] Validate body with Zod `.strict()`, UUID keys, positive integer versions, nonblank bounded bilingual names/reasons, enum kind, unique segment IDs/order and stock integer limits. No request body accepts winner/userId/time. Physical stock edits only through stock-adjustment endpoint; publication cannot set remaining.
- [ ] Run `npx tsx --test src/modules/lucky-wheel/policy.test.ts src/modules/lucky-wheel/migration.integration.test.ts` and build. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 6: Atomic publication, stock, pause and spin

**Files — conference-api:** Create `src/modules/lucky-wheel/service.ts`, `routes.ts`, `service.integration.test.ts`, `routes.test.ts`; modify `src/index.ts` and logging redaction configuration as needed.

**Interfaces:** `publishWheel(database, actor, eventId, expectedVersion, configuration)`; `adjustStock(database, actor, eventId, segmentId, delta, reason, idempotencyKey)`; `setWheelPaused(database, actor, eventId, paused, reason)`; `getEligibility(database, actor, eventId)`; `createSpin(database, actor, input: SpinInput)` returns `{created, spin}`. All resolve current actor/account server-side.

- [ ] Start with Fastify injection tests: attendee tokens cannot publish, stock-adjust, inspect others' history or redeem; admin-only guards check actual active backoffice identity and applicable event, not merely an untrusted ID in payload. Eligibility is authenticated and never client-computed from ticket labels.
- [ ] Publication atomically updates the configuration and version; compare expectedVersion. Validate retained IDs/type immutability and historical image references. Reject stale admin edits, duplicate keys with changed payload and impossible settings. Never include live stock in form replacement.
- [ ] Every wheel mutation locks the wheel row first. In spin, then lock original registration/entitlement and the chosen daily attendance in deterministic order. Cancellation must serialize with the same attendance lock; after lock, re-read active state. Avoid external calls inside the transaction.
- [ ] After obtaining the wheel lock, get `clock_timestamp()`; derive Bangkok day from that accepted instant. Look up successful idempotency replays before checking current window/configuration so midnight/closed/paused replay succeeds. Re-read registrations after lock before awarding.
- [ ] Check used day, versions, open session, not paused and candidate set; choose `randomInt(candidates.length)`. Conditional decrement for a prize is:

```sql
UPDATE lucky_wheel_segments
SET remaining = remaining - 1
WHERE id = $1 AND wheel_id = $2 AND kind = 'prize'
  AND enabled = true AND remaining > 0
RETURNING remaining;
```

- [ ] Insert the complete spin before commit in the same transaction. Increment pool revision on eligibility changes (e.g. remaining 1→0 or 0→positive), not every positive decrement. Stock adjustment audits store delta, before, after, actor, reason and time atomically; insufficient stock rolls back everything.
- [ ] Persist ordered configuration/pool/outcome snapshots and canonical request hash. Same key/different request is conflict; a new key cannot bypass daily unique constraint. Return existing daily result on the corresponding conflict for the owner without inventing another award. Store selected daily attendance ID and check-in timestamp snapshot for audit.
- [ ] Add explicit HTTP code mapping, no-store, account-aware throttling and requestId. Do not depend on the global 600/IP/min limit for account abuse control; avoid blocking a whole venue because 100 legitimate users share one IP.
- [ ] Run independent-client integration races: 100 users, 100 requests for one user, last item, simultaneous add/reduce/publish/pause, undo before/after allocation, clock boundary and replay after response loss. Assert no negative stock, double daily use or partially published wheel. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 7: Durable reward token, single redemption and corrections

**Files — conference-api:** Create `src/modules/lucky-wheel/rewards.ts`, `rewards.test.ts`, `rewards.integration.test.ts`; extend `routes.ts`, `schemas.ts`, `types.ts`, `.env.example`.

**Interfaces:** `issueRewardToken(spinId, key)` returns token, digest and AES-GCM envelope; `readOwnedSpin(database, userId, eventId, spinId)`; `lookupReward(database, actor, eventId, rawTokenOrCode)`; `confirmRedemption(database, actor, input: RedemptionInput)`; `correctRedemption(database, actor, {eventId, spinId, claimGeneration, reason, reopen, idempotencyKey})`. Lookup and owner detail responses expose claimGeneration as a positive integer; it is a concurrency guard, not an access credential.

- [ ] Use existing node:crypto and the invitation token pattern with a SEPARATE `LUCKY_WHEEL_TOKEN_ENCRYPTION_KEY`. Generate 32 random bytes, use a unique lookup digest, AES-256-GCM with spin ID as associated data, and persist the recoverable envelope. Token lookup body is redacted from logs. Do not import invitation-specific secret/error coupling.
- [ ] QR payload has the explicit `PRIS-REWARD:` prefix followed by the opaque token, so scanners distinguish it from regCode. Human code uses `randomBytes(10).toString("hex").toUpperCase()` (80 random bits), displayed in groups of four; normalize case and remove display separators before digest lookup. It is unique and rate-limited; it resolves to the same award but is not user PII or an incrementing ID. Retry a uniqueness collision at most three times inside issuance, then roll back the allocation on exhaustion.
- [ ] Only prize outcomes have reward proof. Owner fetch requires current authenticated ownership. Admin lookup reveals server truth and is read-only. Store stable awarded identity/name snapshot and show current account context if needed for discrepancy resolution; do not silently change the winner.
- [ ] Confirmation requires identityChecked=true, configured collection point/deadline and admin. Lock award/redemption state, reconcile earlier key, then conditional insert/update exactly once. Same/different concurrent confirmation returns the first successful actor/time. Do not decrement inventory.
- [ ] Retain original redemption on correction; append reason/actor/time/from/to. A deliberate reopen creates a new claim generation while keeping the same award/token; replay of an old confirmation key returns its original result, never confirms the new generation. Require current generation in correction/confirmation requests and audit mismatch. This prevents a delayed old network retry from redeeming a reopened claim.
- [ ] Deadline extension uses the audited configuration/admin path with a reason; no automatic admin bypass or return of unclaimed stock. Missing network acknowledgment reconciles the existing record before UI allows handover.
- [ ] Tests: token tampering/wrong key/wrong award, unauthorized lookup, no-prize token absence, double redemption, deadline, extension, replay preserving original actor, correction generations, no stock change on redemption/correction and cross-event access. Run `npx tsx --test src/modules/lucky-wheel/rewards.test.ts src/modules/lucky-wheel/rewards.integration.test.ts`. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 8: R2 prize-image upload with retained historical references

**Files — conference-api:** Create `src/modules/lucky-wheel/images.ts`, `images.test.ts`; extend `routes.ts`, `schemas.ts`, `.env.example`, `package.json` and lockfile.

**Interfaces:** `uploadWheelImage(actor, eventId, file)` returns `{imageId, imageKey, url, width, height}`. Publication accepts only image IDs/keys returned by this trusted upload flow and belonging to the wheel's event, not arbitrary remote URLs.

- [ ] Add `@aws-sdk/client-s3` as a declared API runtime dependency. For verified decoding/dimension limits/metadata removal, use a bounded image decoder such as `sharp` as a direct API dependency; it is already used in the frontend dependency tree but is not an API dependency. Do not rely on a transitive/frontend installation.
- [ ] Environment: `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BASE_URL`. Secrets remain server-only. Missing config returns a clear feature-specific error without breaking unrelated API startup. Production public base must be HTTPS; use a dedicated public image bucket/custom domain.
- [ ] Admin-only upload enforces max 5 MB, JPEG/PNG/WebP decoded format, max 16 megapixels, one static image, normalized dimensions no larger than 1600px, stripped metadata and a generated UUID key under `events/<eventId>/wheel/`. Reject SVG/HTML/spoofed content/animated or oversized payloads. Stream/body size limits must reject before unbounded buffering. Return a new key rather than overwrite an existing historical image.
- [ ] Upload to R2, then record trusted image metadata. If recording fails, perform best-effort cleanup of that newly uploaded unreferenced object and log a non-secret cleanup reference. Never fall back to API local disk. Publication failure leaves prior image/reference intact.
- [ ] Track createdAt and references from current configuration plus historical spins. Clean only confirmed unreferenced images after a grace period; no deletion from a raw client key and no removal of historical reward photos. A manual cleanup command is enough; no new scheduled worker.
- [ ] Unit/route tests mock S3 transport only: verify upload key/content metadata, rejected file bytes, size/decode failures, event ownership, storage failure and preservation of current configuration. A staging R2 smoke check later proves actual credentials/domain/cache; do not claim this from a mock. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 9: Admin configuration, stock ledger, history and collection UI

**Files — conference-api + conference-backoffice (approved T09 amendment 2026-10-03):** In `conference-api`, modify only the Lucky Wheel service/routes/schemas/types/tests needed for authenticated event-scoped admin reads of current wheel/configuration/version/pause/live stock/audit and filterable paginated spin/claim state; do not add migration/business rules/workers. In `conference-backoffice`, create `src/app/lucky-wheel/page.tsx`, `src/components/lucky-wheel/WheelConfiguration.tsx`, `StockAdjustmentDialog.tsx`, `RewardCollection.tsx`, `src/types/lucky-wheel.ts`; modify `src/lib/api.ts`, `src/components/layout/Sidebar.tsx` and applicable route guard.

**Interfaces:** Client wrappers match Tasks 6–8 and use existing ApiError/token handling. Admin page has configuration, stock and results/collection sections; no public leaderboard.

- [ ] Keep form edits local until Save and publish. Show saved/current version and dirty state; stale version conflict lets admin reload/reconcile rather than overwriting. Image uploads fill trusted reference IDs. Duplicate losing names are allowed and remain distinct stable IDs. Retired items cannot be turned into a different historical prize.
- [ ] Pause/resume is a separate explicit action. Add/reduce stock dialogs require positive integers and reason and retain a request UUID through retries. Do not expose a writable remaining input. Show before/after audit and available/allocated/collected meanings separately.
- [ ] Results support event/date/prize/claim-status filters and pagination; no-prize entries have no collection button. Add lookup using installed scanner components plus manual code input, read-only preview, identity comparison reminder and an explicit confirm button. Prevent duplicate scans from auto-submitting confirmation.
- [ ] On confirmation timeout, query/replay the same request and show an uncertain-state instruction to wait before handing over. Already-redeemed results show original admin/time. Deadline passed blocks confirmation until a deliberate audited extension. Correction is a separate admin action with reason and current claim generation, never a normal reset button.
- [ ] Use shared shirt stock initially and optional delivered size note, with clear size-availability copy; no size guarantees or size quota controls unless actual inventory requires them before activation.
- [ ] Check tabbing/focus, mobile scanner, long names, denied actor, version conflict, offline uncertainty and cancelled correction. Run scoped eslint, `npx tsc --noEmit` and production build after the complete page is wired. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 10: PRIS auth-return journey and attendee data client

**Files — conference-api + Pris2026 (approved T10 amendment 2026-10-03):** In `conference-api`, modify only Lucky Wheel attendee read service/routes/schemas/tests required for an authenticated owner-only paginated history list under the existing attendee Lucky Wheel prefix; owner comes from auth, event is filtered server-side, no client `userId`, and list rows never expose QR token/manual reward code credentials. In `Pris2026`, create `src/lib/luckyWheel.ts`, `src/lib/luckyWheel.test.ts`; modify `src/lib/localizedRedirect.ts`, `src/lib/localizedRedirect.test.ts`, `src/lib/entryTicket.ts`, `src/lib/refreshRedirect.ts`, `src/lib/refreshRedirect.test.ts`, `src/app/[locale]/login/page.tsx`, the existing signup pages and `src/components/layout/Header.tsx`.

**Interfaces:** `eventReturnQuery(search)` safely preserves `/ticket`, `/lucky-wheel` and bounded wheel-owned history/proof destinations; `ticketReturnQuery` retains its current behavior for existing callers/tests or becomes a compatibility wrapper. Feature client supplies `loadWheel`, `loadEligibility`, `submitSpin`, `loadOwnSpins`, `loadOwnSpin` and discriminated error codes.

- [ ] Add return-path tests before changing callers. Reject schemes, protocol-relative URLs, backslashes and unknown external destinations; preserve TH/EN normalized internal paths. Keep current invitation and ticket exemptions. Example regression checks:

```ts
assert.equal(shouldRedirectReload("/th/lucky-wheel"), false);
assert.equal(
  shouldRedirectReload("/en/login", "?redirect=%2Flucky-wheel"),
  false,
);
assert.equal(shouldRedirectReload("/th/profile"), true);
assert.equal(shouldRedirectReload("/en/sessions/confirm"), false);
```

- [ ] Read AuthProvider after restore; missing/expired auth or API 401 clears private wheel data and returns to localized login with a safe destination. A timeout/5xx does not log out a valid account or become an empty history.
- [ ] Client request keys are generated once per intentional spin, kept for replay until reconciled, and scoped by current user/event. POST sends expected configuration/pool revision only, never chosen segment or day. On reload reconcile an in-flight operation with owner history/key; do not automatically create a fresh attempt. Clear user-bound view/request state on logout/account change.
- [ ] Stale revision response refreshes and requires another deliberate tap without consuming a daily right. A stored successful result is displayed before current eligibility messages. Historical proof stays available outside session hours.
- [ ] Apply light-page header classification to the route family, preserving existing header layout/logo and other route behavior. Do not change the ticket's QR/download path. Run `npx tsx --test src/lib/luckyWheel.test.ts src/lib/localizedRedirect.test.ts src/lib/refreshRedirect.test.ts src/lib/entryTicket.test.ts`. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 11: Approved B wheel, history and reward proof

**Files — Pris2026:** Create `src/app/[locale]/lucky-wheel/page.tsx`, `src/app/[locale]/lucky-wheel/history/page.tsx`, `src/app/[locale]/lucky-wheel/rewards/[spinId]/page.tsx`, `src/components/lucky-wheel/Wheel.tsx`, `ActivityTicket.tsx`, `RewardProof.tsx`, `wheel.module.css`, `src/lib/wheelGeometry.ts`, `src/lib/wheelGeometry.test.ts`; modify `messages/th.json`, `messages/en.json` and wheel-only footer classification if required by the approved composition.

**Interfaces:** `Wheel({segments, winningSegmentId, snapshotVersion, reducedMotion, onAnimationComplete})` presents a server result. `ActivityTicket` owns B's layout/state and single action. `RewardProof` consumes owner-authenticated award plus current redemption/collection data. Geometry helper produces equal wedges and maps stable IDs to final rotation, never chooses a prize.

- [ ] Read current impeccable craft-floor and approved B image immediately before UI editing. Reproduce B at its reference mobile width first: original Header, wheel/history tab strip, one outlined white ticket, orange top rule, centered title/status, wheel and odds, notched orange dashed seam, full-width button BELOW seam, then availability rows/rules. No fixed 9:16 container and no C-style sticky dock.
- [ ] Use semantic SVG arcs for exact sectors, stable keyed images/labels and a pointer at 12 o'clock. A deterministic landing calculation can use center angle `-90 + (index + 0.5) * 360 / count` and rotation `360 * turns - (index + 0.5) * 360 / count`; keep rendering/start-angle conventions identical. Test pointer alignment for 1, 2, 6 and many slots, first/last slot and duplicate names.
- [ ] Preserve gray sold-out wedges and zero chance without collapsing positions. For dense wheels, show short numbered identifiers/icons and a complete text list, not clipped unreadable labels. Blank image uses a neutral fallback with accessible full name. No-prize symbol must not imply winning a gift.
- [ ] Render all defined states: not checked in, outside session window, paused, all physical prizes gone, already used today, stale version, submitting/unknown/reconciling, committed animation, prize/no-prize and errors. After committed success, freeze the server snapshot until animation ends. Returning to the page may show the recorded result directly; no second allocation call.
- [ ] History shows both outcome types and stable awarded time. Prize proof has server owner name, historical prize image/name, real QR on white with four-module quiet zone, manual code/copy, claim state and collection deadline/location. No fake QR, no QR on no-prize entries, no public sensitive lookup URL and no invented venue/deadline.
- [ ] TH/EN copy includes the actual rule “ทุกช่องที่ยังเล่นได้มีโอกาสเท่ากัน” and “ช่องหมดแล้วมีโอกาส 0%”; OUT_OF_STOCK reads “ของรางวัลหมดแล้ว” and suggests waiting for stock without implying rights were spent. Do not promise another play tomorrow when the session is over.
- [ ] Accessibility: 44px targets/48px primary action, text contrast checks, normal Thai tracking, visible focus, semantic current-tab state, polite result announcements, reduced motion, logical focus after result and no clipped content at 200% text zoom. Keep page light even though the application root sets dark class.
- [ ] Run `npx tsx --test src/lib/wheelGeometry.test.ts src/lib/luckyWheel.test.ts`, scoped eslint, `npx tsc --noEmit` and `npm run build`. Batch screenshots at 320px Thai, 390px B comparison, 430px English and desktop, plus prize/no-prize/sold-out states. Fix observed issues and recheck until required acceptance passes. Perform the impeccable finishing review directly using the actual screenshots and approved B reference; do not call mock images production verification. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Task 12: Cross-repository acceptance, load evidence and release runbook

**Files:**

- conference-api: `src/modules/lucky-wheel/load.integration.test.ts`, `sql/lucky-wheel-setup/README.md`, `package.json` test scripts.
- Pris2026: `docs/superpowers/verification/lucky-wheel/acceptance.md` and updated approved surface brief.
- conference-backoffice: only fixes required by failed integrated acceptance, not unrelated chart redesign.

**Interfaces:** Existing real HTTP endpoints and the same PostgreSQL migrations/services as production. Test transport hooks may simulate lost responses, never bypass allocation logic.

- [ ] Use a dedicated test database guard and provision 100 different users with valid current-day attendance. Fire 100 concurrent requests, then repeat with one user and with only one physical prize left. Record status counts, committed allocations, stock before/after, duplicate-day counts and elapsed times. Do not use the single-connection migration client as evidence of independent DB concurrency; use independent pooled connections.
- [ ] Assert global invariants with SQL, not only successful HTTP responses:

```sql
SELECT event_id, user_id, play_date, count(*)
FROM lucky_wheel_spins
GROUP BY event_id, user_id, play_date HAVING count(*) > 1;

SELECT id, remaining FROM lucky_wheel_segments
WHERE kind = 'prize' AND remaining < 0;

SELECT registration_session_id, attendance_date, count(*)
FROM session_daily_checkins WHERE cancelled_at IS NULL
GROUP BY registration_session_id, attendance_date HAVING count(*) > 1;
```

Expected: zero rows for every query. Also assert physical allocations reconcile with initial stock + adjustments - remaining and ordinary redemption does not change that value. Report cancelled/corrected redemption generations separately, never erase them to make counts balance.

- [x] Exercise end-to-end: original admission QR day one and day two; today's eligibility; spin; lost-response recovery; history on a second device/login; admin scan/read-only preview; explicit redemption; replay; deadline; correction; cancelled check-in before/after spin; mixed ordinary sessions; published form while other clients have old versions; stock refill restoring eligibility.
- [x] Date tests inject trusted test clock/provider or database-time boundary fixture only in the dedicated test harness. Production reads database time and accepts no test-mode date headers/body fields. Prove 16:59:59.999Z/17:00:00Z Bangkok boundary and session end exclusion.
- [x] Perform local production builds for each changed app once after integration fixes. Run relevant existing session-grant/invitation/check-in and PRIS auth/ticket tests; avoid rerunning unrelated expensive suites without evidence of impact.
- [x] External staging/device/provider acceptance amendment (2026-10-03): actual LINE iOS/Android login/reopen/refresh, real camera scan, rotation interruption/slow-network collection and actual staging R2 upload/history persistence are `DEFERRED_EXTERNAL_ACCEPTANCE`. Record each as `NOT VERIFIED / DEFERRED` because staging/device/provider access is unavailable; do not call them PASS and do not change business logic or production behavior to compensate. Local Task 12 acceptance is sufficient to close Implementation T12 and proceed to Final comprehensive verification.
- [x] Runbook lists exact DB readiness, backup/cutover/backfill commands; data reconciliation before enablement; admin setup for real prizes, R2 and collection deadline; initial pause; controlled smoke activation; incident pause; rollback preserving attendance/allocations. Deployment is a separate reviewed operation; a code rollback must not restore old daily-session scan semantics while a live event depends on daily history.
- [x] Document final evidence with command/results, fixture scope, screenshots, known failures and unverified real-device/provider checks. Retain no production PII in test screenshots. Record the passing checks and scoped review for the applicable batch commit checkpoint.

## Final comprehensive verification — after Task 12 passes

This is a separate final gate, not a replacement for per-task tests or a relabeling of Task 12 results. No Task or `DEFERRED_DEPENDENCY` may remain unfinished when this gate starts. The specifically approved `DEFERRED_EXTERNAL_ACCEPTANCE` items may remain `NOT VERIFIED / DEFERRED` and are non-blocking for this final gate.

- [x] Reread the approved requirements and map every acceptance item to actual evidence across all three applications. Check every task checkbox and the dependency ledger; unresolved required items prevent completion. Approved `DEFERRED_EXTERNAL_ACCEPTANCE` items remain explicitly `NOT VERIFIED / DEFERRED` and do not block completion.
- [x] Run the complete relevant attendance/wheel/auth/ticket regression suites and each changed repository's lint/typecheck/production-build checks against the final code. Use supported repository scripts and scoped lint where the plan specifies it; record baseline failures separately, never silently waive required checks.
- [x] Repeat the integrated owner login → original QR daily check-in → eligibility → spin → persisted history/proof → admin lookup/identity check/confirmation flow, including TH/EN, retries, permission denials and network uncertainty.
- [x] Repeat real-database concurrency/invariant verification: 100 simultaneous requests, duplicate account/day, duplicate scans, final-unit stock, stock adjustment/publication races and concurrent redemption. Verify no negative stock, extra daily spin, duplicate active attendance or duplicate handover record.
- [x] Recheck Bangkok midnight and session boundaries, cancellation before/after allocation, migrated UTC evidence, report/export totals and unchanged ordinary-session behavior. Recheck stale publication refresh, frozen successful result, sold-out positions, refill and the stop when all physical prizes are gone.
- [x] Recheck approved B on local mobile TH/EN and desktop, accessibility and reduced motion, real reward QR/manual lookup, plus all locally verifiable R2/image authorization/history semantics. Reconfirm actual staging R2 upload/history persistence and staging LINE iOS/Android/camera/rotation/slow-network checks remain `NOT VERIFIED / DEFERRED_EXTERNAL_ACCEPTANCE`; do not rerun them without access and do not report them PASS.
- [x] Fix only failures within the approved scope, rerun the affected task checks and integrated regressions, then confirm the final suite on the corrected final state. Record initial failures and final results; never weaken assertions to pass.
- [x] Review staged diffs and secret/PII exposure, finalize evidence and create the remaining local batch commits with title and body. Verify commit SHAs and working-tree status for all three repositories; identify unrelated or deliberately uncommitted files. Do not push.
- [ ] Report a concise caveman-style chat summary: tasks passed, final test evidence, commits per repository, remaining limitations and confirmation that nothing was pushed. Do not report complete if required checks remain blocked.

## Completion and self-review matrix

| Confirmed requirement                                                                  | Tasks      |
| -------------------------------------------------------------------------------------- | ---------- |
| PRIS login/LINE OA, one account/event/day                                              | 6, 10, 12  |
| Existing Main Session/QR/entitlements, daily active uniqueness                         | 1, 2, 12   |
| All scan modes, cancellation history, legacy backfill                                  | 1–4, 12    |
| Correct date-filtered reports, counts and export                                       | 3, 4       |
| Main Session window, equal eligible slots, unlimited no-prize and real-stock stop      | 5, 6, 11   |
| Shared stock, add/reduce audit/idempotency, restore sold-out segment                   | 5, 6, 9    |
| Gray fixed-position sold-out slots and many slot counts                                | 5, 11      |
| Atomic publish, stale-client refresh and frozen winning configuration                  | 6, 9–11    |
| Reward owner proof/QR, admin lookup/identity verification/one receipt                  | 7, 9, 11   |
| Timeout recovery, deadline extension, audited correction and no second stock decrement | 6, 7, 9–12 |
| Admin-only wheel operations                                                            | 6–9        |
| Mobile-first approved B, real header/logo and TH/EN                                    | 10, 11     |
| R2 only for new wheel images                                                           | 8, 9, 12   |
| 500 total / 100 simultaneous, actual prizes entered later                              | 5, 9, 12   |

Plan self-review: all confirmed requirement groups map to tasks. No pending visual choice; B is selected. Deployment-owned event/session IDs, credentials and actual prizes are validated setup inputs, not fabricated constants. A committed design or completed plan is not an implemented feature. Work tasks in the approved order with the documented dependency exception, keep each unfinished acceptance item visible, and complete the separate final verification and local batch commits before reporting completion.
