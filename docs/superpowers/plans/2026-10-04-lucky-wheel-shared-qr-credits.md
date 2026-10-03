# PRIS2026 Lucky Wheel — Shared QR Credits Implementation Plan

**Goal:** Replace the wheel's one-spin-per-Bangkok-day rule with one durable credit per distinct shared QR and PRIS account, while preserving daily Main Session check-in and the existing prize, stock and redemption system.

**Architecture:** PostgreSQL owns QR uniqueness, credit consumption and schedule versions. Fastify serializes schedule edits, QR claims and spins with the existing wheel-first lock order. PRIS adds a camera-link claim page and multi-credit wheel state; backoffice adds day-window and QR management to its current wheel area.

**Tech Stack:** TypeScript, Fastify, Zod, Drizzle/PostgreSQL, postgres-js, node:test/tsx, Next.js 16, React 19, next-intl, and the API's installed `qrcode` package. No new worker, queue, storage service or scanner dependency.

## Global constraints

- Approved source: `D:/confer/confer/conference/Pris2026/docs/superpowers/specs/2026-10-04-lucky-wheel-shared-qr-credits-design.md`. The old wheel implementation plan is historical.
- One admin-defined Bangkok-day interval gates **both** new claims and new spins. Admin may edit **both** boundaries after opening QRs; each edit records actor, reason, server time, old/new values and version.
- Unspent, unrevoked credits become temporarily unusable outside the current interval and usable again if that same Bangkok date reopens. Yesterday's credits never revive. A committed spin/reward/stock deduction never changes.
- A shared QR gives at most one credit per authenticated account. Multiple registrations do not multiply it. Opening QR-B never closes QR-A.
- Claim and spin both require an active PRIS account, confirmed event registration, original Main Session entitlement and active check-in for the QR/current Bangkok date. Preserve the original entry QR, check-in policy, history and reports.
- Replace the wheel's Main Session clock gate with the editable day interval. Do not change the scanner's Main Session time gate.
- Preserve equal probability per live segment, unlimited no-prize slots, shared physical stock, pause behavior, prize proof and one-time redemption. No physical stock means neither new claims nor new spins.
- Admin alone creates/opens/closes QRs, edits the day interval, inspects claims and revokes an unspent claim. Staff check-in/reward permissions do not grant QR administration.
- First release has no manual claim code, code-entry field, lookup API, QR-file download/print feature or alternate claim route. The QR opens PRIS using the phone's ordinary camera; no LINE camera dependency.
- Work only in the three existing repositories. Keep PostgreSQL test container/volume. Do not run migrations on production, change live grants, push or deploy.

## Repository and interface map

The workspace root is not the application Git repository. `conference-api`, `Pris2026` and `conference-backoffice` are separate Git repositories; every command below runs in the named repo. Verify each checkout is clean before execution and preserve unrelated edits.

| Repo | Files and responsibility |
| --- | --- |
| conference-api | `drizzle/0035_lucky_wheel_qr_credits.sql` and `src/database/schema.ts`: additive day, QR and credit tables; legacy spin index transition |
| conference-api | `src/modules/lucky-wheel/access.ts`: shared wheel clock, active-account, entitlement and daily-attendance queries extracted from `service.ts` |
| conference-api | `src/modules/lucky-wheel/day-schedule.ts`: versioned day reads/edits and audit |
| conference-api | `src/modules/lucky-wheel/qr-credits.ts`: QR lifecycle, projection data, claims, inspection and revocation |
| conference-api | `src/modules/lucky-wheel/service.ts`: credit-aware eligibility and atomic spin; retain prize allocation and reward snapshots |
| conference-api | `src/modules/lucky-wheel/schemas.ts`, `types.ts`, `routes.ts`, `src/config/env.ts` and `.env.example`: bounded DTOs, auth, rate limits and canonical PRIS claim origin |
| conference-api | `src/modules/lucky-wheel/*.test.ts`: migration, route, service, claim, concurrency, reward and load proof |
| Pris2026 | `src/lib/localizedRedirect.ts`, `refreshRedirect.ts`, `luckyWheel.ts` and their tests: safe login return, claim client and request-key recovery |
| Pris2026 | `src/app/[locale]/lucky-wheel/claim/page.tsx`, `src/app/[locale]/lucky-wheel/page.tsx`, `src/components/lucky-wheel/ActivityTicket.tsx`, `messages/th.json`, `messages/en.json`: claim journey and multi-spin UI |
| conference-backoffice | `src/types/lucky-wheel.ts`, `src/lib/api.ts`, `src/components/lucky-wheel/QrRights.tsx`, `src/components/lucky-wheel/QrProjection.tsx`, `src/app/lucky-wheel/page.tsx`: schedule, projection, claim audit and revocation |

Use these DTO names consistently across the three repositories. Exact additional response-envelope fields follow the existing routes.

```ts
type DayWindow = {
  date: string; startAt: string; endAt: string; version: number;
};
type CreditAvailability = {
  unspentCredits: number; spendableCredits: number;
  hasExpiredPriorDayCredit: boolean; currentWindow: DayWindow | null;
  latestSpin: SpinDto | null;
};
type ClaimCreditResult = {
  created: boolean; qrId: string; qrName: string; creditId: string; date: string;
  claimedAt: string; currentDeadline: string; state: "spendable" | "outside_window" | "blocked" | "spent" | "revoked" | "prior_day_expired";
};
type DayWindowInput = {
  date: string; startAt: string; endAt: string;
  expectedVersion: number | null; reason: string | null;
};
```

`SpinDto` is the existing exported type in `conference-api/src/modules/lucky-wheel/service.ts`; expose its attendee-safe shape in the PRIS client without adding reward-token secrets.

The QR display URL is built from a configured, validated `PRIS_WHEEL_CLAIM_ORIGIN` and a random UUID QR ID; never accept an arbitrary URL from a request. Use the explicit default locale and a URL fragment (`/th/lucky-wheel/claim#<qr-uuid>`) so a locale redirect cannot drop the QR ID and web access logs/auth return URLs need not include it. The PRIS claim page keeps the ID in same-origin session storage through login or a locale switch, clears the fragment immediately, and sends the ID only in a no-store JSON POST body. The spec's read-only QR preview route must suppress the raw ID in application request logs; verify that with a captured logger. All server responses read current schedule state.

## Execution and verification gates

- Work through T01–T12 in order, using `- [ ]` boxes. Use brainstorming before each task to check its changes against the approved spec. For UI tasks use impeccable and frontend-design to preserve the approved B visual direction; use api-design-principles for API contract review. Caveman is for chat updates and final summaries only, not code, tests, documents or commit messages.
- Before changing a task, write its failing behavior test; confirm failure for the intended reason; implement the minimum; run the task's targeted checks, diff check and build/type checks where listed. Mark PASS only after all required checks pass.
- A task blocked solely by an explicitly planned later dependency may be recorded as DEFERRED_DEPENDENCY in `Pris2026/docs/superpowers/verification/lucky-wheel-qr-credits/acceptance.md` with exact failing command, output, dependent task and retest trigger. Immediately after the dependency task passes, rerun all deferred checks before proceeding. Unknown failures and unavailable required infrastructure are not dependency exceptions.
- On a spec conflict or an unplanned file/API/business-rule change, stop, preserve work and ask the user with evidence. Do not create mock state to hide missing backend contracts.
- After T01–T07 pass, commit the API batch in `conference-api` with title **and** body stating task numbers and actual verification. After T08–T12 and final verification pass, commit relevant changes separately in `Pris2026` and `conference-backoffice`, plus any API integration fixes. Stage only task paths; never amend, push or deploy.

### T01 — Add compatible credit schema

**Files:** `conference-api/drizzle/0035_lucky_wheel_qr_credits.sql`, `conference-api/src/database/schema.ts`, `conference-api/src/modules/lucky-wheel/migration.integration.test.ts` and wheel test bootstraps that currently load only `0034_lucky_wheel.sql`.

**Contract:** Create one day row per `(wheel_id, Bangkok date)` with `start_at`, `end_at`, positive `version`; named QR rows with random UUID IDs and explicit open/closed state; claim rows with unique `(qr_id, user_id)`, claim attendance evidence, claim-time displayed deadline, revocation and spent fields. Add nullable `credit_claim_id` FK to spins with a non-null unique index. Replace `lucky_wheel_spins_event_user_day_unique` by the same unique key **only where** `credit_claim_id IS NULL`, preserving old rows and allowing multiple credit-backed spins per day. Reuse `lucky_wheel_audit_events` for append-only schedule/QR/revocation records.

- [ ] Add a migration test that applies `0034` then `0035` twice safely, proves preexisting spin/reward rows survive, two new same-day spins with different credit IDs are allowed, a repeated credit ID is rejected, and old null-credit duplicate day rows remain rejected.
- [ ] Run `npx --no-install tsx --test src/modules/lucky-wheel/migration.integration.test.ts` with guarded `TEST_DATABASE_URL`; expect the new assertions to fail before the migration exists.
- [ ] Write `0035` and matching Drizzle schema; update the five wheel test bootstraps that read `0034` so their test-only schema also receives `0035`. Keep `attendance_id` non-null.
- [ ] Re-run the migration test, existing wheel integration tests and `npm run build`; inspect `git diff --check`. Record SQL constraints and results before T02.

### T02 — Share the existing entitlement/check-in checks

**Files:** `conference-api/src/modules/lucky-wheel/access.ts`, `service.ts`, `service.integration.test.ts`.

**Contract:** Extract the existing database clock, active-account, confirmed Main Session entitlement and active daily check-in queries from `service.ts` into `access.ts` without changing their SQL predicates. Both QR claim and spin must call these same helpers. Keep the transaction's wheel-first lock order.

- [ ] Add focused regression assertions for multiple registrations on one account, cancelled check-in and re-check-in on the same Thai day in `service.integration.test.ts`.
- [ ] Run that integration test to capture the existing behavior, then extract and import the shared helpers; leave every old predicate intact.
- [ ] Run `npx --no-install tsx --test src/modules/lucky-wheel/service.integration.test.ts` and `npm run build` to PASS. Inspect the diff to confirm no scanner route or attendance table was changed.

### T03 — Admin reads and edits one shared day window

**Files:** `conference-api/src/modules/lucky-wheel/day-schedule.ts`, `schemas.ts`, `routes.ts`, `routes.test.ts`, `day-schedule.integration.test.ts`.

**Contract:** `PUT /api/backoffice/lucky-wheel/events/:eventId/days/:date` accepts only one start/end pair plus expected version and edit reason. Validate Bangkok date, `start < end` and same-day bounds (exclusive next-midnight end allowed). Under wheel then day locks, compare the expected version; write new bounds/version and an audit entry in one transaction. `GET .../days/:date` reads current state; `GET .../days/:date/changes` paginates actor/reason/old/new history. Admin auth matches existing wheel routes.

- [ ] Write route tests for 401/403, malformed date/body, non-admin access, stale version 409 and no GET mutation; write PostgreSQL tests for post-open start/end edit, audit and simultaneous-edit conflict.
- [ ] Run the new route/integration tests and confirm they fail because the endpoints are missing.
- [ ] Implement schedule service, schemas and routes; use database time and version checks, not a phone-provided clock. Do not add a second interval.
- [ ] Re-run the targeted tests and `npm run build`; verify both claim and spin will be able to lock/read the same day row through the exported schedule helper.

### T04 — Admin QR lifecycle, projection and individual revocation

**Files:** `conference-api/src/modules/lucky-wheel/qr-credits.ts`, `schemas.ts`, `routes.ts`, `routes.test.ts`, `qr-credits.integration.test.ts`, `src/config/env.ts`, `.env.example`.

**Contract:** Admin creates a bounded idempotent batch of named, initially closed QRs for one existing day; explicitly opens/closes each with actor/time/reason. Opening B never changes A. Paginated admin reads show QR state, claim/spent/revoked counts and recipients. A separate detail response returns the canonical QR URL and a generated QR image using the installed `qrcode` package. Individual revocation needs reason, can affect only an unspent claim, and keeps the same `(QR,user)` uniqueness. A spent claim returns 409.

- [ ] Write route tests for active admin only, bounded batch input, official URL construction, closed/open status, no automatic A closure, paginated recipient scoping and revocation errors.
- [ ] Write DB tests for idempotent batch retry, independent QR open/close and revocation of a manually marked spent claim. Record the QR close/claim race as a T05 dependency and the revoke/real-spin race as a T07 dependency; do not pretend either passes before its service exists.
- [ ] Implement lifecycle and projection responses. Validate the configured PRIS origin as HTTPS (permit localhost HTTP only in tests/local development); do not expose reward redemption tokens or add a manual code.
- [ ] Run targeted route/DB tests and `npm run build` to PASS, with only the explicitly recorded T05/T07 race assertions eligible for deferral.

### T05 — Attendee QR preview and one-claim-per-account service

**Files:** `conference-api/src/modules/lucky-wheel/qr-credits.ts`, `schemas.ts`, `routes.ts`, `routes.test.ts`, `qr-credits.integration.test.ts`.

**Contract:** `POST /api/lucky-wheel/events/:eventId/credit-claims` takes `{qrId: UUID}` only. Actor comes from JWT. Return 201 for the first claim or 200 with the original credit and **current** state for repeat/retry, even after QR closure or schedule edit. For a new claim validate active account, confirmed registration, Main Session entitlement, active check-in for the QR date, QR open, today's Bangkok date, current day window, wheel published/unpaused and physical stock. Under wheel/day/QR locks insert once with DB uniqueness. `GET /api/lucky-wheel/events/:eventId/qr-codes/:qrId` returns only safe label/date/current deadline without granting credit; suppress its path ID in application request logs.

- [ ] Add route tests for auth, body bounds, event mismatch, no GET mutation, no raw QR ID in captured application logs and rate limit; add DB tests for two users sharing A, same user repeating A, same user receiving A and B, multiple registrations and claim after cancelled check-in.
- [ ] Test 100 concurrent requests for the same `(QR,user)` against the guarded PostgreSQL DB: assert exactly one credit; test 100 distinct eligible users receive 100 credits. An HTTP 429 is acceptable above the per-account route limit; DB uniqueness must still be proven.
- [ ] Implement claim and preview; on lost-response retry query the existing claim before rejecting current QR/window/pause state. No client-supplied owner, date, check-in or outcome is accepted.
- [ ] Run targeted route/DB tests, the deferred T04 QR close/claim race, `npm run build` and `git diff --check` to PASS.

### T06 — Replace daily eligibility with current credit availability

**Files:** `conference-api/src/modules/lucky-wheel/service.ts`, `types.ts`, `service.integration.test.ts`, `routes.test.ts`.

**Contract:** `GET .../eligibility` returns `unspentCredits`, `spendableCredits`, current day window/version, `hasExpiredPriorDayCredit` and a read-only latest committed spin for display. Remove terminal `spinByDay`/`ALREADY_SPUN` logic and the wheel's Main Session clock gate; keep Main Session entitlement and today's active check-in. Add `NO_CREDIT` and `DAY_WINDOW_CLOSED` block codes. Outside the current window, a held unspent credit is unavailable **temporarily**; yesterday's unspent credit is permanently outside today's pool. The latest spin never grants or blocks another right.

- [ ] Write failing integration cases for five current-day claims, window shortened then extended, start moved later, cancelled/replaced attendance, yesterday's claim and no physical stock.
- [ ] Implement a single eligibility response shape for success and every block path; use the current day row, not claim-time deadline. Preserve configuration/segment state so sold-out slots stay visible.
- [ ] Run `npx --no-install tsx --test src/modules/lucky-wheel/service.integration.test.ts src/modules/lucky-wheel/routes.test.ts` and `npm run build` to PASS.

### T07 — Spend one credit in the existing atomic spin transaction

**Files:** `conference-api/src/modules/lucky-wheel/service.ts`, `types.ts`, `schemas.ts`, `service.integration.test.ts`, `routes.test.ts`, `load.integration.test.ts`.

**Contract:** After replay-by-idempotency-key, lock the wheel, current day, selected oldest unspent credit, active attendance and stock in consistent order. Recheck current schedule and all claim-time eligibility conditions except QR open (closing a QR does not revoke an earned credit). Write `credit_claim_id` to the spin and mark that credit spent in the same transaction. Remove the old daily duplicate return. A no-prize result also spends one credit; paused/out-of-stock/out-of-window failures spend nothing. Include current day schedule version in new spin input; stale clients reload, but replay of a committed request returns its original result first.

- [ ] Write failing DB tests for five QR credits yielding five same-day spins, sixth denied, duplicate spin request replay, same credit racing two requests, last stock unit race, revoked-credit race and close-QR after claim. Assert reward proof/history and old null-credit rows remain valid.
- [ ] Update spin service and DTO/schema/route; keep existing fair-slot draw, prize snapshots, stock deduction and redemption path unchanged. Return the committed result even if a later schedule edit closes the window.
- [ ] Run `npx --no-install tsx --test --test-concurrency=1 src/modules/lucky-wheel/*.test.ts`, `npm run build` and `npm run test:lucky-wheel:load` with the guarded test DB. The concurrency flag prevents integration files from resetting the shared test schema simultaneously. Check no negative stock, duplicate credit claim, double spend or altered committed result.
- [ ] Re-run any T04 deferred real-spin race check. Only after T01–T07 all PASS, make the API batch commit with title/body and record SHA in the acceptance ledger.

### T08 — PRIS login return and automatic camera-link claim

**Files:** `Pris2026/src/lib/localizedRedirect.ts`, `localizedRedirect.test.ts`, `refreshRedirect.ts`, `refreshRedirect.test.ts`, `luckyWheel.ts`, `luckyWheel.test.ts`, `src/app/[locale]/lucky-wheel/claim/page.tsx`, `messages/th.json`, `messages/en.json`.

**Contract:** Whitelist only fixed `/lucky-wheel/claim` for login return. A camera QR carries its UUID in the URL fragment; read it once, validate UUID, save it in same-origin session storage for login, remove the fragment from browser history, and automatically call the existing authenticated claim POST on return. Clear the stored ID after a definite success or definite 4xx failure. Duplicate/opened-again pages show the server's original credit status. Unknown network outcome retains the QR ID and retries the same claim safely. No embedded camera, manual entry, arbitrary redirect or client-selected owner/date.

- [ ] Extend redirect/client tests for TH/EN login return, safe UUID fragment, malicious external/protocol-relative/backslash redirects, duplicate claim 200, 201 first claim, closed QR, cancelled check-in and network retry.
- [ ] Implement the mobile claim page and TH/EN states using the existing PRIS auth context and ticket lookups. Show server-sourced QR name/date/current deadline and the exact new-credit message only on 201.
- [ ] Run `npx --no-install tsx --test src/lib/localizedRedirect.test.ts src/lib/refreshRedirect.test.ts src/lib/luckyWheel.test.ts`, scoped ESLint, `npx --no-install tsc --noEmit` and `npm run build` to PASS.

### T09 — PRIS wheel supports multiple credits and changed deadlines

**Files:** `Pris2026/src/app/[locale]/lucky-wheel/page.tsx`, `src/components/lucky-wheel/ActivityTicket.tsx`, `src/lib/luckyWheel.ts`, `src/lib/luckyWheel.test.ts`, `messages/th.json`, `messages/en.json`.

**Contract:** Remove the `existingSpin` terminal state. Show held vs currently spendable credits and current Bangkok deadline. One committed animation uses its frozen wheel snapshot; after completion the page can spin again with a new key if another credit is spendable. On reload, the latest committed spin may be displayed, but an uncertain request retains its key and reconciles by retrying the same POST, never by assuming that historical spin belongs to the pending key. Refocus/new-spin refreshes eligibility and schedule version. Outside today's window say **“อยู่นอกช่วงเวลาหมุนที่กำหนดในขณะนี้”**; only a prior-day credit says **“สิทธิ์ของวันก่อนหมดอายุแล้ว”**.

- [ ] Add client tests for two successive unique keys, retrying one uncertain key, stale schedule reload, temporary window closure/reopen and prior-day expiry.
- [ ] Implement state transitions and TH/EN copy without changing wheel geometry, fair-slot explanation, prize history or proof.
- [ ] Run `npx --no-install tsx --test src/lib/luckyWheel.test.ts`, scoped ESLint, `npx --no-install tsc --noEmit` and `npm run build` to PASS.

### T10 — Backoffice day and QR controls

**Files:** `conference-backoffice/src/types/lucky-wheel.ts`, `src/lib/api.ts`, `src/components/lucky-wheel/QrRights.tsx`, `src/components/lucky-wheel/QrProjection.tsx`, `src/app/lucky-wheel/page.tsx`.

**Contract:** Add an admin-only QR section/tab to the existing wheel page. Select Bangkok date; create/edit the one shared start/end pair, require reason on edit, show old/new audit and version-conflict refresh. Create a bounded batch of named closed QRs, open/close explicitly, and project a chosen QR with name/current end time. Projection refreshes current state so a later schedule edit is visible. Show QR-A and QR-B as independently open; no print/download control.

- [ ] Wire typed API methods to T03/T04 authenticated endpoints; validate and display Bangkok time without using the workstation clock for authorization.
- [ ] Build responsive controls and projection using the existing backoffice visual system; handle loading, failed mutation, duplicate retry and stale version states.
- [ ] Run `npm run lint`, `npx --no-install tsc --noEmit` and `npm run build` in `conference-backoffice`; manually inspect a narrow/mobile viewport and projected large-screen view against API test data.

### T11 — Backoffice recipient inspection and scoped correction

**Files:** `conference-backoffice/src/types/lucky-wheel.ts`, `src/lib/api.ts`, `src/components/lucky-wheel/QrRights.tsx`, `src/app/lucky-wheel/page.tsx`.

**Contract:** Paginate/filter recipient credits by QR/day; show claimed, spent, revoked and currently unavailable counts without equating current-window closure with permanent revocation. Admin can revoke **one unspent claim** with reason and sees actor/time audit. A spent claim is read-only; QR closure never bulk-revokes recipients. Existing reward-collection and spin-result tabs continue to show multiple same-day spins.

- [ ] Add typed read/revoke methods and explicit UI states for pending, committed, duplicate response and 409 spent/version conflict.
- [ ] Verify the API's T04/T07 route tests cover authorization and revoke/spin races; do not use mocked data to mark recipient flow complete.
- [ ] Run `npm run lint`, `npx --no-install tsc --noEmit` and `npm run build`; inspect mobile table overflow and a two-QR/two-recipient scenario.

### T12 — Whole-flow verification and local finish

**Files:** Test fixes only in the planned paths; `Pris2026/docs/superpowers/verification/lucky-wheel-qr-credits/acceptance.md` for evidence.

- [ ] Run `npx --no-install tsx --test --test-concurrency=1 src/modules/lucky-wheel/*.test.ts` and `npx --no-install tsx --test --test-concurrency=1 src/modules/attendance/policy.test.ts src/modules/attendance/migration.integration.test.ts src/modules/attendance/service.integration.test.ts src/modules/attendance/readers.integration.test.ts` against the guarded test DB; run `npm run test:lucky-wheel:load` and `npm run build`. Prove old null-credit spins, daily check-in scanning and reward redemption still pass.
- [ ] Re-run PRIS focused tests, lint, TypeScript and production build; run backoffice lint, TypeScript and production build. Check TH/EN login return, 15:00 claim → 17:00 shortened end → 17:30 temporary block → end extended to 20:00 → 18:00 spin, then permanent expiry after Thai midnight.
- [ ] Review all three repo diffs for unplanned migrations, manual-code paths, altered stock/redemption rules, QR-ID logging, secrets and generated artifacts. Record exact commands/results and any staging/real-device items still not verified.
- [ ] Commit the final passing changes in each changed repo with meaningful title **and** body. Check all three `git status --short` outputs. Do not push, deploy, run a production migration or delete the retained PostgreSQL container/volume.

## Field validation outside the local completion gate

Real LINE iOS/Android launch, ordinary phone-camera QR scan, browser auth return, slow network/rotation, large-screen projection and staging R2 remain explicitly **NOT VERIFIED** until tested on those surfaces. Local tests/builds do not imply that field validation passed.
