# PRIS 2026 Round 2 Public Content and Abstract Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the public PRIS 2026 site so abstract submission stays available continuously into Round 2, public abstract/registration content reflects the new two-round schedule and Early Bird extension rules, and obsolete Late/Approved-only/June-deadline wording is removed without duplicating checkout pricing logic.

**Architecture:** `Pris2026` remains a public information/entry site. It owns display copy and CTA availability only; actual personalized ticket pricing remains in `conference-api`/`conference-web`. Replace the current manual closed abstract flag with a date-aware public gate whose Round 2 close matches the API deadline, then update centralized abstract data and TH/EN translations so every visible statement describes the same business rule.

**Tech Stack:** Next.js 16.1, React 19.2, TypeScript 5, next-intl 4, existing Node `tsx --test` test runner, ESLint, GSAP UI already in repo.

## Global Constraints

- Current source has an existing uncommitted change in `src/lib/registrationGate.ts` setting `ABSTRACT_OPEN = false`; treat it as pre-existing work. Implementation must intentionally replace/resolve this state, not blindly discard unrelated user edits.
- Abstract Round 1 ends at `2026-09-01 00:00 Asia/Bangkok` exclusive boundary (`2026-08-31T17:00:00.000Z`).
- Abstract Round 2 starts immediately at that boundary; there is no closed gap.
- Round 2 accepts submissions through 20 September 2026 23:59 Bangkok and closes after that. Match API production close `2026-09-20T16:59:59.999Z` / next boundary Sep21 Bangkok.
- Do not add a client-side `round` field to abstract submissions. API/Backoffice derive round from `abstracts.created_at`.
- Round 1 result announcement is 10 September 2026.
- Round 2 result announcement is 30 September 2026.
- Original Early Bird registration period remains 1 July–31 August 2026.
- Special Early Bird payment extension through 15 September 2026 23:59 applies only to users whose account AND PRIS abstract existed before the Aug31 cutoff.
- A user whose account existed before cutoff but whose first PRIS abstract is Round 2 does not receive the extended Early Bird entitlement.
- Approval/rejection does not create or remove Early Bird entitlement. Public wording must not say “approved abstract only” is the pricing requirement.
- Eligible extended rate is THB 1,250; after deadline target Regular rate is THB 2,500.
- Result emails may still mention rate even if already paid; that email behavior belongs to API, not this repo.
- Postgraduate THB 1,250 and Undergraduate THB 500 remain unchanged.
- Late/On-site pricing tier is removed from PRIS 2026 public messaging. Do not delete generic translation infrastructure unnecessarily.
- Regular public rate is THB 2,500 and continues through final event registration day.
- Personalized price must not be calculated on `Pris2026`; registration CTA continues to hand off to conference registration/checkout.
- Obsolete acceptance/payment deadline “30 June 2026” must not remain visible.
- Do not invent a new withdrawal deadline. If obsolete fixed withdrawal date is removed, direct users to the secretariat without a fabricated date.
- Preserve current design/theme/layout unless copy length requires a minimal responsive adjustment.
- No new dependency.

---

## File Map

**Create:**
- `src/lib/abstractGate.test.ts` — focused tests for public abstract-open/closed date behavior if gate helper is split from existing file.

**Modify:**
- `src/lib/registrationGate.ts` — replace manual abstract close state with date-aware gate contract while preserving registration gate.
- `src/components/sections/Hero.tsx` — consume current abstract gate result if boolean becomes function/state.
- `src/app/[locale]/call-for-abstracts/page.tsx` — consume current abstract gate result.
- `src/app/[locale]/abstract-guidelines/page.tsx` — consume gate and ensure date/status copy stays correct.
- `src/app/[locale]/abstract-status/page.tsx` — consume gate if CTA is present; do not alter mock/status scope beyond gate behavior.
- `src/data/abstractData.ts` — two-round timeline, important dates, Early Bird eligibility note, obsolete June acceptance/withdrawal wording.
- `messages/en.json` — registration timeline/rate copy; remove obsolete Late semantics.
- `messages/th.json` — Thai equivalent.
- `src/components/sections/RegistrationCTASection.tsx` — minimal changes only if new translation keys/labels need rendering; pricing rows remain Early/Regular/Postgrad/Undergrad.

**Verify:**
- Current pages importing `ABSTRACT_OPEN` found by repository search. No CTA may be left on old static boolean semantics.

---

### Task 1: Replace Static Abstract Boolean with Date-Aware Public Gate

**Files:**
- Modify: `src/lib/registrationGate.ts`
- Create: `src/lib/abstractGate.test.ts`

**Interfaces:**
- Preserve `REGISTRATION_OPEN` behavior.
- Replace static abstract boolean dependency with pure evaluator:

```ts
export const ABSTRACT_SUBMISSION_CLOSE_AT = new Date("2026-09-20T17:00:00.000Z");

export interface AbstractGateState {
  open: boolean;
  phase: "round1" | "round2" | "closed";
}

export function getAbstractGateState(now: Date = new Date()): AbstractGateState;
```

Use exclusive Round1/2 split and overall close:

```ts
const ROUND_2_START = new Date("2026-08-31T17:00:00.000Z");
const CLOSE = new Date("2026-09-20T17:00:00.000Z");

export function getAbstractGateState(now = new Date()): AbstractGateState {
  if (now < ROUND_2_START) return { open: true, phase: "round1" };
  if (now < CLOSE) return { open: true, phase: "round2" };
  return { open: false, phase: "closed" };
}
```

- [ ] **Step 1: Write failing boundary tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { getAbstractGateState } from "./registrationGate.js";

test("keeps abstract submission open through final Round 1 instant", () => {
  assert.deepEqual(
    getAbstractGateState(new Date("2026-08-31T16:59:59.999Z")),
    { open: true, phase: "round1" },
  );
});

test("switches directly to Round 2 at Sep 1 Bangkok with no closed gap", () => {
  assert.deepEqual(
    getAbstractGateState(new Date("2026-08-31T17:00:00.000Z")),
    { open: true, phase: "round2" },
  );
});

test("closes at Sep 21 Bangkok exclusive boundary", () => {
  assert.deepEqual(
    getAbstractGateState(new Date("2026-09-20T16:59:59.999Z")),
    { open: true, phase: "round2" },
  );
  assert.deepEqual(
    getAbstractGateState(new Date("2026-09-20T17:00:00.000Z")),
    { open: false, phase: "closed" },
  );
});
```

- [ ] **Step 2: Run focused test and verify current code fails**

```bash
npx tsx --test src/lib/abstractGate.test.ts
```

Expected: FAIL because date-aware helper does not exist.

- [ ] **Step 3: Implement pure helper**

Keep `ABSTRACT_NOTICE = "ปิดรับบทคัดย่อแล้ว"` only as deprecated/fallback copy if pages still use translated key. Do not keep `ABSTRACT_OPEN=false` as source of truth.

If backwards compatibility during incremental edits is useful, export:

```ts
export const ABSTRACT_OPEN = true;
```

only temporarily within same task; final page consumers in Task 2 must use `getAbstractGateState` so site closes automatically after Round2. Final plan acceptance rejects permanent static boolean as authoritative.

- [ ] **Step 4: Run focused/full test**

```bash
npx tsx --test src/lib/abstractGate.test.ts
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/registrationGate.ts src/lib/abstractGate.test.ts
git commit -m "fix: keep PRIS abstract submission open for round 2"
```

---

### Task 2: Update Every Abstract CTA Consumer to Date-Aware Gate

**Files:**
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/app/[locale]/call-for-abstracts/page.tsx`
- Modify: `src/app/[locale]/abstract-guidelines/page.tsx`
- Modify: `src/app/[locale]/abstract-status/page.tsx`

**Interfaces:**
- Consumes `getAbstractGateState()`.
- Produces no stale static `ABSTRACT_OPEN` condition.

- [ ] **Step 1: Replace imports**

From:

```ts
import { ABSTRACT_OPEN } from "@/lib/registrationGate";
```

To:

```ts
import { getAbstractGateState } from "@/lib/registrationGate";
```

For Hero retain `REGISTRATION_OPEN` import if still needed.

- [ ] **Step 2: Handle client hydration safely**

Because these are client components, avoid server/client time disagreement by deriving after mount where necessary:

```ts
const [abstractOpen, setAbstractOpen] = useState(true);

useEffect(() => {
  setAbstractOpen(getAbstractGateState().open);
}, []);
```

If a page already tracks `currentDate`, derive from that state instead of adding duplicate timer/state.

Do not introduce a live per-second timer; close accuracy to page load/navigation is sufficient because API is authoritative on submit.

- [ ] **Step 3: Replace all JSX conditions**

Every `{ABSTRACT_OPEN ? (...) : (...)}` becomes `{abstractOpen ? (...) : (...)}` or equivalent derived state.

- [ ] **Step 4: Preserve route/link targets**

When open, existing abstract submission links/SSO behavior must remain unchanged.

- [ ] **Step 5: Closed copy remains translated**

After Sep20, CTA shows existing `registrationGate.abstractNotice`/equivalent translated “Abstract submission is closed” instead of a hard-coded Round1 closure message.

- [ ] **Step 6: Search for stale imports**

```bash
rg "ABSTRACT_OPEN" src
```

Expected: zero application consumers; only compatibility export/comment if intentionally retained. Prefer zero final references.

- [ ] **Step 7: Run tests/lint/build**

```bash
npm test
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/sections/Hero.tsx src/app/[locale]/call-for-abstracts/page.tsx src/app/[locale]/abstract-guidelines/page.tsx src/app/[locale]/abstract-status/page.tsx src/lib/registrationGate.ts
git commit -m "refactor: use date-aware abstract submission gate"
```

---

### Task 3: Rewrite Abstract Timeline for Round 1 and Round 2

**Files:**
- Modify: `src/data/abstractData.ts:1-50`

**Interfaces:**
- Produces timeline/important dates used by public abstract sections.

- [ ] **Step 1: Replace timeline entries**

Use exactly:

```ts
export const abstractTimeline = [
  {
    label: "Abstract Submission — Round 1",
    labelTh: "การส่งบทคัดย่อ — รอบที่ 1",
    date: "1 July - 31 August 2026",
    dateTh: "1 กรกฎาคม 2569 - 31 สิงหาคม 2569",
    status: "upcoming",
    color: "blue",
  },
  {
    label: "Round 1 Result Announcement",
    labelTh: "ประกาศผลบทคัดย่อรอบที่ 1",
    date: "10 September 2026",
    dateTh: "10 กันยายน 2569",
    status: "upcoming",
    color: "blue",
  },
  {
    label: "Abstract Submission — Round 2",
    labelTh: "การส่งบทคัดย่อ — รอบที่ 2",
    date: "1 - 20 September 2026",
    dateTh: "1 - 20 กันยายน 2569",
    status: "upcoming",
    color: "blue",
  },
];
```

Add the official Round 2 result entry:
- `Round 2 Result Announcement`
- `30 September 2026`
- `ประกาศผลบทคัดย่อรอบที่ 2`
- `30 กันยายน 2569`

- [ ] **Step 2: Mirror same dates in `submissionGuidelines.importantDates`**

Order should communicate continuous submission clearly:
1. Round1 submission;
2. Round2 submission;
3. Round1 result Sep10;
4. Round2 result Sep30.

Labels must explicitly distinguish Round1 and Round2 submission/result dates.

- [ ] **Step 3: Remove generic “Abstract Submission” wording that implies Aug31 final close**

Search:

```bash
rg "Abstract Submission|31 August|31 สิงหาคม" src/data src/components src/app
```

Review each hit. Cancellation-policy dates elsewhere are unrelated; do not change unrelated refund policy just because date matches.

- [ ] **Step 4: Run tests/lint/build**

```bash
npm test
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/abstractData.ts
git commit -m "content: add PRIS abstract round 2 timeline"
```

---

### Task 4: Replace Approved-Only Early Bird Copy with Account + Abstract Cutoff Rule

**Files:**
- Modify: `src/data/abstractData.ts:35-70`

**Interfaces:**
- Produces public explanatory text only. Does not determine actual price.

- [ ] **Step 1: Replace reservation note**

English meaning:

```text
The special Early Bird payment extension is reserved for participants who created their PRIS 2026 account and submitted at least one PRIS 2026 abstract by 31 August 2026, 23:59 (Bangkok time).
```

Thai meaning:

```text
สิทธิ์ขยายเวลาชำระในราคา Early Bird สงวนสำหรับผู้ที่สร้างบัญชี PRIS 2026 และส่งบทคัดย่อ PRIS 2026 อย่างน้อย 1 เรื่อง ภายในวันที่ 31 สิงหาคม 2569 เวลา 23:59 น.
```

Remove any statement requiring Approved status to qualify.

- [ ] **Step 2: Replace presenter registration note**

English:

```text
Eligible participants may complete registration at the Early Bird rate of THB 1,250 until 15 September 2026, 23:59 (Bangkok time). After that deadline, the Regular rate is THB 2,500.
```

Thai equivalent with exact amounts/deadline.

- [ ] **Step 3: Rewrite segmented emphasized copy**

Highlight the two required facts separately:
- account created by Aug31 23:59;
- at least one PRIS abstract submitted by Aug31 23:59;
- payment privilege ends Sep15 23:59;
- after deadline Regular 2,500.

Do not say Round2 submission grants entitlement.

- [ ] **Step 4: Add explicit Round2-only clarification**

Copy should state:

```text
Creating an account before the cutoff alone is not sufficient. If the first PRIS 2026 abstract is submitted on or after 1 September 2026, the Regular rate applies.
```

Thai equivalent. Keep tone informational, not punitive.

- [ ] **Step 5: Search for stale Approved-only phrasing**

```bash
rg -i "approved|อนุมัติ|receive the Early Bird|สิทธิ์.*Early Bird" src/data/abstractData.ts
```

Expected: approval may remain in abstract review-policy context, but no pricing sentence says approval creates Early Bird entitlement.

- [ ] **Step 6: Run lint/build**

```bash
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/abstractData.ts
git commit -m "content: clarify PRIS Early Bird eligibility"
```

---

### Task 5: Remove Obsolete June Acceptance and Withdrawal Deadlines

**Files:**
- Modify: `src/data/abstractData.ts:160-180`

**Interfaces:**
- Produces non-contradictory acceptance/withdrawal policies.

- [ ] **Step 1: Keep first acceptance sentence**

```text
Acceptance notification will be sent to the abstract submitter only.
```

Thai existing equivalent may remain.

- [ ] **Step 2: Replace obsolete June registration/payment instruction**

English meaning:

```text
After receiving the result notification, the presenting author must complete the required participation confirmation. Registration fees and payment deadlines follow the current PRIS 2026 registration policy displayed on this website and in the result email.
```

Thai equivalent.

Do not recreate old automatic withdrawal statement tied to June30. If presentation confirmation has a separate API-issued deadline, do not hard-code it in static public data unless current official requirement supplies exact value.

- [ ] **Step 3: Replace withdrawal fixed date with contact instruction**

English:

```text
Authors who wish to withdraw an abstract should send a written request to the secretariat at pr@pharmacycouncil.org.
```

Thai equivalent. No invented deadline.

- [ ] **Step 4: Verify obsolete date removed from abstract policy**

```bash
rg "30th June|30 June|30 มิถุนายน" src/data/abstractData.ts
```

Expected: zero results.

- [ ] **Step 5: Run lint/build**

```bash
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/abstractData.ts
git commit -m "content: remove obsolete PRIS abstract deadlines"
```

---

### Task 6: Update Registration Timeline Copy in Thai and English

**Files:**
- Modify: `messages/en.json:158-190`
- Modify: `messages/th.json:158-190`
- Verify: `src/components/sections/RegistrationCTASection.tsx:185-250`

**Interfaces:**
- Produces public registration timeline explaining original Early Bird and Regular windows plus special extension qualification.

- [ ] **Step 1: Keep Early Bird original period**

English:

```json
"periodEarly": "Jul 1 – Aug 31, 2026",
"titleEarly": "Early Bird Registration",
"descEarly": "Early Bird rate THB 1,250 during the original registration period. Participants who created an account and submitted a PRIS 2026 abstract by Aug 31, 23:59 may keep this rate through Sep 15, 23:59 (Bangkok time)."
```

Thai equivalent:

```json
"periodEarly": "1 ก.ค. – 31 ส.ค. 2569",
"titleEarly": "ลงทะเบียน Early Bird",
"descEarly": "อัตรา Early Bird 1,250 บาทในช่วงลงทะเบียนปกติ และสำหรับผู้ที่สร้างบัญชีพร้อมส่งบทคัดย่อ PRIS 2026 ภายในวันที่ 31 ส.ค. 2569 เวลา 23:59 น. สามารถใช้สิทธิ์ราคานี้ได้ถึงวันที่ 15 ก.ย. 2569 เวลา 23:59 น."
```

- [ ] **Step 2: Change Regular period to actual final event day wording**

Use:

```json
"periodRegular": "Sep 1 – Event Closing Day, 2026",
"titleRegular": "Regular Registration",
"descRegular": "Regular rate THB 2,500 applies from Sep 1 for participants who do not qualify for the Early Bird extension, and to all targeted participants after Sep 15, 23:59 (Bangkok time)."
```

Thai equivalent can say `1 ก.ย. 2569 – วันสุดท้ายของงาน` rather than invent Oct31 if event DB/current official schedule ends earlier.

If official content convention requires concrete event date, use known event dates already displayed by site (`29–30 October 2026`) and set Regular through `30 October 2026`; do not retain Oct31 when event is 29–30 Oct.

- [ ] **Step 3: Remove Late/On-site meaning**

Keys may be deleted if no code consumes them. Before deletion run:

```bash
rg "periodClosed|titleClosed|descClosed|tierLate|tierLateLabel" src messages
```

If only translation files contain them, remove keys from both languages. If any component consumes them, change component first so no Late tier is rendered.

- [ ] **Step 4: Update tier labels**

`tierEarlyLabel` must not imply every Sep1–15 user gets 1,250. Keep original Jul1-Aug31 label and use description for extension qualification.

`tierRegLabel` should describe Regular from Sep1 through event closing day.

- [ ] **Step 5: Preserve student labels/rates**

Do not modify Postgraduate 1,250 or Undergraduate 500 display.

- [ ] **Step 6: Validate both JSON files parse**

```bash
node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); JSON.parse(require('fs').readFileSync('messages/th.json','utf8')); console.log('ok')"
```

Expected: `ok`.

- [ ] **Step 7: Run lint/build**

```bash
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add messages/en.json messages/th.json src/components/sections/RegistrationCTASection.tsx
git commit -m "content: update PRIS registration pricing periods"
```

---

### Task 7: Verify Pricing Rows and Remove Any Remaining Late Public Surface

**Files:**
- Verify/Modify: `src/components/sections/RegistrationCTASection.tsx:280-365`
- Modify only if necessary: `messages/en.json`, `messages/th.json`

**Interfaces:**
- Produces four visible pricing rows only: Early Bird, Regular, Postgraduate, Undergraduate.

- [ ] **Step 1: Verify current four-row structure**

Expected visible prices:

```text
Early Bird       ฿1,250
Regular          ฿2,500
Post Graduate    ฿1,250
Under Graduate   ฿500
```

Do not add Late row.

- [ ] **Step 2: Verify Regular public price already 2,500**

Keep existing `฿2,500`. Do not change to DB’s old 2,000.

- [ ] **Step 3: Search entire public repo for Late/On-site price language**

```bash
rg -i "late registration|late / on-site|on-site registration|ลงทะเบียนล่าช้า|หน้างาน" src messages
```

Classify each hit. Remove PRIS pricing-tier references. Do not remove unrelated generic words from content where “late” has non-pricing meaning.

- [ ] **Step 4: Search for wrong Regular 2,000**

```bash
rg "2,000|2000" src messages
```

Any PRIS general Regular rate hit must become 2,500; unrelated amounts must be reviewed rather than blanket-replaced.

- [ ] **Step 5: Run lint/build**

```bash
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit if changes were required**

```bash
git add src/components/sections/RegistrationCTASection.tsx messages/en.json messages/th.json
git commit -m "fix: remove PRIS late registration messaging"
```

If verification finds no source change after Task 6, do not create empty commit.

---

### Task 8: Add Public Copy Regression Checks

**Files:**
- Create or Modify: `src/lib/abstractGate.test.ts`
- Optional Create: `src/data/abstractData.test.ts` using existing `tsx --test` runner.

**Interfaces:**
- Produces cheap protection against accidentally restoring old dates/rules.

- [ ] **Step 1: Add data assertions**

Create `src/data/abstractData.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { abstractTimeline, submissionGuidelines } from "./abstractData.js";

test("publishes Round 1, Round 1 result, and Round 2 dates", () => {
  assert.ok(abstractTimeline.some((item) => item.label.includes("Round 1")));
  assert.ok(abstractTimeline.some((item) => item.label.includes("Round 2")));
  assert.ok(abstractTimeline.some((item) => item.date.includes("10 September 2026")));
  assert.ok(abstractTimeline.some((item) => item.date.includes("20 September 2026")));
});

test("Early Bird copy no longer requires abstract approval", () => {
  assert.doesNotMatch(submissionGuidelines.presenterRegistrationNote, /approved/i);
  assert.match(submissionGuidelines.presenterRegistrationNote, /1,250/);
  assert.match(submissionGuidelines.presenterRegistrationNote, /15 September 2026/);
});
```

Also assert obsolete `30th June` does not occur in acceptance/withdrawal JSON-stringified policy data.

- [ ] **Step 2: Run focused tests**

```bash
npx tsx --test src/lib/abstractGate.test.ts src/data/abstractData.test.ts
```

Expected: PASS after prior content tasks.

- [ ] **Step 3: Run full suite**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/abstractGate.test.ts src/data/abstractData.test.ts
git commit -m "test: lock PRIS round 2 public rules"
```

---

### Task 9: Public Site Manual QA Across Boundary Content

**Files:**
- No expected source change. Reopen specific task if defect appears.

**Interfaces:**
- Consumes built site with current copy/gates.
- Produces visual/content verification.

- [ ] **Step 1: Run local app**

```bash
npm run dev
```

Use configured port 3001. Test both Thai and English locales.

- [ ] **Step 2: Verify Hero CTA**

During Round2 date, abstract CTA remains active and reaches current abstract submission flow.

- [ ] **Step 3: Verify Call for Abstracts**

Must show:
- Round1 submission Jul1–Aug31;
- Round2 submission Sep1–20;
- Round1 result Sep10;
- Round2 result Sep30;
- active Submit CTA during Round2.

- [ ] **Step 4: Verify Abstract Guidelines**

Must state account + abstract cutoff requirement for extension. Must not say approved-only grants 1,250. Must not show June30 registration/payment deadline.

- [ ] **Step 5: Verify Registration section**

Must show:
- Early Bird 1,250;
- Regular 2,500;
- Postgraduate 1,250;
- Undergraduate 500;
- no Late/On-site tier;
- extension deadline Sep15 23:59 only for cutoff-qualified participants;
- Regular from Sep1 for nonqualified users.

- [ ] **Step 6: Verify responsive copy**

Check desktop and mobile widths. Longer bilingual Early Bird descriptions must not overflow pricing/timeline containers. If wrapping is poor, make only minimal Tailwind spacing/width adjustment in `RegistrationCTASection.tsx`; do not redesign section.

- [ ] **Step 7: Verify checkout handoff**

Click registration CTA. `Pris2026` must not choose or encode Early Bird/Regular based on local logic. Personalized price is chosen downstream by API/conference-web.

- [ ] **Step 8: Final repository gates**

```bash
npm test
npm run lint
npm run build
git status --short
```

Expected: PASS; only intended files before commits, clean after commits.

---

### Task 10: Deployment Ordering and Production Content Verification

**Files:**
- No source mutation expected.

**Interfaces:**
- Consumes API/Web deployment readiness.
- Produces safe public cutover.

- [ ] **Step 1: Do not publish misleading Early Bird extension before API enforcement exists**

Deploy `conference-api` personalized pricing enforcement and DB update before or together with public copy announcing extension. Public copy must never advertise 1,250 while backend still only knows generic ticket windows.

- [ ] **Step 2: Deploy conference-web personalized checkout before public traffic is intentionally directed to extension offer**

API remains final protection, but checkout should display correct effective ticket.

- [ ] **Step 3: Deploy Pris2026 Round2 gate/content**

Ensure source no longer uses static `ABSTRACT_OPEN=false` and Round2 CTA is reachable.

- [ ] **Step 4: Production smoke Thai + English**

Verify pages after CDN/build deployment, not only local build.

- [ ] **Step 5: API submission smoke**

Submit controlled Round2 abstract from public flow. API must accept and `abstracts.created_at` determines Round2 downstream; frontend sends no round field.

- [ ] **Step 6: Pricing smoke from registration CTA**

Use one eligible and one noneligible account. Eligible extension reaches checkout showing 1,250; noneligible reaches 2,500. This repo itself must produce same registration handoff for both accounts.

---

## Final Acceptance Checklist

- [ ] Static `ABSTRACT_OPEN=false` no longer closes Round2.
- [ ] Public gate changes Round1 -> Round2 with no closed gap.
- [ ] Public gate closes after Sep20 23:59 Bangkok; API remains authoritative.
- [ ] All known CTA consumers use date-aware gate.
- [ ] Timeline shows Round1, Round1 result Sep10, Round2 Sep1–20, and Round2 result Sep30.
- [ ] Round2 result date is 30 September 2026 / 30 กันยายน 2569.
- [ ] Public Early Bird extension requires both account and PRIS abstract before Aug31 cutoff.
- [ ] Copy explicitly avoids saying approval/rejection determines entitlement.
- [ ] Round2-only first submitter is described as Regular 2,500, even with old account.
- [ ] Extended Early Bird rate is 1,250 through Sep15 23:59 Bangkok.
- [ ] Regular target rate is 2,500 afterward and for nonqualified Sep1 users.
- [ ] Late/On-site PRIS pricing messaging removed.
- [ ] Postgraduate 1,250 and Undergraduate 500 unchanged.
- [ ] Obsolete June30 registration/payment acceptance text removed.
- [ ] Withdrawal copy has no invented replacement deadline.
- [ ] Pris2026 does not calculate personalized checkout rate.
- [ ] TH/EN JSON valid and semantically aligned.
- [ ] `npm test`, `npm run lint`, and `npm run build` pass.
