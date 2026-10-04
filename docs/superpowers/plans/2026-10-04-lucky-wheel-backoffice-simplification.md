# Lucky Wheel Backoffice Simplification Implementation Plan

**Goal:** Make wheel setup usable in one pass, preserve reward confirmation, and provide downloadable QR credits from the event's real PRIS URL.

**Architecture:** `conference-api` remains the authority for stock, daily windows, QR status, and reward confirmation. Backoffice edits use authenticated API reads/mutations; PRIS displays owner-only reward proof. Existing spin/claim/redemption data is preserved. Each task below ends with its focused test gate before the next task begins.

**Tech Stack:** TypeScript, Fastify, Zod, PostgreSQL/Drizzle, Next.js/React.

## Global constraints

- Follow [approved design](../specs/2026-10-04-lucky-wheel-backoffice-simplification-design.md) exactly; do not change Main Session check-in, QR credit limits, or spin allocation.
- Preserve historical tables and records. New database migration is additive or relaxes checks only. Do not migrate or mutate the existing `confer-postgres-dev` data as part of tests.
- `events.website_url` is the QR destination source. Its current local value for PRIS points to Backoffice (`http://localhost:3001`); report this and do not silently change it.
- Existing reward confirmation, owner-only proof, and claim status remain. Hidden collection deadlines must no longer block confirmation.
- One-day window remains shared by QR claim and spin. Bangkok dates/times remain server-authoritative.
- QR open/close reason alone becomes optional; credit revocation, schedule edits, and later stock top-ups retain required reasons.
- Do not push or deploy. Ask before deleting any Docker container/volume or changing event website data.
- No subagent or superpowers execution method is required. Execute inline with the same task gates.

## File map

- `conference-api/src/modules/lucky-wheel/schemas.ts`: request contracts for publish, QR status, and stock.
- `conference-api/src/modules/lucky-wheel/service.ts`: atomic publish/initial stock, stock adjustment guard, wheel read model.
- `conference-api/src/modules/lucky-wheel/day-schedule.ts`: admin configured-day list.
- `conference-api/src/modules/lucky-wheel/qr-credits.ts`: optional QR reason and event-website QR generation.
- `conference-api/src/modules/lucky-wheel/rewards.ts`: remove hidden deadline gate while preserving confirmation.
- `conference-api/src/modules/lucky-wheel/routes.ts`: authenticated day list and QR download/read contract.
- `conference-api/drizzle/0036_lucky_wheel_setup_simplification.sql`: relax QR reason constraints and wheel activation trigger without dropping records.
- `conference-backoffice/src/components/lucky-wheel/WheelConfiguration.tsx`: initial quantity and simplified wheel editor.
- `conference-backoffice/src/components/lucky-wheel/StockAdjustmentDialog.tsx`, `conference-backoffice/src/app/lucky-wheel/page.tsx`: top-up only.
- `conference-backoffice/src/components/lucky-wheel/QrRights.tsx`: configured day selection, optional status reason, QR download.
- `conference-backoffice/src/components/lucky-wheel/QrProjection.tsx`: remove after all imports are replaced.
- `conference-backoffice/src/lib/api.ts`, `conference-backoffice/src/types/lucky-wheel.ts`: client contracts.
- `Pris2026/src/components/lucky-wheel/RewardProof.tsx` and locale messages: fixed pickup instruction, no deadline UI.

## Task 1: Isolated PostgreSQL test environment and baseline

- [ ] Check the three Git trees are clean and record the current API/Backoffice/PRIS build and focused test commands.
- [ ] Start one dedicated `postgres:16-alpine` Docker test container with a database name containing `test`, bind a free localhost port, and verify `SELECT 1`. Set `TEST_DATABASE_URL` only in the testing shell; never point it at `confer-postgres-dev`.
- [ ] Run the current Lucky Wheel API focused tests and builds to distinguish pre-existing failures. The task passes when the container is healthy and baseline commands have recorded results; later tasks must not be blocked by known baseline failures unrelated to this change.

## Task 2: Initial stock at first publish

- [ ] Add failing Zod/service tests: new prize accepts `initialQuantity` as an integer `>= 0`; no-prize rejects it; existing prize cannot change its initial quantity; a stale version and replay cannot add stock twice; 100 concurrent publish attempts produce one initial credit.
- [ ] Extend the publish contract to carry initial quantity for newly created prize segments. Existing published configurations without the property normalize compatibly to zero, but live stock is never reset from configuration.
- [ ] In `publishWheel`, insert a new prize segment with `remaining=initialQuantity` inside the existing transaction and record the initial credit in publish audit (segment, before 0, after quantity, actor/time). Keep existing segment stock untouched. Ensure `pool_revision` changes only when eligibility of a prize channel changes.
- [ ] Make the stock API reject negative `delta` for new requests; historical negative audit entries remain readable.
- [ ] Run `schemas`/`service` unit and PostgreSQL integration tests plus `npm run build` in `conference-api`; proceed only when the focused gate passes.

## Task 3: Simplify pickup configuration without removing confirmation

- [ ] Add failing tests for a wheel published without collection settings and a historical prize confirmed after its former deadline. Assert owner-only proof and one-time redemption still work.
- [ ] Relax the wheel activation trigger in migration `0036` so an enabled wheel requires a published configuration and valid Main Session, but not collection instructions/deadline. Preserve existing columns/values.
- [ ] Remove collection settings from new publish validation and `publishWheel` writes. Remove the deadline check from `rewards.ts` confirmation while keeping identity check, generation/idempotency, audit, and duplicate protection.
- [ ] Remove collection settings/deadline from current attendee responses where unused; preserve legacy database values only for historical audit compatibility.
- [ ] Run migration rehearsal, reward integration/route tests, and API build. Proceed only when these pass.

## Task 4: QR status reason and valid downloadable destination

- [ ] Add failing tests for open/close with omitted/blank reason, idempotent retry, actor/time audit, and the existing required reason for individual credit revocation.
- [ ] Relax only the two QR status consistency checks in migration `0036`: opened/closed actor and timestamp still pair; reason may be null. Normalize blank reason to null in schema/service/audit.
- [ ] Add failing tests for QR generation from the selected event's `website_url`, absent/invalid URL, local HTTP allowance, production HTTPS, embedded credentials/query/fragment, and a URL equal to the caller's Backoffice origin.
- [ ] Update the authenticated QR read endpoint to use the validated event URL to construct `/th/lucky-wheel/claim#<opaque-qr-id>` and return the PNG data/target URL. Do not change QR status or create a claim on download. Remove `PRIS_WHEEL_CLAIM_ORIGIN` as the required source, keeping compatibility only if tests prove another consumer needs it.
- [ ] Run QR integration/route tests, migration test, and API build. Proceed only when these pass.

## Task 5: Configured-day admin list

- [ ] Add failing API route/integration tests for an authenticated event-scoped list of configured Bangkok days, ordered ascending, and isolation from another event.
- [ ] Add `GET /backoffice/events/:eventId/days` in the Lucky Wheel route group and its query in `day-schedule.ts`, using existing admin authorization. Return date/start/end/version without changing the day window mutation contract.
- [ ] Run day-schedule integration, route tests, and API build. Proceed only when these pass.

## Task 6: Backoffice configuration and Stock top-up

- [ ] Add initial quantity input only to new prize cards, validate integer `>=0`, and publish it through the updated API contract. Existing prize cards show server remaining quantity read-only. Remove collection instructions/deadline form and validation.
- [ ] Remove the Backoffice stock reduction button/path and make the Stock surface describe later top-ups. Keep required reason, idempotency, audit display, and current-stock refresh after success.
- [ ] Update API types and client calls; verify old configurations still load and an initial quantity is never reapplied when saving subsequent name/image edits.
- [ ] Run scoped ESLint, `tsc --noEmit`, and production build in `conference-backoffice`. Proceed only when they pass.

## Task 7: Backoffice day selection and QR download

- [ ] Fetch the configured-day list on event change. Select a saved configured day in `sessionStorage` for that event, else today, else next future, else latest past; clear selection when no dates exist. Preserve manual new-date selection and reload after creating a day.
- [ ] Make QR open/close reason optional in UI and request type, but leave individual credit revocation reason required. Preserve status confirmation and retry keys.
- [ ] Replace the projection modal/button with Download PNG; use the authenticated QR response's `qrDataUrl` and a sanitized event/date/label filename. Display the target link and a clear error for a missing/wrong `events.website_url`. Remove `QrProjection.tsx` only after confirming no imports remain.
- [ ] Run scoped ESLint, `tsc --noEmit`, and Backoffice production build. Verify selected-date and QR flows in browser against the isolated/local API before proceeding.

## Task 8: PRIS reward copy and final verification

- [ ] Replace configurable collection instructions/deadline and deadline-expired UI with the fixed TH/EN pickup instruction. Keep prize identity, proof QR, owner-only access, and current claim status.
- [ ] Run PRIS focused tests, scoped ESLint, `tsc --noEmit`, and production build.
- [ ] Run the complete Lucky Wheel API route/service/reward/QR/day/migration tests against the dedicated test database, then API/Backoffice/PRIS production builds. Check no QR download changes claim counts or QR status; verify one-time reward confirmation still works. Inspect the resulting diffs and Git status.
- [ ] Commit coherent passing changes in each affected repository with title and body. Do not push/deploy. Report the incorrect local event website URL and ask separately before changing it or deleting the dedicated test container/volume.

## Gate rule

Finish each task's listed tests before the next task. If a test can pass only after a later task, record the exact dependency and re-run the blocked test immediately after that prerequisite passes. After Task 8 passes, repeat the full integrated verification once.
