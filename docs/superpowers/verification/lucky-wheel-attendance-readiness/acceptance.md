# Daily Attendance Readiness — Acceptance Ledger

Canonical plan: `../../plans/2026-10-05-lucky-wheel-daily-attendance-readiness.md`

## Execution checkpoint — 2026-10-06

- T01: **PASS** — user approved matching PostgreSQL 16 and deletion/recreation of only the task container/volume. Schema-only restore, baseline and guarded synthetic fixture passed.
- T02: **PASS** — read-only readiness/classification/fingerprint tests **2/2**, API build passed.
- T03: **PASS** — shared/exclusive cutover fence and existing attendance regression **5/5**, API build passed.
- T04: **PASS** — approved NOWAIT amendment; setup/readiness/fence suites **8/8 PASS**, API build passed.
- T05: **PASS** — authenticated setup route/state, strict bodies and replay; API suites **11/11 PASS**, build passed. T04 prerequisite re-test passed.
- T06: **PASS** — wheel **29/29**, attendance/setup **11/11**, API build passed.
- T07: **PASS** — restored environment checks, real synthetic API setup and desktop/mobile dialog verified after approved resumption.
- T08: **PASS** — UI guards/scanner refresh/build and T10 prerequisite route matrix verified.
- T09: **PASS** — tests 63/63, scoped lint, TypeScript and production build.
- T10: **PASS** — route/readers/attendance 3/3, API build; T08 dependency re-tested.
- T11: **PASS** — approved stale-preview race amendment; wheel 29/29, attendance/setup/flow 16/16 and API build passed.
- T12: **PASS** — scoped read-only runbook, backup/restore proof, authenticated Local repair and browser verification complete.
- FINAL_VERIFY: **PASS** — wheel29/29, attendance18/18, PRIS63/63; API/Backoffice/PRIS builds and scoped lint/type checks pass.
- API T01–T06 committed as `7a0851a`; T07–T12 API `03df628`, Backoffice `c6642f9`; participant/docs commit follows in Git history. Local daily activation/import completed as recorded below; no new migration, operational QR opening, push or deployment.

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

## T07 checkpoint — authenticated browser gate

- Added the actual admin setup client/types, readiness card and reviewed native dialog. Unknown readiness is never displayed as ready. Network/BUSY retries retain the exact request/key; stale previews require reload and review; successful setup with a failed refresh is reported separately.
- Scoped ESLint, `tsc --noEmit`, and Backoffice production build **PASS**.
- Required browser verification redirected `http://localhost:3001/lucky-wheel` to `/login`. One attempt with the dev credentials displayed on the login page returned **Invalid email or password**. No authenticated setup card/dialog verification is claimed.
- Stopped at the canonical plan's unavailable-authentication condition. T07 is not PASS; T08 has not started. Need the user to sign into Backoffice in the Codex in-app browser using an existing authorized admin account, then resume the visual gate.
- Remaining T07 review: display the actual bound Main Session name and ID for initialized wheels (current page only loads the name during initialization), then rerun affected checks and browser validation.
- No password reset, authentication bypass, operational setup, QR opening, container deletion, push or deployment. Current T07 changes remain uncommitted; T01–T06 commits retained.

### T07 resumed after user login

- Existing authorized admin login works. Actual PRIS state shows bound Main Session #1 (name PRIS 2026), 2 confirmed registrations, 2 entitlements, 1 pending historical import and runtime not ready. Activity is currently unpaused, so setup is disabled with the required pause explanation. No operational state was changed.
- Fixed bound-session name loading for initialized wheels; the exact bound ID selects the name instead of choosing another Main Session. Scoped ESLint, TypeScript and production build rerun **PASS**.
- Created a synthetic event #46 / Main Session #91 and synthetic admin in the guarded `attendance_readiness_test` database only. Started isolated API on 3102 and a source-copy Backoffice preview on 3101; existing API/Backoffice and their environments were not replaced or stopped. Preview artifacts are under `C:/Users/JaoNo/AppData/Local/Codex/attendance-readiness-20261005/backoffice-preview`.
- Browser rejected `http://localhost:3101/login` with `net::ERR_BLOCKED_BY_CLIENT`. No dialog/mobile verification or mutation success is claimed. No attempt to bypass the browser restriction.
- T07 remains BLOCKED; T08–T12 have not started. Need access to the isolated localhost preview in the Codex browser, or explicit approval of a different verification arrangement. Live pause/setup stays reserved for the reviewed T12 operational step.

### Preview failure correction and environment incident

- Later server logs established HTTP 500: Next.js resolved a cross-drive client entry as `./D:/.../app-next-dev.js`. The browser's ERR_BLOCKED_BY_CLIENT is not sufficient evidence of a browser access policy. The preceding hypothesis is superseded; do not ask the user to weaken browser protections.
- Attempting to move the preview from C: to the workspace followed its node_modules junction and moved some Backoffice dependency files into the preview's physical node_modules directory. This was an unintended environment change; original tracked source and lockfiles were not moved. The move was interrupted.
- Restoration copies the moved dependency files back to the exact original Backoffice node_modules path, retaining the source copy. No recursive delete was issued. Both agent-created preview API/server processes have been stopped; existing operational server processes and all database containers remain.
- Stop at this unplanned environment incident as requested. T07 visual gate remains unverified; do not proceed to T08 or operational setup. Record restoration verification below before yielding.

- Restoration completed with non-destructive robocopy `/E /COPY:DAT /XJ` (no MIR/PURGE/delete). Read-only comparison exit 2 means untouched extra files in original target are retained; no moved source files remain to copy or mismatch. Scoped ESLint, `tsc --noEmit`, production build and `npm ls next react eslint typescript --depth=0` all **PASS** after restoration. Source-copy and partial artifacts retained; no container/volume cleanup.
- Recommended resumption: use the already prepared D:-drive preview with the original dependency junction in place; never move a directory containing a dependency junction. Start only agent-owned test servers against the isolated database, verify desktop/mobile/dialog, and then continue T08 if T07 passes. Await user confirmation because their instruction requires stopping on an unplanned multi-point environment impact.

### T07 verified after approved resumption

- User approved D:-drive preview. It now runs on 3101 with actual API 3102 against the guarded test DB. Preview base URL has no `/api` suffix because existing client endpoints already include their own route prefixes. No environment file was edited.
- Real synthetic event #46 / Main Session #91: readiness shows 1 confirmed registration/entitlement, zero pending history. Dialog names the bound session, explains preservation and independent activity/QR state, and requires reason plus reviewed checkbox.
- Actual setup API succeeded; refreshed state shows daily policy enabled and immutable counts, Admin #52 and audit timestamp. Wheel stays paused/unpublished; no QR opened. This is test data only.
- Desktop dialog and mobile 390×844 dialog visually verified. Native dialog focus and disabled submit before review verified. API concurrency/idempotency/STALENESS remain covered by T04/T05; no browser fault injection claimed.
- Screenshots retained in `C:/Users/JaoNo/AppData/Local/Codex/attendance-readiness-20261005/`: t07-dialog-desktop.png, t07-dialog-mobile.png, t07-success-mobile.png. Restored environment's lint/TypeScript/build PASS remains valid. T07 PASS; T08 started.

## T08 verification and prerequisite exception

- Open activity/Open QR now disabled for missing/unknown runtime readiness; handler guards match, backend remains authoritative. Preparation, close and download paths remain available. QR status remains independent.
- Synthetic QR-A prepared through actual day/QR services, closed with zero claims. Test-only daily policy disabled: browser shows setup warning, Open QR disabled and Download PNG enabled; configured day loaded automatically. Mobile QR layout inspected.
- Scanner with disabled policy shows no daily label; enabling only the synthetic policy and clicking stats refresh immediately loads daily mode and server date 2026-10-06. Switching to Workshop removes daily label; no workshop behavior change.
- Scoped ESLint zero errors (two existing scanner hook warnings), TypeScript and Backoffice production build **PASS**.
- Checkins reader source retains date-filtered pagination/export and daily undo using exact attendanceId. Real selected/assigned/check-all response and cancellation verification require T10's optional test DB injection and integration harness. This is recorded as the permitted later-prerequisite exception; T08 not final PASS yet. Continue T09, implement T10, then rerun T08 coverage before T11.

## T09 verification

- ATTENDANCE_SETUP_REQUIRED is preserved through client error normalization and maps to the specified TH/EN organizer configuration copy in wheel and claim views. CHECKIN_REQUIRED remains distinct and retains its ticket link; configuration error has user-triggered retry of the original server QR flow and no ticket ownership implication/local credit.
- Existing wheel message mapping moved into the existing client module so code/message contract can be tested. Tests **63/63 PASS**, scoped ESLint/TypeScript/build PASS. An earlier overlapping build failed resolving a generated Google font module; the final sequential build passed without font/config changes.

## T10 verification; T08 dependency closed

- Real checkins plugin accepts optional database; production retains default DB/auth/URLs. Guarded fixture uses actual route writers and readers.
- 100 concurrent selected scans produce one success and 99 original date/time/ID duplicates. Original entitlement/QR works today despite non-null legacy checked_in_at and previous-day evidence. No new ticket/session/grant.
- Today cancellation leaves yesterday active; recheck creates a new daily ID. Cancelling yesterday leaves today's duplicate result unchanged. Legacy undo is rejected for daily mode. Reports count one entitled account and two attendance occurrences; exact date list/cancelled history IDs preserved.
- Assigned staff denied before assignment and accepted afterward; check-all records Main Session daily and Workshop single, subsequent all-scan rejects duplicates. Nonconfirmed/no entitlement/unassigned/out-of-session requests reject. No duplicate active daily rows.
- Test harness errors (missing default DATABASE_URL, guard correctly rejecting equal runtime/test DB, fixture UUID and actual registration enum) corrected in test setup only. Runtime default is a separate isolated test DB; injected operations use attendance_readiness_test. No operational DB query/mutation.
- Route/readers/original attendance **3/3 PASS**, API build PASS. This supplies the prerequisite proof for T08's selected/assigned/check-all/date/undo coverage; T08 re-evaluated PASS before starting T11.

## T11 partial verification and canonical conflict

- New full-schema flow tests **2/2 PASS** and API build PASS: published prizes/day/closed QR → audited setup creates no fabricated attendance → actual scan route → open → QR-A once/replay and QR-B once → pre-spin cancellation blocks, actual recheck restores same credits → physical-stock exhaustion blocks even with no-prize segment → top-up → two distinct credit spends allocate two prizes → third spin NO_CREDIT. Post-spin cancellation preserves two results, two spent credits and stock remaining 8. QR download creates no claim and retains closed status. Setup audit exactly one; no duplicate QR/account grants.
- Separate actual legacy timestamp/scanner import allows owned claim without another scan; original source timestamp, scanner and ticket unchanged. Thai midnight boundary assertions pass.
- Test-only stock exhaustion uses an exact synthetic segment update because the currently approved stock API accepts top-ups only. Test helper cleanup expanded only for owned synthetic wheel children; no broad table reset or operational mutation.
- Canonical T11 asks an in-flight legacy scanner to hold the shared fence while setup starts, then expects setup to import immediately after that scanner commits. T02/T04 simultaneously require a fingerprint that includes source timestamp/scanner, and STALE rejection whenever those previewed facts change.
- Reproducer in `attendance-setup.integration.test.ts` executes the actual checkInSession inside an outer transaction holding the shared fence. PostgreSQL lock inspection confirms setup's ExclusiveLock waits; after scanner commits, actual setup returns **409 ATTENDANCE_SETUP_STALE**. Focused canonical-expectation test **1/1 FAIL**, documenting the contradiction rather than weakening the production revision check.
- T11 is not PASS. No T12, final verification, operational repair, QR opening in Local/Railway, push/deploy or container deletion. T07–T11 working changes are uncommitted pending completion of the approved task batch.
- Proposed narrow amendment: assert setup waits, then rejects the stale preview with zero policy/import/audit writes and preserves the committed legacy scan; Admin reloads/read-reviews a new revision and submits a new command/key; import succeeds exactly once. Keep original revision/fence/backend behavior. Await user approval before changing canonical T11 expectation and resuming its remaining coverage/full suites.

## T11 amendment approved
- User approved wait → STALE/zero writes → fresh reviewed revision/new key → exactly-once import and replay. Production revision/fence behavior unchanged; T11 resumed.

## T11 completed
- Actual legacy-scan barrier: setup waits, STALE rolls back all setup writes, source retained, refreshed command imports once and replays.
- Actual setup transaction holds exclusive fence: queued scanner re-reads committed daily policy. Two active admins compete; one succeeds, the other receives STALE.
- Real setup → scan → QR-A/B → two spins, temporary window closure/reopening, cancellation before/after spin and stock exhaustion/restock verified. Duplicate active daily rows/claims/spends and negative stock zero; original two grants preserved.
- Existing service integration verifies prior-day credit expiry; full wheel load verifies 100 requests and final-unit allocation. Cancelled import never resurrected.
- Sequential wheel 29/29 then attendance 16/16 PASS; API build PASS. T12 started.

## T12 operational Local repair and browser proof
- Re-read .env target: localhost:5432/confer_db, PostgreSQL16.14, confer-postgres-dev. One running Local API is tsx watch src/index.ts from the current conference-api checkout; real admin state exposes current readiness contract. No Railway activation/deployment.
- Selected event1 PRIS-2026 / original active Main1, bound wheel v3/pool4. Confirmed2 and Main grants2, missing/null links0, one valid legacy import dated2026-10-05.
- Full custom backup outside Git: C:/Users/JaoNo/AppData/Local/Codex/attendance-readiness-20261005/confer-db-before-attendance-setup-20261006.dump (391524 bytes), SHA256 56E6444CAA19B0669EB905EDEEB94EEF224B73564D9F25881DE93DDB63138CCC. Restored with pg_restore --exit-on-error into fresh local_restore_readiness_test in the task container: registrations2, grants5, QR5 preserved.
- Catalog verified daily/source unique indexes, cancellation FKs/check, QR-account and credit-spend uniqueness, optional collection columns and activation trigger. Scoped read-only retired SQL executed successfully against reviewed Local IDs.
- Authenticated existing Admin#1 through actual Backoffice: paused → reviewed current revision → setup audit16 imports1 → reload reports complete. Import exactly preserves source instant/scanner and Thai2026-10-05 date. Original registrations/grants/sessions/tickets/stock row digests unchanged; spins/credits/collections all0 before/after. No original password changed.
- Local left paused deliberately. QR state unchanged: 4 historical Oct4 open; Oct5 QR1. closed; no Oct6 QR. No automatic QR opening, unpause or smoke prize allocation. Yesterday's imported attendance is not today's attendance.
- Synthetic preview API network stopped before setup submission: dialog retains request and disables inputs; after API restart, same command succeeds with one matching audit row. Mobile scanner shows server2026-10-06 daily Main label without sidebar overlay. Screenshots retained privately.
- PRIS synthetic account login uses actual login and existing Turnstile configuration. T09 regression found: configuration409 cleared pending QR; switching language/reloading made QR invalid. Reopened T09 and fixed only ATTENDANCE_SETUP_REQUIRED retention. Actual TH→EN→reload preserves Browser QR and enabled retry. npm test63/63, scoped lint/tsc PASS; production build pending before returning to T12.

- T09 re-test complete: npm tests63/63, scoped ESLint, tsc and production build PASS. Browser TH→EN→reload asserts same QR visible and retry enabled (previously failed). Within approved T09 file scope; configuration error alone retains pending QR; other 4xx handling unchanged. T12 resumed.
- Browser synthetic setup-error retry after actual setup now correctly returns CHECKIN_REQUIRED with ticket link. Actual Backoffice scanner Main91 checks in new synthetic account using READINESS-BROWSER; PRIS original QR claim succeeds once and owner History reads server-recorded test reward. Test allocation performed only through guarded synthetic service fixture, no operational prize allocated.

## Final verification and delivery
- Final sequential guarded wheel29/29 then attendance18/18 PASS, including actual imported-source cancellation held behind the shared fence: setup waits, STALE commits no audit, reviewed retry imports0 and preserves cancelled history. API build PASS.
- Backoffice scoped ESLint zero errors (2 existing scanner hook warnings), tsc and production build PASS. PRIS63/63, scoped ESLint, tsc and production build PASS (existing middleware/test-renderer deprecation warnings). All diffs reviewed; diff --check passes.
- Actual browser setup, uncertain request retry, server state reload, daily scanner desktop/mobile, participant setup-specific TH/EN recovery, QR claim, owner history/reward proof, and synthetic Open/Close QR controls verified. Claimed1/spent1 stays unchanged while QR toggles. Static pickup copy remains; no new hidden deadline.
- Test fixtures parked: event46 READINESS-PREVIEW, wheel paused, Browser QR closed, original Synthetic QR-A closed. Only created preview services stopped. Original API3002 and PRIS3003 were not stopped/reconfigured; Local Backoffice3001 will be shown for handover.
- Local final SQL: duplicate active daily/source/QR-account/credit-spend rows0, negative stock0. Policydaily/enabled; original wheelv3/pool4/stock unchanged. Current Thai day2026-10-06 has no attendance; imported2026-10-05 history does not grant today's eligibility. Local left paused and no Oct6 QR created.
- Railway policy/deployment NOT VERIFIED, no activation attempted. Physical LINE iOS/Android, camera, slow-network/rotation and stagingR2 remain NOT VERIFIED/DEFERRED from prior scope; desktop browser transport-failure test does not claim these device checks.
- Task container pris2026-attendance-readiness-test-20261005 and its one anonymous PostgreSQL volume retained pending explicit deletion approval under user requirement3. Full Local backup outside Git is retained; other original/historical Docker containers are untouched. Preview/artifact directories with node_modules junctions retained, never recursively moved/deleted.
- T07–T12 implementation committed per affected repo with title/body; no push/deploy. API03df628, Backofficec6642f9; participant/docs hash reported at delivery (cannot embed its own future hash).
- Final handover: user explicitly chose to retain the task container and its anonymous volume. No Docker deletion performed. Task container remains running; confer-postgres-dev remains healthy. Retained Local backup SHA256 rechecked and unchanged. Implementation commits: API03df628, Backofficec6642f9, PRISefe5017; all three working trees verified clean before this documentation-only handover update. No push/deploy.
