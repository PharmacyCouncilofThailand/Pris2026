# Approved Abstracts Round 1 Static Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปิดหน้า Approved Abstracts และแสดงรายการ Round 1 จาก PDF ทั้ง 119 รายการด้วยข้อมูลที่ตรงต้นฉบับ 100% โดยไม่เรียก API รายชื่อบทคัดย่อ

**Architecture:** แยกข้อมูลที่ถอดจาก PDF ไว้ใน `src/data/approvedRound1Abstracts.ts` โดยใช้ shape เดียวกับ accepted-abstract filter helper หน้า client import dataset นี้โดยตรงและคง Search/ตัวกรองแบบ local ส่วน Header ใช้ `navigationData` ที่เปิดเมนู Accepted Abstracts กลับมาโดยไม่เพิ่ม data fetching ใหม่

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `next-intl`, Tailwind CSS, `tsx --test`, ESLint

## Global Constraints

- Source of truth คือ `C:/Users/JaoNo/Downloads/1.ประกาศผลการคัดเลือกบทความวิชาการ รอบที่ 1.pdf`
- Dataset ต้องมี 119 แถว: Oral 31, Highlighted Poster 39, Poster 49
- ต้องเก็บ 2 แถวที่ระบุ `รอผลประกาศ` และไม่มี Tracking ID
- ต้องไม่แปลหรือแต่งค่าเลขลำดับ, Tracking ID, ชื่อผลงาน, ผู้วิจัย, หมวดหมู่ หรือประเภทการนำเสนอจาก PDF
- ข้อมูลที่ไม่มีใน PDF เช่น affiliation ต้องเป็น `null` และห้ามสร้างขึ้นเอง
- หน้า Approved Abstracts ต้องไม่เรียก `/api/abstracts/accepted`, `NEXT_PUBLIC_API_URL` หรือ `fetch`
- Round 1 เป็นค่าเริ่มต้น; Round 2 แสดงสถานะไม่มีข้อมูลเพราะ PDF นี้มีเฉพาะ Round 1
- คง Search และตัวกรองประเภท, หมวดหมู่ และรอบ โดยทำงานกับข้อมูล local
- ไม่เปลี่ยน behavior อื่นของ Header นอกการเปิดเมนู Accepted Abstracts และลบ temporary comments ที่เกี่ยวข้อง

## File Map

- Create: `src/data/approvedRound1Abstracts.ts` — dataset Round 1 ที่ถอดจาก PDF ครบทั้ง 119 แถว
- Create: `src/data/approvedRound1Abstracts.test.ts` — integrity tests ของจำนวน, ประเภท, รอบ, Tracking ID และ sentinel rows
- Modify: `src/lib/acceptedAbstractsFilter.ts` — เพิ่มชนิด `highlighted-poster` ใน filter contract
- Modify: `src/lib/acceptedAbstractsFilter.test.ts` — regression tests สำหรับ Highlighted Poster และ local filtering
- Modify: `src/app/[locale]/approved-abstracts/page.tsx` — เปิดหน้า live และเปลี่ยนจาก API state เป็น static dataset
- Modify: `src/data/navigation.ts` — เปิด submenu Accepted Abstracts โดยลบ commented temporary block
- Modify: `src/components/layout/Header.tsx` — ลบ comments ที่เป็น section/temporary annotations เท่านั้น; ให้ rendering เดิมรับ navigation data ใหม่
- Modify: `messages/th.json` — เพิ่มข้อความ Highlighted Poster และปรับ copy ที่หน้าใช้
- Modify: `messages/en.json` — เพิ่มข้อความ Highlighted Poster และปรับ copy ที่หน้าใช้

---

### Task 1: Lock the PDF dataset and integrity contract

**Files:**
- Create: `src/data/approvedRound1Abstracts.ts`
- Create: `src/data/approvedRound1Abstracts.test.ts`

**Interfaces:**
- Produces `approvedRound1Abstracts: AcceptedAbstract[]`
- Each item has `id: number`, `sequence: number`, `trackingId: string | null`, `title: string`, `presentationType: "oral" | "highlighted-poster" | "poster"`, `categoryId: number`, `categoryName: string`, `submitterName: string | null`, `affiliation: string | null`, and `round: 1`
- Uses numeric IDs that remain unique even though the PDF numbering restarts per presentation section: Oral IDs `1–31`, Highlighted Poster IDs `101–139`, Poster IDs `201–249`

- [ ] **Step 1: Write the failing dataset integrity test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { approvedRound1Abstracts } from "./approvedRound1Abstracts";

test("contains every Round 1 row from the PDF", () => {
  assert.equal(approvedRound1Abstracts.length, 119);
  assert.deepEqual(
    approvedRound1Abstracts.reduce<Record<string, number>>((counts, item) => {
      counts[item.presentationType] = (counts[item.presentationType] ?? 0) + 1;
      return counts;
    }, {}),
    { oral: 31, "highlighted-poster": 39, poster: 49 },
  );
});

test("preserves Round 1 and the two rows without Tracking ID", () => {
  assert.ok(approvedRound1Abstracts.every((item) => item.round === 1));
  assert.equal(
    approvedRound1Abstracts.filter((item) => item.trackingId === null).length,
    2,
  );
  assert.equal(
    new Set(
      approvedRound1Abstracts
        .map((item) => item.trackingId)
        .filter((trackingId): trackingId is string => trackingId !== null),
    ).size,
    117,
  );
});

test("uses stable unique IDs and exact section ranges", () => {
  assert.equal(
    new Set(approvedRound1Abstracts.map((item) => item.id)).size,
    119,
  );
  assert.deepEqual(
    approvedRound1Abstracts
      .filter((item) => item.presentationType === "oral")
      .map((item) => item.sequence),
    Array.from({ length: 31 }, (_, index) => index + 1),
  );
  assert.deepEqual(
    approvedRound1Abstracts
      .filter((item) => item.presentationType === "highlighted-poster")
      .map((item) => item.sequence),
    Array.from({ length: 39 }, (_, index) => index + 101),
  );
  assert.deepEqual(
    approvedRound1Abstracts
      .filter((item) => item.presentationType === "poster")
      .map((item) => item.sequence),
    Array.from({ length: 49 }, (_, index) => index + 201),
  );
});

test("keeps the PDF's two pending announcement rows", () => {
  const pendingRows = approvedRound1Abstracts.filter(
    (item) => item.trackingId === null,
  );
  assert.equal(pendingRows.length, 2);
  assert.ok(pendingRows.every((item) => item.title === "รอผลประกาศ"));
  assert.ok(pendingRows.every((item) => item.submitterName === null));
});
```

- [ ] **Step 2: Run the focused test and verify it fails for the missing module**

Run: `npx tsx --test src/data/approvedRound1Abstracts.test.ts`

Expected: FAIL because `src/data/approvedRound1Abstracts.ts` does not exist yet.

- [ ] **Step 3: Transcribe the PDF into the static data module**

Create the module with the existing type and a stable category map. Enter all 119 objects as literal values in PDF order; the exported value has this exact contract:

```ts
import type { AcceptedAbstract } from "@/lib/acceptedAbstractsFilter";

export const approvedRound1Abstracts: AcceptedAbstract[] = [
  {
    id: 1,
    sequence: 1,
    trackingId: null,
    title: "รอผลประกาศ",
    presentationType: "oral",
    categoryId: 1,
    categoryName: "เภสัชกรรมคลินิกและการบริบาลทางเภสัชกรรม",
    submitterName: null,
    affiliation: null,
    round: 1,
  },
];
```

The finished array must contain this row plus the other 118 concrete rows from the PDF: Oral rows 2–31, Highlighted Poster rows 1–39, and Poster rows 1–49. Use the corresponding stable IDs from the Interfaces block, copy every source string verbatim, use `null` for the second pending row's Tracking ID and researcher, and use `null` for every affiliation because the PDF has no affiliation field. Do not use generated sample content, placeholder rows, or an API response.

- [ ] **Step 4: Run the dataset tests and verify the PDF counts**

Run: `npx tsx --test src/data/approvedRound1Abstracts.test.ts`

Expected: PASS for 4 tests; counts are 119 total, 31 oral, 39 highlighted poster, 49 poster, 117 unique non-null Tracking IDs, and 2 pending rows.

- [ ] **Step 5: Commit the independently reviewable data unit**

```bash
git add src/data/approvedRound1Abstracts.ts src/data/approvedRound1Abstracts.test.ts
git commit -m "feat(approved-abstracts): add round 1 PDF dataset"
```

---

### Task 2: Extend local filtering for all PDF presentation types

**Files:**
- Modify: `src/lib/acceptedAbstractsFilter.ts`
- Modify: `src/lib/acceptedAbstractsFilter.test.ts`

**Interfaces:**
- `AcceptedAbstract.presentationType` accepts `"oral" | "highlighted-poster" | "poster"`
- `AcceptedAbstractFilterOptions.presentationType` accepts `"all" | "oral" | "highlighted-poster" | "poster"`
- `filterAcceptedAbstracts` continues to combine type, category, round, and text search with AND logic

- [ ] **Step 1: Add the failing Highlighted Poster filter case**

Add a fixture with `presentationType: "highlighted-poster"` and assert that only it is returned:

```ts
test("filters Highlighted Poster independently from standard Poster", () => {
  const result = filterAcceptedAbstracts(
    [
      { ...baseAbstract, id: 1, presentationType: "oral" },
      { ...baseAbstract, id: 2, presentationType: "highlighted-poster" },
      { ...baseAbstract, id: 3, presentationType: "poster" },
    ],
    { presentationType: "highlighted-poster", round: 1 },
  );

  assert.deepEqual(result.map((item) => item.id), [2]);
});
```

- [ ] **Step 2: Run the focused filter tests and verify the new case fails**

Run: `npx tsx --test src/lib/acceptedAbstractsFilter.test.ts`

Expected: FAIL at the new case because the current presentation type union does not include `highlighted-poster`.

- [ ] **Step 3: Update the filter type contract without changing matching semantics**

Change only the presentation type unions and keep the existing normalized comparison:

```ts
export type AcceptedPresentationType =
  | "oral"
  | "highlighted-poster"
  | "poster";

export interface AcceptedAbstract {
  id: number;
  trackingId: string | null;
  title: string;
  presentationType: AcceptedPresentationType;
  categoryId: number;
  categoryName: string;
  submitterName: string | null;
  affiliation: string | null;
  round?: number;
}

export interface AcceptedAbstractFilterOptions {
  search?: string;
  presentationType?: "all" | AcceptedPresentationType;
  categoryId?: number | "all" | string;
  round?: "all" | 1 | 2 | string | number;
}
```

- [ ] **Step 4: Run all filter tests and verify no regression**

Run: `npx tsx --test src/lib/acceptedAbstractsFilter.test.ts`

Expected: PASS for the existing cases plus the new Highlighted Poster case.

- [ ] **Step 5: Commit the filter contract**

```bash
git add src/lib/acceptedAbstractsFilter.ts src/lib/acceptedAbstractsFilter.test.ts
git commit -m "feat(approved-abstracts): support highlighted poster filtering"
```

---

### Task 3: Restore the page with static Round 1 data

**Files:**
- Modify: `src/app/[locale]/approved-abstracts/page.tsx`

**Interfaces:**
- Consumes `approvedRound1Abstracts` and `filterAcceptedAbstracts`
- Produces the existing localized page with local Search, type, category, and round filtering

- [ ] **Step 1: Replace the commented/API page with a client component**

Use the existing visual structure and these state/data boundaries:

```tsx
"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { approvedRound1Abstracts } from "@/data/approvedRound1Abstracts";
import {
  extractDistinctCategories,
  filterAcceptedAbstracts,
} from "@/lib/acceptedAbstractsFilter";

const abstracts = approvedRound1Abstracts;

export default function ApprovedAbstractsPage() {
  const t = useTranslations("approvedAbstracts");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedType, setSelectedType] = useState<
    "all" | "oral" | "highlighted-poster" | "poster"
  >("all");
  const [selectedRound, setSelectedRound] = useState<"1" | "2">("1");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  const categories = useMemo(
    () => extractDistinctCategories(abstracts),
    [],
  );

  const filteredAbstracts = useMemo(
    () =>
      filterAcceptedAbstracts(abstracts, {
        search: deferredSearchQuery,
        presentationType: selectedType,
        round: selectedRound,
        categoryId: selectedCategory,
      }),
    [deferredSearchQuery, selectedType, selectedRound, selectedCategory],
  );

}
```

Return the existing hero, filter controls, local result count, empty states, and rows as live JSX after the state declarations. The final file must contain live JSX rather than a `notFound()` fallback or commented-out implementation. Remove the API URL, all `fetch` calls, AbortController, event categories state, loading/error/retry branches, and every comment in the page. Keep the existing search reset behavior and Round 2 empty state, but do not invent Round 2 rows.

- [ ] **Step 2: Add exact presentation labels and styles**

Use a local rendering mapping so the three PDF labels remain distinct:

```tsx
const presentationLabel = {
  oral: t("oralPresentation"),
  "highlighted-poster": t("highlightedPosterPresentation"),
  poster: t("posterPresentation"),
}[item.presentationType];
```

Use `item.presentationType === "oral"` for the oral color, a separate green style for Highlighted Poster, and the existing blue style for standard Poster. Never collapse Highlighted Poster into standard Poster in the displayed row or filter.

- [ ] **Step 3: Run TypeScript-oriented tests and inspect the page source for removed API code**

Run: `npx tsc --noEmit`

Expected: PASS, and `rg -n "NEXT_PUBLIC_API_URL|api/abstracts/accepted|fetch\(" src/app/[locale]/approved-abstracts/page.tsx` returns no matches.

- [ ] **Step 4: Commit the restored page**

```bash
git add src/app/[locale]/approved-abstracts/page.tsx
git commit -m "feat(approved-abstracts): publish round 1 results"
```

---

### Task 4: Restore the Header menu and localized copy

**Files:**
- Modify: `src/data/navigation.ts`
- Modify: `src/components/layout/Header.tsx`
- Modify: `messages/th.json`
- Modify: `messages/en.json`

**Interfaces:**
- `navigationData` exposes an `abstracts` item with `callForAbstracts` and `acceptedAbstractsAnnouncement` children
- Header continues to consume `navigationData` through `visibleNav`; no API or new state is added
- Both locales expose the same `approvedAbstracts` keys

- [ ] **Step 1: Add matching Thai and English labels**

Add the following two keys under `approvedAbstracts` in both locale files before the page imports them:

```json
"filterHighlightedPoster": "Highlighted Poster",
"highlightedPosterPresentation": "Highlighted Poster"
```

Use `โปสเตอร์โดดเด่น` for both values in `messages/th.json`. Update the approved abstracts description to name Oral, Highlighted Poster, and Poster while leaving the 119 data values in their PDF source language.

- [ ] **Step 2: Restore the Accepted Abstracts submenu**

Replace the current temporary single item in `src/data/navigation.ts` with:

```ts
{
  labelKey: "abstracts",
  children: [
    { labelKey: "callForAbstracts", href: "/call-for-abstracts" },
    {
      labelKey: "acceptedAbstractsAnnouncement",
      href: "/approved-abstracts",
    },
  ],
},
```

Delete the temporary commented `children` block. Remove only section comments from `Header.tsx`; leave its navigation rendering, auth behavior, locale switching, and scroll behavior unchanged.

- [ ] **Step 3: Run locale and lint checks**

Run: `node scripts/compare-i18n.mjs`

Expected: PASS with no missing or extra keys between `th.json` and `en.json`.

Run: `npm run lint`

Expected: PASS with no new errors in the page, Header, navigation, or locale files.

- [ ] **Step 4: Commit the Header and copy update**

```bash
git add src/data/navigation.ts src/components/layout/Header.tsx messages/th.json messages/en.json
git commit -m "feat(approved-abstracts): restore header navigation"
```

---

### Task 5: Run full verification and inspect the rendered result

**Files:**
- Test: all repository tests and the changed page/data files

**Interfaces:**
- Validates the completed page without changing source behavior

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all tests PASS, including dataset count tests and filter tests.

- [ ] **Step 2: Run lint and production build**

Run: `npm run lint`

Expected: PASS.

Run: `npm run build`

Expected: PASS with the localized `approved-abstracts` route compiled.

- [ ] **Step 3: Verify source invariants**

Run:

```bash
rg -n "NEXT_PUBLIC_API_URL|api/abstracts/accepted|fetch\(" src/app/[locale]/approved-abstracts src/components/layout/Header.tsx src/data/navigation.ts
git diff --check
git status --short
```

Expected: no API matches, no whitespace errors, and only the intended implementation commits/files are present.

- [ ] **Step 4: Inspect both locales and responsive states**

Start the app with `npm run dev`, open `/th/approved-abstracts` and `/en/approved-abstracts`, and verify:

- default Round 1 count is 119;
- type counts are 31 Oral, 39 Highlighted Poster, and 49 Poster;
- the two `รอผลประกาศ` rows remain visible with no Tracking ID;
- category dropdown, search, reset, and Round 2 empty state work without a network request;
- Header exposes the Accepted Abstracts link on desktop and mobile;
- no horizontal overflow or clipped row content appears on mobile.

- [ ] **Step 5: Commit any verification-only correction and stop**

If verification finds a source transcription error, correct only the affected static row and rerun Task 1 tests plus the full gate before committing:

```bash
git add src/data/approvedRound1Abstracts.ts src/data/approvedRound1Abstracts.test.ts
git commit -m "fix(approved-abstracts): correct round 1 source data"
```

Stop after the full gate passes; do not add Round 2 data, affiliation values, or unrelated refactors.
