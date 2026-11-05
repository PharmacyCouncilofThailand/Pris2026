# PRIS2026 Awards Implementation Plan

> For agentic workers: execute this plan task by task in this chat, with focused checks between tasks. The user has confirmed both design B and its written specification.

**Goal:** Publish a public, bilingual awards page for the 57 official winners, using their latest database file pointers and the approved B layout.

**Architecture:** Keep official award facts in an immutable backend roster. A public reader joins the current Round 2 source identity to present database announcements and current available uploads. The frontend fetches that public DTO and renders category/award groups using existing PRIS layout, fonts and preview tooling.

**Tech Stack:** Existing Fastify, Drizzle/PostgreSQL, Next.js, React, next-intl, Lucide and pdfjs-dist. No new dependencies or database migrations.

## Global Constraints

- Implement `docs/superpowers/specs/2026-11-05-awards-announcement-design.md` as confirmed.
- Keep all 57 winners visible independently of file/preview availability; groups 23/25/9, award levels 18/18/21, canonical O099.
- Use current upload pointers, never committed file URLs, old versions, submitter emails or storage credentials.
- Public viewing and separate original-file tabs; no download control or new download endpoint.
- Reuse shared Header/Footer and Thai/English routing; preserve the Awards page on refresh.
- Category separation in All categories: desktop 96px, divider, 32px; mobile 64px, divider, 24px. Heading sizes 26px/21px.
- No production database writes or deployment. Execute inline; do not require another execution-choice round.

## Task 1: Public award facts and current-file reader

**Files:** Create `conference-api/src/modules/presentations/data/awardResults.ts`, `conference-api/src/modules/presentations/award-types.ts`, `conference-api/src/modules/presentations/awards.ts`, `conference-api/src/modules/presentations/awards.test.ts`; modify `conference-api/src/index.ts`.

**Interface:** `readAwardResults(database: PresentationDatabase): Promise<AwardItem[]>`; public `GET /api/events/PRIS-2026/awards` returns `{success:true,data:{items}}`, with `Cache-Control: no-store`.

```ts
type AwardGroup = 'oral' | 'highlighted-poster' | 'student-oral';
type AwardLevel = 'excellent' | 'outstanding' | 'very-good';
type AwardRecord = { trackingId:string; group:AwardGroup; categoryName:string;
  awardLevel:AwardLevel; title:string; submitterName:string };
type AwardFile = { url:string; mimeType:'application/pdf'|'image/png';
  version:number; previewUrl:string|null };
type AwardItem = AwardRecord & { file:AwardFile|null };
```

- [x] Transcribe the previously extracted, reviewed official 57 facts into the roster, omitting snapshot URLs, file metadata and thumbnails.
- [x] Test official counts, unique IDs, student categories, O099 and current Round 2 membership.
- [x] Project files through canonical tracking ID plus current source key, requiring a unique ready announcement and available current file. Validate public provider URLs and return an explicit public DTO.
- [x] Scope the read to the event and current target pointer:

```sql
SELECT a.source_key, a.source_row->>'trackingId', a.match_state,
       f.file_url, f.mime_type, f.version, f.file_status
FROM presentation_announcements a
JOIN events e ON e.id=a.event_id AND e.event_code='PRIS-2026'
LEFT JOIN presentation_targets t ON t.id=a.target_id AND t.event_id=a.event_id
LEFT JOIN presentation_upload_files f ON f.id=t.current_upload_id AND f.target_id=t.id
WHERE a.present=true;
```

- [x] Register the public route using the existing Fastify presentation validation/error conventions.
- [x] Test unavailable/deleted/conflicting files, changed versions, public fields, event/query rejection and database failures. Use injected executor fixtures; additionally run the real reader inside a read-only database transaction.
- [x] Run `npx tsx --test src/modules/presentations/awards.test.ts src/modules/presentations/kiosk.test.ts` and `npx tsc --noEmit` in conference-api. Expected: new tests pass; report unrelated baseline errors separately.

## Task 2: Approved B page and provider-aware previews

**Files:** Create `Pris2026/src/types/awards.ts`, `src/lib/awards.ts`, `src/lib/awards.test.ts`, `src/components/awards/AwardsPage.tsx`, `AwardThumbnail.tsx`, `awards.css`, `src/app/[locale]/awards/page.tsx`; extend `src/lib/presentationApi.ts` and the existing first-page rendering cache key.

**Consumes:** Task 1's exact DTO and endpoint. **Produces:** the public page, pure filter helper, and lazy thumbnail/inline preview behavior.

- [x] Copy only the public DTO into frontend types. Add `getAwardResults(signal?:AbortSignal):Promise<AwardItem[]>` using a no-store fetch and the existing PresentationApiError convention.
- [x] Test group/category/award/search combination and filter reset semantics with representative long Thai/English titles and student works.
- [x] Render the B structure from the approved companion, using real shared chrome and localized interface copy. Keep semantic category/award headings, full names/titles and explicit matching counts.
- [x] Use native contained images for public Drive thumbnails and PNGs; reuse the installed lazy PDF first-page renderer for validated R2 PDFs. Key preview state/cache by URL and file version. Keep file errors local to the row.
- [x] Provide inline expanded previews and separate-tab original links only. Add explicit loading, retry, unavailable-file and empty-search states.
- [x] Match award bands and the confirmed All categories spacing, adapting the desktop index to a mobile category select. Maintain keyboard focus and reduced-motion support.

## Task 3: Site integration and focused acceptance

**Files:** Modify `src/data/navigation.ts`, `src/components/layout/Header.tsx`, `src/lib/refreshRedirect.ts`, `src/lib/refreshRedirect.test.ts`, `messages/th.json`, `messages/en.json`.

- [x] Add Awards under Abstracts, register the light Header treatment and add all UI translations. Keep official research copy in its source language.
- [x] Exempt only `/awards` (including localized/trailing-slash forms) from home-on-reload behavior. Test alongside existing refresh behavior.
- [x] Run focused tests, changed-file ESLint, TypeScript and production build in Pris2026; run the API build.

```powershell
npx tsx --test src/lib/awards.test.ts src/lib/refreshRedirect.test.ts
npx tsc --noEmit
npm run build
```

- [x] Verify actual public DTO output with the real database using SELECT-only access. Start any visual-review API harness with the awards route only, avoiding the production application's startup reconciliation/jobs.
- [x] Inspect desktop/mobile together, TH/EN, all three groups, All categories/single category, combined filters, preview failure and new-tab links. Confirm no horizontal overflow, no download controls and preserved refresh/language routing.
- [x] Run the Impeccable mechanical detector once after the finished UI, resolve mechanical defects in one batch, and run the required fresh finish review/documentation handoffs without broadening scope.
- [x] Record focused verification and known external-preview limits, preserve the approved visual system, and finish without deployment.
