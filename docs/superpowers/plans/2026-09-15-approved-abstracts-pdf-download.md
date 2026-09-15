# Approved Abstracts PDF Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add access to the unchanged Round 1 announcement PDF through one View PDF link and one Download PDF link on the Approved Abstracts page.

**Architecture:** Store the source PDF as a static asset under `public/documents`, then render two ordinary links above the existing filters. The view link opens the asset in a new tab; the download link uses the same asset URL with the `download` attribute. No abstract records, API calls, or filtering code change.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, next-intl, Tailwind CSS, lucide-react, PowerShell, Git.

## Global Constraints

- Keep the PDF byte-for-byte identical to `C:\Users\JaoNo\Downloads\1.ประกาศผลการคัดเลือกบทความวิชาการ รอบที่ 1.pdf`.
- Add exactly two PDF actions: View PDF and Download PDF.
- Use the root-relative asset URL `/documents/approved-abstracts-round-1.pdf`.
- Keep Thai and English labels in `messages/th.json` and `messages/en.json`.
- Show only the two requested visible actions; the document group label may remain accessible-only.
- Do not modify the 119-row Round 1 data source or filtering behavior.

---

### Task 1: Add the original PDF asset

**Files:**
- Create: `public/documents/approved-abstracts-round-1.pdf`

**Interfaces:**
- Produces: a static PDF served by Next.js at `/documents/approved-abstracts-round-1.pdf`.

- [ ] **Step 1: Create the public documents directory**

Run from `D:\confer\confer\conference\Pris2026`:

```powershell
New-Item -ItemType Directory -Force -Path 'public/documents'
```

Expected: `public/documents` exists.

- [ ] **Step 2: Copy the source PDF without transforming it**

```powershell
Copy-Item -LiteralPath 'C:\Users\JaoNo\Downloads\1.ประกาศผลการคัดเลือกบทความวิชาการ รอบที่ 1.pdf' -Destination 'public/documents/approved-abstracts-round-1.pdf' -Force
```

Expected: the target PDF exists under `public/documents`.

- [ ] **Step 3: Verify source and target hashes**

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\Users\JaoNo\Downloads\1.ประกาศผลการคัดเลือกบทความวิชาการ รอบที่ 1.pdf','public/documents/approved-abstracts-round-1.pdf'
```

Expected: both SHA-256 hashes are identical.

- [ ] **Step 4: Commit the unchanged asset**

```powershell
git add -- 'public/documents/approved-abstracts-round-1.pdf'
git commit -m "chore(approved-abstracts): add round one announcement pdf"
```

Expected: one commit contains only the copied PDF asset.

### Task 2: Add bilingual PDF action links

**Files:**
- Modify: `src/app/[locale]/approved-abstracts/page.tsx`
- Modify: `messages/th.json`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: the static URL `/documents/approved-abstracts-round-1.pdf` and the existing `useTranslations("approvedAbstracts")` instance.
- Produces: two accessible links rendered above the filter card.

- [ ] **Step 1: Add the two translation labels**

Add these keys inside the `approvedAbstracts` namespace:

```json
"pdfActionsLabel": "เอกสารประกาศผลรอบที่ 1",
"viewPdf": "ดู PDF",
"downloadPdf": "ดาวน์โหลด PDF"
```

Use these English values in `messages/en.json`:

```json
"pdfActionsLabel": "Round 1 announcement document",
"viewPdf": "View PDF",
"downloadPdf": "Download PDF"
```

- [ ] **Step 2: Add the document action row above the filters**

Render two links using the existing page card styling:

```tsx
import { Download, ExternalLink, Search, X, User, Tag, Calendar, Clock, Info } from "lucide-react";

const approvedAbstractsPdfUrl = "/documents/approved-abstracts-round-1.pdf";

<div aria-label={t("pdfActionsLabel")} className="mb-5 flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white/90 p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-end sm:px-4">
  <div className="flex flex-col gap-2 sm:flex-row">
    <a
      href={approvedAbstractsPdfUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 text-xs font-bold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      <ExternalLink aria-hidden="true" className="size-3.5" />
      {t("viewPdf")}
    </a>
    <a
      href={approvedAbstractsPdfUrl}
      download="approved-abstracts-round-1.pdf"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
    >
      <Download aria-hidden="true" className="size-3.5" />
      {t("downloadPdf")}
    </a>
  </div>
</div>
```

Place this block after the page introduction and before the existing filter card. The `aria-label` identifies the action group without adding another visible control or heading.

- [ ] **Step 3: Verify link semantics and layout**

Run:

```powershell
git diff --check
npx tsc --noEmit
npx eslint --no-warn-ignored 'src/app/[locale]/approved-abstracts/page.tsx'
```

Expected: no whitespace, TypeScript, or scoped lint errors.

- [ ] **Step 4: Commit the page and translations**

```powershell
git add -- 'src/app/[locale]/approved-abstracts/page.tsx' 'messages/th.json' 'messages/en.json'
git commit -m "feat(approved-abstracts): add pdf view and download links"
```

Expected: one commit contains the two actions and both locale labels.

### Task 3: Run regression and browser verification

**Files:**
- Verify: `public/documents/approved-abstracts-round-1.pdf`
- Verify: `src/app/[locale]/approved-abstracts/page.tsx`
- Verify: `messages/th.json`
- Verify: `messages/en.json`

**Interfaces:**
- Consumes: the committed PDF asset and two rendered links.
- Produces: verified Thai/English PDF access with unchanged abstract data.

- [ ] **Step 1: Run the existing test suite**

```powershell
npm test
```

Expected: all existing tests pass.

- [ ] **Step 2: Run the production build**

```powershell
npm run build
```

Expected: Next.js production build completes successfully.

- [ ] **Step 3: Check both routes in the browser**

Open `/th/approved-abstracts` and `/en/approved-abstracts` at desktop and 331px-wide mobile viewports. Confirm that each route shows exactly one View PDF link and one Download PDF link, the view link opens the PDF in a new tab, the download link points to the static asset, and the actions do not create horizontal overflow.

- [ ] **Step 4: Confirm the final worktree**

```powershell
git status --short
git log -3 --oneline
```

Expected: the worktree is clean and the two feature commits are present.
