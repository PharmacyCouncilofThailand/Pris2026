# Daily Attendance Readiness — Acceptance Ledger

Canonical plan: `../../plans/2026-10-05-lucky-wheel-daily-attendance-readiness.md`

## Execution checkpoint — 2026-10-06

- T01: **PASS** — user approved matching PostgreSQL 16 and deletion/recreation of only the task container/volume. Schema-only restore, baseline and guarded synthetic fixture passed.
- T02: **PASS** — read-only readiness/classification/fingerprint tests **2/2**, API build passed.
- T03: **PASS** — shared/exclusive cutover fence and existing attendance regression **5/5**, API build passed.
- T04: **PASS** — approved NOWAIT amendment; setup/readiness/fence suites **8/8 PASS**, API build passed.
- T05: **PASS** — authenticated setup route/state, strict bodies and replay; API suites **11/11 PASS**, build passed. T04 prerequisite re-test passed.
- T06: **PASS** — wheel **29/29**, attendance/setup **11/11**, API build passed.
- T07–T12: **PENDING**.
- FINAL_VERIFY: **PENDING**.
- API T01–T06 committed as `7a0851a`. No migration, operational attendance activation, QR opening, push or deployment.

## Baseline

| Repository | Starting HEAD | Initial working tree |
| --- | --- | --- |
| conference-api | b50792e8e34ec6dbc1d82380cb292027d08e4c23 | Clean |
| conference-backoffice | b21347c529252320401747588f7e033bb076a6cb | Clean |
| Pris2026 | 6c465d0e00178b6694373d5cd2448966248dbf73 | Canonical plan untracked |

No applicable AGENTS.md found outside unrelated vendor files. The planned container name and port were unused before creation. Existing containers were not deleted, stopped or modified.

## T01 evidence

- Created `pris2026-attendance-readiness-test-20261005`, image `postgres:18-alpine`, PostgreSQL **18.6**.
- Bound `127.0.0.1:65436`; `pg_isready` passed.
- Created `attendance_readiness_test` and `wheel_readiness_test` databases.
- Reviewed schema source: `confer-postgres-dev`, database `confer_db`, PostgreSQL **16.14**, native pg_dump **16.14**.
- Source contains `session_attendance_policies`, `session_daily_checkins`, and `lucky_wheel_qr_codes`.
- Exported **schema only**, no participant data, with `--no-owner --no-privileges`.
- Retained artifact: `C:/Users/JaoNo/AppData/Local/Codex/attendance-readiness-20261005/schema.sql`.
- The initially attempted backup-directory copy failed (`too many levels of symbolic links`); copying to the separate task artifact directory succeeded. No backup files were overwritten.
- Restore with `ON_ERROR_STOP=1` failed at schema.sql:4223:

```text
ERROR: constraint "abstracts_tracking_id_not_null" for relation "abstracts" already exists
```

- Source constraint is type `c` (CHECK), defined as `CHECK ((tracking_id IS NOT NULL)) NOT VALID`. PostgreSQL 18 creates a NOT NULL constraint with this same name during table creation; the later source CHECK addition collides.
- Test attendance database is partially restored and is **not ready**. No test suite/build was run or claimed PASS.

## Required decision

Recommend amending T01's test image to `postgres:16-alpine`, matching the actual Local development server, while keeping the same container name, port and two guarded test databases. Recreate only the new task test container and its own anonymous volume; retain the schema artifact and every pre-existing container/volume/backup. Do not strip source constraints to force a PostgreSQL 18 restore.

User approved this amendment with “ตามนั้น”. Removed only the exact new task container and its anonymous volume after inspecting their identities, then recreated with PostgreSQL 16.14 on the same port and database names. Canonical plan updated to reflect the approved version.

## T01 passing verification

- PostgreSQL 16.14 ready; schema restore with ON_ERROR_STOP passed without stripping constraints.
- Wheel baseline: **16/16 PASS**, zero skipped.
- Full-schema attendance/readers baseline: **2/2 PASS**, zero skipped.
- API TypeScript build: **PASS**.
- Synthetic fixture create/cleanup smoke: **PASS**, test URL validated before connecting; only owned synthetic IDs cleaned up.
- Local development and every pre-existing container/backup retained unchanged. Source schema-only dump retained outside Git.

## T02 verification

- Red phase: both new test files failed with the expected missing readiness module.
- Green phase: pure legacy classification and full-schema integration **2/2 PASS**, no skipped tests.
- Preview uses a read-only REPEATABLE READ snapshot; no policy/history writes.
- Confirmed registrations/entitlements counted separately; missing grants and null account links detected without repair.
- Foreign workshop policy does not enable Main Session or alter its fingerprint.
- UTC→Bangkok day conversion and exact microsecond matching tested; matching active evidence is alreadyCovered.
- Cancelled history is a blocker and changes the revision; runtimeReady remains separate from import/setup completeness.
- API build **PASS**. No operational database changes.

## T03 verification

- Red phase: new integration test failed with the expected missing cutover-lock module.
- Shared fence is acquired before entitlement locks in checkInSession and cancelDailyCheckin; target is revalidated after acquiring it.
- Legacy undo now executes in a transaction, acquires the same fence before the entitlement lock, rechecks daily mode inside the transaction, and sends success only after commit.
- PostgreSQL lock inspection proves a scanner waits on the shared advisory fence, then reads the newly enabled daily policy after the exclusive fence releases.
- Cancellation/re-check-in and ten concurrent re-scans preserve one active daily row; workshop retains single mode and duplicate detection.
- Combined cutover/attendance/readers/readiness suites: **5/5 PASS**, zero skipped. API build **PASS**.
- Real route-level verification of selected/assigned/check-all and undo remains assigned to T10; no browser verification claimed.

## T04 blocker — parent lock inversion

- Canonical T04 specifies exclusive attendance fence → event FOR UPDATE → Main Session FOR UPDATE → wheel → registrations/entitlements/daily rows.
- Existing `conference-api/src/modules/session-grants/service.ts:352–375` uses a joined sessions/events query with `.for("update")` before locking registrations.
- Reproduced that exact joined parent-query shape on the guarded synthetic fixture: transaction A holds the event, grant-shaped transaction B waits for that event while already holding the session, and a third transaction's session FOR UPDATE NOWAIT fails with PostgreSQL **55P03**.
- Therefore, a setup transaction holding event and waiting for session can form a cycle with the existing grant writer. No live deadlock or operational mutation was performed; the probe released all locks and removed only its own synthetic fixture.
- Reproducer retained in `conference-api/src/modules/lucky-wheel/attendance-setup.integration.test.ts`; currently **1/1 FAIL intentionally documents the conflict**. T04 is not PASS. New setup/import service not implemented.
- No T05+ work, commit batch, migration, live policy activation, QR opening, push or deployment.

### Narrow amendment (approved 2026-10-06)

Keep existing session-grants behavior untouched. Acquire setup's row locks with **FOR UPDATE NOWAIT**, retaining the same target scope and advisory fence. If any required row is already locked, map 55P03 to ATTENDANCE_SETUP_BUSY, rollback the whole transaction, and retry the identical request/key after the competing writer finishes. Apply nonwaiting acquisition to all setup row-lock steps so setup never waits on a row while holding another parent row. The exclusive advisory fence may retain its bounded wait.

Replace the failing compatibility assumption with a regression proving the actual setup returns BUSY without policy/import/audit writes during this grant-shaped contention; after release, the same request succeeds once. This changes T04's explicitly approved locking method, so execution stopped for confirmation rather than modifying the canonical plan automatically.

User approved proceeding with the most suitable approach. Canonical T04 now specifies NOWAIT for every setup row lock; existing session-grants writer unchanged.

## T04 verification

- Contention reproducer now proves BUSY with zero policy/audit writes, then same-request success after competing locks release.
- 100 concurrent identical requests produce one import/audit and immutable saved result; replay after unpausing still works.
- Two independently keyed requests sharing an old preview produce one success and one STALE rejection.
- Source timestamp/scanner and microseconds retained; only evidenced Thai day imported. No legacy evidence produces no attendance.
- Non-admin, wrong target, unpaused activity, stale revision, null account, missing entitlement, missing scanner, invalid time, active-history conflict and unprocessed cancellation reject without partial setup.
- A previously imported cancelled source is never resurrected.
- Setup/readiness/fence **8/8 PASS**, zero skipped; API TypeScript build **PASS** after fixing test-only TransactionSql invocation types.
- Dependency exception: T05's minimal WheelError union additions were needed to compile T04's typed service errors; only those type entries were pulled forward. T05 will verify their actual route contract, then rerun T04 tests.

## T05 verification

- Red phase: setup route returned 404 before implementation.
- Real database-backed route rejects unauthenticated, staff/inactive admin, client user/time properties, blank reason and malformed revision/key/IDs.
- Success 201 / identical replay 200, same audit ID, Cache-Control no-store, actual authenticated audit actor.
- Existing admin state includes observational attendanceReadiness; GET/init never enable policy or create attendance.
- Existing route mocks updated to the explicit readiness contract; no production mock state.
- Setup/routes regression **11/11 PASS**, API build **PASS**; T04 re-tested after the pulled-forward error type prerequisite.

## T06 verification

- Red phase: disabled daily policy returned OUT_OF_STOCK instead of ATTENDANCE_SETUP_REQUIRED.
- Missing/disabled policy now blocks new QR claims/spins, QR opening and activity unpause; eligibility identifies configuration separately from genuine CHECKIN_REQUIRED.
- Committed spin replay bypasses current prerequisites, preserving recorded results. Existing credit replay preserves spent/revoked/prior-day states; an unspent credit with missing policy is blocked without mutation.
- Existing preparation, pause/close/download, owner history, redemption and correction behavior retained.
- Legacy isolated wheel fixtures now explicitly seed policy and valid PRIS binding; no fake policy state in production. Successive load scenarios use the PRIS code serially, retaining completed scenario IDs/history.
- A reward fixture initially failed because it also invoked createSpin without policy; fixed only that affected fixture, then reran the complete wheel suite.
- Complete wheel suite **29/29 PASS**, zero skipped. Full-schema attendance/setup suite **11/11 PASS**, zero skipped. API build **PASS**.
- No new migration or operational policy/QR changes. T01–T06 ready for their first commit batch.
