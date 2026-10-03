# PRIS2026 lucky wheel and daily Main Session attendance

Date: 2026-10-03, Asia/Bangkok.

Status: functional requirements confirmed; visual composition B approved by the user on 2026-10-03 (แบบ B). This document supersedes the earlier exploratory proposal. Design approval does not authorize production deployment, live data migration, or real prize allocation. Implementation follows the staged plan and its verification gates.

## Scope and existing-system boundaries

- Extend Pris2026, conference-api and conference-backoffice. No new application, authentication system, LINE account linking, worker or Redis service.
- Ordinary OA rich-menu URL to /[locale]/lucky-wheel. Use the current /ticket PRIS authentication journey, including restoration, expiry, 401 handling and safe localized return paths. Preserve the wheel destination through login, language switching, signup links if offered, and refresh. Changing browsers/devices can require login again.
- One PRIS account per event per Bangkok calendar day. Multiple registrations do not grant extra spins. Server authentication and ownership are authoritative; accept neither userId nor selected prize from the client.
- All confirmed registration types qualify when the owner has valid attendance for the configured Main Session today. No extra paid-ticket or role restriction.
- Reuse the ONE existing Main Session, existing registration-session entitlements and existing registration QR. No replacement Main Session per day, mass daily entitlement insertion, or pre-created attendance rows for the 300+ existing attendees.
- Daily attendance is enabled only for the explicitly configured PRIS event/Main Session pair. Workshop, gala and other events retain their existing attendance policies.
- Wheel is usable only during the Main Session start/end interval and while enabled, unpaused and at least one enabled real prize has stock. Use start inclusive/end exclusive, start <= serverNow < end. A session spanning several days also spans the intervening overnight hours: there is no additional per-day opening-hours rule in the confirmed scope.
- Expected audience: approximately 500 across the event and up to 100 concurrent spin requests. Prize examples are synthetic; admin supplies actual prizes later.
- Phase-one management, stock adjustments, publication, history, redemption, deadline extensions and corrections are ADMIN ONLY, following answer 13. The general staff/event-assignment requirements are retained as security boundaries for any later role expansion, not an authorization to add staff access now. Existing check-in staff keep their attendance permissions.

## Daily attendance

Entitlement means a registration may enter a session. Attendance means that entitlement was exercised on a specific day, at a specific time, by a specific scanning operator. These are separate records.

Add a daily attendance history referencing registration_sessions.id. Minimum fields: id, registrationSessionId, attendanceDate (SQL date in Asia/Bangkok), checkedInAt (timestamptz), checkedInBy, cancelledAt, cancelledBy and cancellationReason. Enforce exactly one ACTIVE row per (registrationSessionId, attendanceDate) using a partial unique index WHERE cancelledAt IS NULL. Cancellation fields must be consistent; preserve cancelled rows permanently under the retention policy. Re-check-in after cancellation creates another row, not an overwrite.

Use the server/database clock. New attendance dates are calculated at acceptance, never from browser fields. Do not allow ordinary staff to supply an attendance date or backdate scans. Preserve the existing session time-window checks and confirmed-registration/entitlement checks.

All applicable scan routes use one shared policy/writer: selected session, staff-assigned fast scan and multi-session check-in. For multi-session check-in, each session applies its own policy, and partial/duplicate outcomes must be explicit per session. Do not treat an earlier day's daily attendance as an already-checked-in error today. Concurrent duplicate scans return the first active row/time rather than creating another row or leaking a database exception.

Scanner displays the server-derived current day prominently, e.g. Main Session — เช็คอินวันที่ 30 ต.ค. Duplicate scans say เช็คอินวันนี้แล้ว and show the original time. Existing QR content remains raw regCode; reward QR is a separate token format and must not be accepted as an admission QR.

Cancellation targets a daily attendance ID and requires a reason, authorized actor and timestamp. It does not clear other dates. Preserve existing non-admin cancellation restrictions, including the current short undo window, unless separately changed. Cancellation before spin acceptance invalidates eligibility. Cancellation after a committed spin does not revoke the result, replenish stock or restore the day's spin. Spin and cancellation coordinate on the relevant attendance record so their ordering is unambiguous; store the accepted attendance ID on the spin.

Compatibility checkedInAt is never authoritative for today's status for the configured daily session. Retain its legacy summary meaning for existing consumers until updated; daily readers use the new history. Other sessions retain their original single-check-in behavior. Identify every reader/writer before implementation, especially check-in list/statistics, scanner, registration detail, reports, exports and undo.

## Legacy data and reporting

Before enabling: read-only inventory of the actual PRIS event, Main Session, existing confirmed registrations and their entitlement links. Report missing/duplicate/inconsistent links for explicit correction; do not invent or silently grant entitlements. The existing unique registration/session constraint remains.

Migrate only non-null legacy check-in timestamps for the configured Main Session, preserving timestamp and actor. The existing timestamp-without-timezone columns represent UTC: derive Bangkok date by interpreting UTC first, then converting. Migration is repeat-safe and uses a stable legacy source key, so a cancelled migrated record cannot be resurrected by rerunning migration. No inferred attendance on unrecorded dates. Establish a controlled writer cutover so backfill and live scans cannot lose or duplicate records. Rollback must preserve daily history and reward allocations; do not collapse several days into one legacy timestamp and declare rollback complete.

Add date filters to attendance list, statistics, registration detail and exports. Distinguish:

1. Entitlements/eligible registrations: derived from the original entitlement set, never multiplied by joining daily history.
2. Attendees on selected date: distinct linked user identities with active attendance.
3. Unique attendees across the event: distinct linked user identities over the whole interval.
4. Attendance occurrences: distinct attendee/day for the configured Main Session; two days by one user count twice. Keep raw scan-history rows separately inspectable, including multiple registrations and cancellations.

Do not silently deduplicate by names or emails. Registrations without a linked user must be surfaced in readiness/reporting as unresolved identity rather than claiming they are distinct known people. Capacity/entitlement totals retain their original basis and are not recalculated from daily history.

## Wheel configuration and probability

One current published wheel configuration per event. Segment fields include stable ID, title/localized display text, optional image reference, type (prize or no_prize), enabled state and order. Prize stock is separate live data; no_prize has unlimited outcomes and no decrementing quantity. Validate titles, positive integer adjustments and supported image references. A no-prize segment can be added or removed by admin like any other segment. Do not identify segment type from its title.

Candidates = enabled prize segments with remaining > 0, plus enabled no_prize segments. First require at least ONE enabled real prize with remaining > 0; otherwise reject OUT_OF_STOCK without consuming a spin, even if unlimited no-prize candidates exist. Each candidate has probability 1/N. Disabled or sold-out segments have probability zero.

At the six-segment example's start: three prize segments and three no-prize segments each have 1/6; winning any real prize is 1/2. When one prize sells out: five candidates each have 1/5 and real-prize probability is 2/5. When all real prizes sell out, spinning stops; do not offer unlimited losing spins. These figures describe synthetic examples, not fixed production odds.

Display every segment of the CURRENT published configuration in the same position when stock changes. Sold-out segments turn gray and show หมดแล้ว / Sold out. Disabled segments, when retained in the configuration, are clearly unavailable and have zero odds. Physical wedge area is equal but probability can be zero: explicitly explain ทุกช่องที่ยังเล่นได้มีโอกาสเท่ากัน; ช่องหมดแล้วมีโอกาส 0%. Provide a readable text list of outcomes and availability. Stock changes never compress/reorder the wheel. Explicitly publishing added/removed/reordered segments creates a new configuration; historical result wheels are unaffected.

No hard-coded six-segment limit. Layout adapts to the configured count. When wedges become too narrow, show short identifiers/icons with a complete numbered list below, preserving all outcomes and full titles without illegible tiny text. Rendering must cover one prize, many prizes, duplicate no-prize names and long TH/EN labels.

## Stock, publication and stale clients

Stock is one shared pool throughout the event, no daily quotas, no automatic reset/refill. Admin uses Add stock or Reduce stock, with positive amount and required reason. Write append-only adjustment records with actor, time, before/after, delta and idempotency key. Prevent negative availability and duplicate application. Previously allocated unclaimed prizes are not available stock and cannot be reclaimed by a stock reduction.

Adding stock to an enabled sold-out prize makes it eligible on the next accepted spin. It does not modify prior outcomes or restore spent rights. Disabling/removing a segment does not erase its allocation/redemption history. A retired segment's ID and stock cannot be reused for a different item.

Admin edits form data while players continue using the published configuration. Save and publish validates and atomically installs the complete configuration. No scheduled publishing or multiple prepared drafts. Use the form's base configuration version to reject accidental overwriting of another admin's publication. Do not publish stale stock values from the form. Changing a segment from physical prize to no_prize is represented as retiring/creating a segment once history exists, not reinterpreting allocated outcomes.

Pause/resume is independent of publication; pause blocks new successful spins and leaves results/history/redemption available. Publication, spin selection, stock adjustments and pause transitions coordinate on the same per-wheel transaction lock, with a consistent lock order. No external network/image request inside that lock.

Spin input includes published configuration version. A stale version returns WHEEL_UPDATED and current state without consuming rights. Also track a candidate-pool revision that changes when eligibility changes (zero-stock transition, refill from zero, etc.), so the user does not spin against silently changed odds. Ordinary decrements above zero need not invalidate all open clients. Reject a stale pool revision without consuming rights and ask the user to review the refreshed wheel and tap again; do not auto-resubmit a new paid-in-rights attempt.

Successful spins retain the configuration/outcome presentation and eligibility snapshot used to decide them. Animation uses that snapshot even if stock reaches zero, an admin publishes or the page refreshes afterward. Snapshot includes stable segment order/IDs, chosen ID, historical name/image and probability context. Do not land the pointer by matching the name, which can be duplicated.

## Atomic spin and day boundary

Persist spins with a unique (eventId, userId, playDate) constraint for BOTH prize and no_prize outcomes. Store idempotency key and request fingerprint, attendance evidence, selected segment, published version/pool revision, outcome snapshot, acceptedAt and playDate. New timestamps use timestamptz; calendar entitlement uses a Bangkok SQL date.

Within a short PostgreSQL transaction: resolve a prior successful request first; serialize against wheel mutations; establish authoritative acceptance time and date; validate account, ownership, confirmed registration, configured entitlement, active attendance today, unused daily right, session window, pause state, configuration/pool versions and real-prize availability; use crypto.randomInt over the final equal-weight candidate set; decrement selected physical-prize availability conditionally; persist the spin and evidence; commit. Use constraints as the last line of defense, not frontend disabling. Coordinate selected attendance against undo so cancellation cannot race eligibility invisibly.

Successful request replays return the SAME persisted result even after midnight, pause, stock changes or session closure. Reusing an idempotency key with a different payload is a conflict. A different key cannot bypass the daily uniqueness rule. Failed/uncommitted requests do not consume a right. A timed-out commit is an UNKNOWN outcome to the client, requiring reconciliation/replay, never an automatic fresh spin. A new-day tap creates a new request only after today's eligibility is loaded. Do not trust yesterday's open page or the device clock.

Return 201 for a new committed spin, 200 for a successful replay, 401 for missing/invalid auth, 403 for authorization/eligibility failures where appropriate, 409 for conflicting daily use/version/state, and 429 for rate limiting. Provide stable machine-readable codes and existing error/requestId conventions. Treat pending/rejected/inactive accounts and wrong actor kinds explicitly. Rate-limit per authenticated account with a considerate IP fallback because the venue may share one IP. Private responses use no-store.

## Reward proof and redemption

Only a real-prize outcome receives an opaque cryptographically random reward token and a usable human transcription code tied to that spin. Neither is a sequential ID, regCode or PII. No-prize results are recorded in history but have no redemption token. Owner-authenticated history can retrieve the same proof across devices, refreshes and interrupted animation.

Proof displays owner name, snapshot prize name/image, time awarded, QR/code, unclaimed/claimed status, collection point and redemption deadline. Render accurate server state; the QR encodes only an opaque lookup token, never authoritative name/prize/state. Avoid tokens in logs, analytics or public URLs. Store a secure recoverable representation for the owner and a unique lookup digest; do not hash away the only copy of a token that must be redisplayed. Reuse an existing appropriate encryption facility if feasible, otherwise specify secure token storage deliberately in implementation planning.

ADMIN in phase one: scan/search code -> authenticated server lookup -> show owner/prize/current state -> inspect attendee's live logged-in PRIS proof and compare name with attendee ticket -> prepare exact item -> explicitly confirm -> hand over after server success. Scan/lookup is read-only and never auto-redeems. QR possession alone grants no redemption capability or public access to winner PII. Mismatched identity goes to the responsible admin, never screen-capture-only acceptance.

Confirmation is an atomic unclaimed-to-claimed transition with unique effective redemption per spin. Save original accepting admin, timestamp, collection point and delivered-item details where relevant. Retries/concurrent confirmations return the existing redemption without changing its actor/time. Idempotency keys bind to the confirmation payload. If a response is lost, reconcile first; if status cannot be verified, wait before handing over. No offline redemption.

Stock decreases on successful award allocation only, never again at redemption. Closing the page, delayed collection or deadline expiry never automatically returns allocated stock. A committed redemption with an interrupted physical handover continues from the same record; do not reset to issue another claim.

Admin must configure collection instructions and an absolute Bangkok-displayed deadline before activation. After deadline, reject new confirmations until an authorized, reasoned, audited deadline extension. Default policy is no silent administrator deadline bypass. Because phase one is admin-only, this rule also prevents an admin scanner unintentionally overriding the deadline.

Corrections are a separate deliberate ADMIN operation with mandatory reason, preservation of the original redemption and append-only correction history. A status correction must not implicitly replenish stock, recreate tokens, change winner/prize or restore spin rights. If a correction explicitly reopens collection, allow at most one effective current claim and preserve all prior claim/reversal actors and timestamps; it is not a retry of the original confirmation. Operational UI must distinguish correction from ordinary confirmation and explain physical-stock reconciliation.

Actual shirt quantities are not yet supplied. Default is one shared shirt stock and an optional delivered-size note; communicate that sizes depend on availability. Size-specific inventory/selection is not inferred from the example. If actual stock is size-limited, settle allocation/size choice before activating that prize rather than silently promising every size.

## API surface (proposed contract, not implemented)

Keep established REST naming and /api paths. Public here means attendee-facing, not anonymous authorization.

| Route | Use |
| --- | --- |
| GET /api/events/:eventId/lucky-wheel | Published segments, state, versions, availability, safe collection instructions |
| GET /api/events/:eventId/lucky-wheel/eligibility | Authenticated own eligibility, server day/window and existing daily result |
| POST /api/events/:eventId/lucky-wheel/spins | Idempotent atomic allocation; versions in validated body; actor from auth |
| GET /api/events/:eventId/lucky-wheel/spins/me | Paginated own history, including no-prize |
| GET /api/events/:eventId/lucky-wheel/spins/:spinId | Owner-only historical result/proof |
| GET /api/backoffice/events/:eventId/lucky-wheel | Admin configuration/live stock |
| PUT /api/backoffice/events/:eventId/lucky-wheel/configuration | Atomic save-and-publish with expected version |
| PATCH /api/backoffice/events/:eventId/lucky-wheel/status | Explicit pause/resume, audited |
| POST /api/backoffice/events/:eventId/lucky-wheel/segments/:id/stock-adjustments | Idempotent signed stock delta plus reason |
| POST /api/backoffice/events/:eventId/lucky-wheel/images | Validated prize image upload |
| GET /api/backoffice/events/:eventId/lucky-wheel/spins | Filtered, paginated admin history and claims |
| POST /api/backoffice/events/:eventId/lucky-wheel/reward-lookups | Authenticated token/code lookup; no state transition; avoid URL token leakage |
| PUT /api/backoffice/events/:eventId/lucky-wheel/spins/:spinId/redemption | Idempotent confirmation with identity-check acknowledgment |
| POST /api/backoffice/events/:eventId/lucky-wheel/spins/:spinId/redemption-corrections | Explicit reasoned audit-preserving correction |

Extend existing check-in contracts with attendance ID/date/policy and date-filtered responses without changing ordinary session semantics. Add a daily-attendance cancellation endpoint or a clearly discriminated existing undo payload; a legacy registrationSessionId-only request must not ambiguously cancel a daily record. No need for GraphQL, new global API versioning or a general-purpose CMS.

## R2: wheel images only

Keep legacy Drive and local file paths unchanged. New wheel imagery uploads through authenticated API validation to a dedicated public R2 image bucket, served via a production custom domain. Add an S3-compatible client only in conference-api, scoped server-side credentials and environment configuration. Do not place credentials in NEXT_PUBLIC variables. Initial workflow does not require direct browser uploads, presigned URLs, a Worker or migrating old assets.

Allow only verified JPEG/PNG/WebP image contents with bounded size/dimensions; reject SVG/HTML and arbitrary remote URLs as upload substitutes. Use unique keys per uploaded image, correct Content-Type/cache metadata and explicit references. Keep historical images required by prior spins; do not delete on a current segment edit. Orphan cleanup must distinguish unused uploads from historical references. Upload failure must not publish a broken replacement or silently fallback to ephemeral disk. R2 setup/account/domain readiness is a deployment prerequisite; user will configure credentials outside chat.

## Attendee design brief — approved composition B

Mode: Operate with one celebratory interaction. Audience: attendees on phones inside LINE at a busy venue, reading Thai or English, often on shared Wi-Fi. Success: know today's eligibility, deliberately spin once, and retrieve a reliable proof for collection.

Established visual evidence: current ticket source is white/#fafafa, near-black 2px frame, orange #ea580c accents, Noto Sans Thai/Outfit and the existing PRIS logo/header. Earlier navy/gold ticket documents are superseded by current code. Preserve global site chrome and current auth; use the existing header above this route unless an approved comp explicitly changes wheel-local chrome. Do not copy generated logo shapes or replace global navigation from an image concept.

Three composition probes were presented: A status sheet, B activity ticket, C wheel-first action dock. The user chose B on 2026-10-03, superseding the initial generated surface assignment. Approved reference: .impeccable/mocks/lucky-wheel-b.png, with approval recorded in its JSON sidecar. Use one white activity ticket, near-black 2px outline, rounded top/bottom corners, an orange top stripe, centered wheel and fairness text, an orange dashed seam with inward side notches, and a full-width spin action below the seam. Wheel/history navigation sits above the ticket; availability rows and rules sit below it. The B mock's synthetic logo/header, invented prize imagery, gift symbols on no-prize sectors and any inaccessible text contrast are excluded. Use real shared PRIS Header/logo, Noto Sans Thai/Outfit, server content and neutral no-prize marks. Do not import the admission ticket's fixed 9:16 ratio into this content-driven activity ticket.

Common hierarchy: PRIS identity/language -> current eligibility -> wheel -> honest odds explanation -> single spin action -> history/prize availability/rules. A no-prize outcome must use wording like พรุ่งนี้ลองใหม่ได้ หากเช็คอินและกิจกรรมยังเปิดอยู่ only when future eligibility actually exists; do not promise tomorrow after the final session day. Prefer neutral เสียใจด้วย ครั้งนี้ไม่ได้รับรางวัล for the result itself.

Required states: auth restore/login/expired; unconfirmed or unlinked ticket; no today's check-in with access to admission ticket; outside session window; paused; no physical prizes; loading; ready; stale configuration/pool (refresh without consuming); submitting/unknown/reconciling; spinning; prize awarded; no prize; already played; history; reward proof; claimed; collection deadline passed; server/network/image failure. Existing owned results remain available outside spin hours and after stock exhaustion.

Proof is a readable receipt-like page, not a transient modal only: owner, prize image/title, awarded time, clear claim status, large real QR on white with four-module quiet zone, transcription code and copy action, collection instructions/deadline and history navigation. A no-prize history entry never suggests a claim action. Images/examples in the comps are synthetic, not committed prize content. A raster comp is never the production wheel, QR, text or controls.

Layout: 320px through desktop, mobile first, at least 44px touch targets (48px primary action), visible focus, normal Thai tracking, readable text/list alternatives, safe-area padding, no fixed-height clipping and no reliance on color alone. Use semantic SVG/CSS geometry for exact sectors and pointer; prize photos are R2 images. One requested spin animation driven by committed result, no client-side random outcome. Reduced-motion users see the same result without long rotation; announce status/results to assistive technology. Never animate a redemption QR. Desktop retains a readable central wheel column, with detail list beside it only when space allows.

Backoffice design stays in the existing admin visual system: configuration form with live published-version context and Save and publish; independent Pause/resume; image/title/type/order controls; stock actions and ledger; results/history and admin redemption lookup/confirmation/correction. Date filters and the current day are explicit in scanner/report screens. No silent auto-redemption, token-bearing public leaderboard or new analytics dashboard.

## Acceptance and release gates

- Readiness audit proves actual event/Main Session selection, original entitlement coverage, timestamp interpretation, image/collection settings and real stock. Do not seed sample prizes into production.
- Daily attendance tests cover existing QR on day two, simultaneous scans, cancelled/recreated attendance, server midnight, session boundaries, mixed-policy batch scan, undo scope, migration reruns and unaffected workshops/gala/other events.
- Reporting proves one attendee/two days = one unique attendee/two attendance occurrences, and joining daily rows cannot increase capacity/entitlement counts. Include multiple registrations and unresolved user links.
- Spin tests cover all eligibility failures, latest account/registration ownership, day boundary, last physical prize with unlimited no-prize slots, equal candidate indexing, zero-stock exclusions, stock refill, publication/pause races, immutable animation snapshots, concurrent requests and attendance undo race.
- Recovery tests cover double taps/two tabs/devices, replay after commit response loss, replay across midnight, key/payload mismatch and failed transactions consuming neither stock nor right.
- Stock tests cover concurrent increments/decrements/spins, negative prevention, idempotent retries, actor/reason/before/after audit and current-vs-allocated inventory.
- Redemption tests cover owner-only proof, admin-only server endpoints, cross-event/token misuse, lookup without claiming, simultaneous confirmations, replay preserving original actor/time, deadline/extension, corrections and no second stock decrement.
- Upload tests verify content/size rejection, correct scope, failed-upload preservation, immutable historical references and no credential exposure.
- Load test uses 100 concurrent clients including the last-item case and same-user duplicates; assert allocation and daily uniqueness invariants, record latency/timeouts, then size based on measured results. Do not claim an unmeasured latency guarantee.
- TH/EN layouts with long names/titles, many/few slots, reduced motion, keyboard/screen-reader statuses, 320px and desktop. Verify actual LINE iOS/Android login/reopening and real venue scanning separately from browser fixtures.
- Use the existing test stack; add focused policy/contract tests and real PostgreSQL integration tests for concurrency/constraints. No new test framework solely for this feature.

Visual approval is complete. Next: the staged implementation plan, followed by attendance -> wheel stock/publication/spin -> redemption/admin -> attendee integration -> end-to-end verification. Actual R2 credentials, collection location/deadline and prize list are operational setup, not invented design facts. The reports page currently contains synthetic attendance data; the attendance portion must be wired to real date-filtered API results as part of this work, without claiming that unrelated revenue charts were verified or replaced.
