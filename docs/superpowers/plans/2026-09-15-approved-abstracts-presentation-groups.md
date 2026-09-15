# Approved Abstracts Presentation Groups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** แบ่งผลลัพธ์ของหน้า Approved Abstracts เป็นกลุ่ม Oral Presentation, Highlighted Poster Presentation และ Poster Presentation เมื่อเลือก `ทั้งหมด` เพื่อให้รายการอ่านง่ายและไม่ต่อกันเป็นชุดเดียว

**Architecture:** คง `filterAcceptedAbstracts` เป็นแหล่งผลลัพธ์เดียว แล้วจัดกลุ่มเฉพาะในชั้น render ของหน้า `approved-abstracts` หลังตัวกรองทำงานเสร็จ ใช้ลำดับประเภทแบบคงที่และ render แถวเดิมภายในแต่ละกลุ่ม จึงไม่เปลี่ยนข้อมูล PDF, API หรือกติกาการกรอง

**Tech Stack:** Next.js 16, React, TypeScript, next-intl, Tailwind CSS, lucide-react, Node test runner

## Global Constraints

- แสดงกลุ่มตามลำดับ `Oral Presentation` → `Highlighted Poster Presentation` → `Poster Presentation`
- แสดงหัวข้อกลุ่มเฉพาะเมื่อเลือกตัวกรอง `ทั้งหมด`
- คงลำดับรายการภายในกลุ่มตามผลลัพธ์จาก PDF และตัวกรองที่ใช้งานอยู่
- ไม่เปลี่ยนข้อมูล `approvedRound1Abstracts.ts`, API, search, round filter, category filter หรือ reset filter
- ไม่เพิ่มวงเล็บหรือเปลี่ยนคำของชื่อประเภทจาก PDF
- ใช้สีหัวข้อให้ตรงกับป้ายเดิม: ส้ม, เขียว, น้ำเงิน
- ต้องไม่เพิ่ม horizontal overflow บน viewport ประมาณ 331px

---

### Task 1: Render presentation groups in the all-results list

**Files:**
- Modify: `src/app/[locale]/approved-abstracts/page.tsx`
- Test: browser QA at `/th/approved-abstracts` and `/en/approved-abstracts`; existing `src/lib/acceptedAbstractsFilter.test.ts` remains the regression suite

**Interfaces:**
- Consumes: `filteredAbstracts`, `selectedType`, existing translated presentation labels, and existing row markup
- Produces: a grouped list only when `selectedType === "all"`; a flat list with unchanged row markup for a specific type

- [ ] **Step 1: Define the fixed group order and shared presentation labels**

Add a typed order constant inside the page module and a translated label map inside the component:

```tsx
const presentationGroupOrder = [
  "oral",
  "highlighted-poster",
  "poster",
] as const;

const presentationLabels = {
  oral: t("oralPresentation"),
  "highlighted-poster": t("highlightedPosterPresentation"),
  poster: t("posterPresentation"),
};
```

Use `presentationLabels[item.presentationType]` for the existing row badge so the group heading and row badge always use the same bilingual copy.

- [ ] **Step 2: Extract the existing abstract row into a reusable renderer**

Move the current `filteredAbstracts.map` row body into a local `renderAbstractRow(item)` function without changing its fields, keys, mobile layout, desktop layout, or presentation badge colors. The function must continue to return the existing `<li key={item.id}>` and preserve `item.sequence ?? item.id`, tracking ID, title, submitter, category, round badge, and translated presentation label.

- [ ] **Step 3: Add group headers without changing filtering**

Replace the single flat map inside the existing results `<ul>` with this behavior:

```tsx
{selectedType === "all"
  ? presentationGroupOrder.map((presentationType) => {
      const groupItems = filteredAbstracts.filter(
        (item) => item.presentationType === presentationType,
      );

      if (groupItems.length === 0) {
        return null;
      }

      return (
        <Fragment key={`presentation-group-${presentationType}`}>
          <li className={groupHeaderClass[presentationType]}>
            <p>{t("filterType")}</p>
            <h3>{presentationLabels[presentationType]}</h3>
          </li>
          {groupItems.map(renderAbstractRow)}
        </Fragment>
      );
    })
  : filteredAbstracts.map(renderAbstractRow)}
```

The group header must be a full-width list item with a 4px left accent, a light tinted background, and responsive padding. Use orange for `oral`, emerald for `highlighted-poster`, and blue for `poster`. The header must contain a semantic `<h3>`, keep the exact translated presentation label, and allow the label to wrap naturally on small screens.

- [ ] **Step 4: Verify the focused behavior**

Run:

```bash
npx tsc --noEmit
npx eslint --no-warn-ignored "src/app/[locale]/approved-abstracts/page.tsx"
npm test
```

Expected: TypeScript and focused ESLint exit successfully; all existing tests pass, including the 119-row PDF dataset and presentation-type filter tests.

Use the running local app to verify:

1. `/th/approved-abstracts` with `ทั้งหมด`: three visible section headers appear in the order Oral, Highlighted Poster, Poster; no item is duplicated or dropped.
2. `/th/approved-abstracts` with an individual presentation filter: no redundant section header appears and the original flat list remains usable.
3. Search/category filtering while `ทั้งหมด` is selected: empty groups disappear and remaining groups contain only matching rows.
4. `/en/approved-abstracts`: headers use the English translations.
5. Viewport `331 × 802`: headers and rows remain within the viewport; `document.documentElement.scrollWidth === window.innerWidth`.

- [ ] **Step 5: Run the production build**

Run `npm run build` and expect the Next.js production build to complete successfully. A network permission may be required for the existing Google Fonts fetch; this does not change the feature scope.

- [ ] **Step 6: Review and commit**

Run `git diff --check` and `git status --short`, then commit only the page change:

```bash
git add -- "src/app/[locale]/approved-abstracts/page.tsx"
git commit -m "feat(approved-abstracts): group all presentation types"
```
