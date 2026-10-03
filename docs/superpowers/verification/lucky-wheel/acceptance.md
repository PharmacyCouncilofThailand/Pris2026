# PRIS2026 Lucky Wheel — Acceptance Ledger

## Execution identity

- Durable goal key: `pris2026-lucky-wheel-implementation-2026-10-03`
- Workspace: `D:/confer/confer/conference`
- Authoritative implementation prompt: `docs/superpowers/plans/2026-10-03-lucky-wheel-implementation-prompt.md`
- Durable continuation prompt: `docs/superpowers/plans/2026-10-03-lucky-wheel-durable-continuation-prompt.md`
- Approved implementation plan: `docs/superpowers/plans/2026-10-03-lucky-wheel-implementation.md`
- Approved design B: `docs/superpowers/specs/2026-10-03-lucky-wheel-design.md` and `docs/superpowers/specs/2026-10-03-lucky-wheel-surface-brief.md`

## Retained local PostgreSQL test environment

- Container: `pris2026-lucky-wheel-postgres-test-20261003`
- Image: `postgres:16-alpine`
- Ownership label: `lnwjud.goal=pris2026-lucky-wheel-implementation-2026-10-03`
- Bind: `127.0.0.1:65434 -> 5432/tcp`
- Named volume: `pris2026-lucky-wheel-postgres-test-data-20261003`
- Health: `healthy`
- Databases: `pris_lucky_wheel_test`, `pris_lucky_wheel_integration_test`, `pris_lucky_wheel_runtime_test` (all test-owned inside the same retained container)
- Lifecycle: retained across Tasks 1–12, Final Comprehensive Verification, session/worker recovery, and durable-goal terminalization. Do not delete unless the user later gives an explicit direct deletion command.

## Pre-existing repository state at start

### conference-api
- Working tree clean at preflight.
- Latest numbered application SQL migration observed: `0032_admin_session_invitations.sql`.
- Planned `0033_pris_daily_attendance.sql` and `0034_lucky_wheel.sql` do not collide at preflight.
- Existing dedicated test DB guard requires a PostgreSQL target whose database/schema contains `test` and refuses sharing the runtime DATABASE_URL.
- Local runtime inspected: Node `v24.16.0`, npm `11.13.0`; repository uses npm/package.json scripts and TypeScript/tsx.

### conference-backoffice
- Working tree clean at preflight.

### Pris2026
The following approved Lucky Wheel design/plan/prompt files were already untracked before implementation began and must be preserved as pre-existing user work:
- `docs/superpowers/plans/2026-10-03-lucky-wheel-durable-continuation-prompt.md`
- `docs/superpowers/plans/2026-10-03-lucky-wheel-implementation-prompt.md`
- `docs/superpowers/plans/2026-10-03-lucky-wheel-implementation.md`
- `docs/superpowers/specs/2026-10-03-lucky-wheel-design.md`
- `docs/superpowers/specs/2026-10-03-lucky-wheel-surface-brief.md`
- `docs/superpowers/specs/2026-10-03-lucky-wheel-visual-options.md`

## Task status

| Step | Status | Evidence / notes |
| --- | --- | --- |
| PREFLIGHT | PASS | Prompts/design/plan and required skills loaded; Git baselines inspected; PostgreSQL retained environment created once and healthy; migration numbering/test DB guard/runtime checked; one hourly cloud watchdog confirmed. |
| Task 1 | PASS | RED: relation absent on 0032 baseline. GREEN: `src/modules/attendance/migration.integration.test.ts` 1/1 PASS; concurrent same-day insert leaves one active row; cancellation requires nonblank reason; re-check-in preserves two rows/one active; legacy source key unique; migration rerun preserves history; attendance FK blocks entitlement cascade; entitlement count unchanged. `npm run build` PASS. |
| Task 2 | PASS | Policy RED captured before `policy.ts`. `policy.test.ts` + `service.integration.test.ts` 2/2 PASS. Shared writer uses DB time, per-entitlement lock, daily partial uniqueness and staff event/session authorization; legacy workshop remains once-per-session. Daily cancellation targets attendanceId/reason and preserves five-minute non-admin rule. Backfill preserves UTC actor/time -> Bangkok date and cancelled legacy replay. Existing check-in invitation-separation regression 1/1 PASS; API build PASS. |
| Task 3 | PASS | `readers.integration.test.ts` 1/1 PASS with one account/two registrations/two days, another identified attendee, one cancelled row and one null-user registration. Counts remain independent: 4 eligible entitlements, 2 unique people, 3 identified people-days, 2 people on selected day, 1 unresolved identity. Daily rows separate attendanceId from registrationSessionId; active/cancelled/all, strict dates, university/search and registration detail history verified. Attendance suite 3/3 PASS, existing check-in invitation-separation regression 1/1 PASS, API build PASS. |
| Task 4 | PASS | Backoffice mixed-policy scanner/report integration completed. Daily rows preserve server-truth `attendanceId` separately from legacy `registrationSessionId`; daily undo requires a reason and targets attendance history, while legacy undo remains unchanged. Backoffice focused ESLint completed with 0 errors (5 pre-existing/baseline warnings), TypeScript PASS, and Next.js production build PASS. Corrected API regression used `npx.cmd`/`npm.cmd`: mixed-policy reader integration 1/1 PASS and API TypeScript build PASS. The earlier PowerShell launcher-blocked wrapper is classified COMMAND_WIRING_FAILURE and is not acceptance evidence. |
| Task 5 | PASS | Equal-slot policy + strict API contracts verified; `0034_lucky_wheel.sql` and matching Drizzle schema define wheel/configuration, stock, immutable spin evidence, audit, redemption/correction and trusted image references. Goal-bound PostgreSQL verification PASS 6/6, including no-physical-stock closure, disabled/sold-out zero probability, duplicate losing labels/order preservation, exact candidate indexing, activation Main Session/time/config guards, stock/type constraints, one user/event/day, scoped idempotency, historical attendance FK preservation and migration rerun. API TypeScript build PASS. |
| Task 6 | PASS | Independent T06 gates PASS: route/policy 7/7, migration 1/1, PostgreSQL service concurrency 1/1, API build PASS. T07 route wiring then closed the deferred authorization gate: attendee redemption attempts receive 403 and never call confirmation logic. Latest combined route/reward verification PASS 8/8 and service integration regression PASS. |
| Task 7 | PASS | Dedicated reward crypto uses a separate canonical 32-byte base64 key, PRIS-REWARD QR token, recoverable encrypted 80-bit human code and digest lookup. Prize spin persists proof + claim atomically; no-prize proof remains absent. Owner/admin lookup, cross-event denial, exactly-once concurrent confirmation, deadline fail/extension with audit reason, correction generations, old-key replay and no-stock-change verified on retained PostgreSQL. Reward/route tests 8/8 PASS, reward+service integration 2/2 PASS, API build PASS. |
| Task 8 | PENDING | |
| Task 9 | PENDING | |
| Task 10 | PENDING | |
| Task 11 | PENDING | |
| Task 12 | PENDING | |
| FINAL_VERIFY | PENDING | |
| FINALIZE | PENDING | |

## Task 1 evidence

- Created `conference-api/drizzle/0033_pris_daily_attendance.sql` and matching Drizzle schema exports without auto-enabling any event/session policy.
- Added read-only `conference-api/sql/lucky-wheel-setup/00_readiness.sql` and manual migration/runbook guidance that explicitly rejects `db:push` as migration proof because the journal is stale.
- Retained PostgreSQL ownership/health rechecked after T01: running, healthy, correct Lucky Wheel goal label.
- Local test credential material remains only in ignored local execution configuration and is not recorded here.

## Task 5 evidence

- Created `conference-api/drizzle/0034_lucky_wheel.sql` and matching Drizzle exports for the wheel, segment inventory, spins, audit events, redemption/correction history and trusted image metadata.
- Activation is database-guarded: an enabled wheel must target a Main Session belonging to the same event, have a valid session time interval, and have published configuration plus collection settings.
- Segment constraints keep prize stock nonnegative and require no-prize stock to remain `NULL`; displayed positions are unique per wheel and stable identities are retained.
- Spin evidence stores event/user/day, selected attendance, configuration/pool versions and immutable configuration/outcome snapshots; database uniqueness prevents a second user/event/day allocation and scopes request replay by event/user key.
- Strict Zod request schemas reject unknown fields and client-supplied winner/user/time/remaining values, duplicate segment IDs/positions, invalid kinds, blank bounded bilingual text/reasons and out-of-range stock adjustments.
- Goal-bound combined verification on the retained PostgreSQL environment: policy + migration tests 6/6 PASS and `npm run build` PASS. An earlier ownership-inaccessible RED observation was reconciled through worker/database state and was not counted as acceptance evidence.

## Task 6 evidence

- Routes are wired under authenticated attendee `/api/lucky-wheel` and authenticated backoffice `/api/backoffice/lucky-wheel` groups. Admin mutations additionally re-read an active `backoffice_users` admin identity from PostgreSQL; attendee endpoints reject backoffice/admin JWT roles to avoid cross-principal numeric-ID collisions.
- Publication/stock/pause/spin operations share the wheel row as the first mutation lock. Spin re-reads current account, confirmed Main Session entitlement, selected active daily attendance, session window, version/pool and candidate stock before allocation.
- Same idempotency key replays the committed spin before current pause/window/config checks; changed payload conflicts. A new key on the same account/event/day returns the existing daily result without a second allocation.
- Goal-bound verification on the retained PostgreSQL environment: policy+route 7/7 PASS, migration 1/1 PASS, service concurrency/invariant 1/1 PASS, API TypeScript build PASS. The service test includes 100 concurrent users, 100 concurrent requests from one user, last-item depletion, stock add/reduce plus publish/pause races, attendance cancellation before/after allocation, publish retry, stable segment type, trusted image ownership, and rollback/no-negative-stock invariants.
- Deferred authorization closure rerun after T07 route creation: attendee requests to the admin redemption endpoint return 403 before `confirmRedemption` is invoked; the latest route suite is green.

## Task 7 evidence

- `rewards.ts` uses only `node:crypto`: 32 random-byte opaque token, `PRIS-REWARD:` QR prefix, SHA-256 lookup digest and AES-256-GCM bound to the spin ID. The separate `LUCKY_WHEEL_TOKEN_ENCRYPTION_KEY` must be canonical base64 for exactly 32 bytes; invitation secrets are not reused.
- Human reward codes use 10 random bytes / 80 bits, uppercase hex grouped by four for display, normalize separators/case for lookup, and are stored recoverably inside the encrypted reward envelope while their lookup digest remains unique. Retry is capped at three attempts; exhaustion aborts the transaction.
- Prize allocation persists token/code proof and an open claim generation in the same spin transaction. No-prize rows persist no reward credential and the database constraint rejects reward proof on no-prize outcomes.
- Owner detail verifies current user/event/spin ownership before decrypting proof. Admin token/code lookup is event-scoped and read-only; cross-event and non-admin access are rejected.
- Confirmation locks the claim, is exactly-once per generation, preserves the first successful admin/time under concurrent different requests, binds idempotency keys to payloads, and never decrements inventory. A reopened claim increments generation while immutable confirmation/correction history remains; a delayed retry using the original key returns the original generation result.
- Collection deadline is fail-closed. Changing an existing deadline through the published configuration path requires a nonblank audit reason; integration verifies deadline rejection, audited extension and successful confirmation only after extension.
- Goal-bound latest verification: reward crypto/route tests 8/8 PASS; sequential PostgreSQL `rewards.integration.test.ts` + T06 `service.integration.test.ts` 2/2 PASS; `npm run build` PASS. Retained PostgreSQL container remained healthy and was not recreated.

## Deferred dependency ledger

| Task waiting | Failing/unavailable check | Cause evidence | Dependency | Retest trigger | Result |
| --- | --- | --- | --- | --- | --- |
| Task 6 | Route/auth proof that an attendee cannot redeem/confirm a reward | Redemption/confirmation endpoint is explicitly created by Task 7; all other T06 checks were green | Task 7 reward lookup/confirmation routes | Immediately after T07 endpoint/auth tests pass, rerun T06 auth coverage before starting T8 | PASS — route suite proves attendee gets 403 and confirmation handler is not invoked |

## Commit ledger

| Repository | Tasks | SHA | Commit |
| --- | --- | --- | --- |
| conference-api | 1–7 | `2daeb37cff397d81722a82a15550b147a5f1cfb0` | `feat(wheel): add daily attendance and atomic reward workflow` |
| conference-backoffice | 4 | `e8294566a210461e00312acc4415537dcd293086` | `feat(checkins): add daily attendance scanner and reports` |

The Pris2026 acceptance-evidence commit for this batch is intentionally not self-recorded here; per the implementation prompt, its final SHA is verified from Git after commit and reported without creating an extra commit solely to record its own SHA.

## Safety / environment assertions

- Local test PostgreSQL only; no production or application runtime database used for Lucky Wheel tests.
- No production data copied into the retained test environment.
- No push, deploy, production migration, live R2 provisioning, or live prize allocation performed.
- Retained PostgreSQL environment must not be cleaned up automatically.
