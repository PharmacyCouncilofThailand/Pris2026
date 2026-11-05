# Awards announcement implementation

Recorded 5 November 2026. This public Read surface implements the user-approved design B and [approved specification](../superpowers/specs/2026-11-05-awards-announcement-design.md) at `/th/awards` and `/en/awards`, under Abstracts.

## Current visual reference — Poster Gallery

The latest user request aligns Awards with Poster Gallery. `AwardsPage` reuses the actual `PageHero` component with centered, inline title parts and the same blue-to-orange family, bounded to 88px desktop / 36px mobile and shorter reading-oriented spacing. Thai splits the existing title into ประกาศผล / รางวัล; English into Research / Awards. Shared Header/Footer and Gallery itself are unchanged.

Presentation selectors and View presentation links now use the Gallery's dark slate pills (`#0f172a`), white text and black hover. The PDF download is an orange pill (`#c2410c`, darker than Gallery's orange-600 for small white-text contrast); hover/active use `#9a3412`/`#7c2d12`. Active category entries use orange-50/orange-950 with orange-700 counts. Search/select fields use slate-50, slate-300 outlines and 12px corners. Award band labels/colors and the 96px/64px category separation remain. These values supersede the previous hero and action styling recorded below. Original-file actions, no-preview behavior, filters and exact supplied PDF bytes are unchanged.

Bounded visual/functional check: Thai desktop 1440px and mobile 390/320px, English 320/900px had no page overflow. Work actions measured 46px high; download measured 48px. The three groups retained 23/25/9 original-file links, Poster had no preview UI, and no work download attribute was introduced. Search/no-results/reset worked. Dark work controls have 17.85:1 white-text contrast; the orange download has 5.18:1. Final production build including TypeScript, changed-component ESLint, existing award-filter test and diff whitespace check passed. Captures: `.impeccable/review/awards/gallery-theme-desktop.jpg` and `gallery-theme-mobile.jpg`. The Gallery reference's hero and controls were inspected in the browser and source; its poster data was unavailable on the awards-only review API, so that harness result does not characterize production Gallery availability.

## Current file actions revision — 5 November 2026

The latest user instruction removes previews from all three groups, including Highlighted Poster. Awards no longer mounts a thumbnail or PDF renderer, and the unused `AwardThumbnail.tsx`, preview CSS and preview-only translations are removed. The shared kiosk/gallery PDF tooling and public API contract are unchanged. The preview descriptions and their test evidence later in this record are historical and superseded by this revision.

Each available work has one solid-blue View presentation action: white text on `#2563eb`, 46px minimum height, 8px corners, visible focus, and hover/active colors `#1d4ed8`/`#1e40af`. It sits beside flexible copy with a 28px gap on desktop (20px medium); mobile uses one column with a 14px gap and full-width action. The visible label, work ID and new-tab behavior are included in its accessible name. Missing files retain an explicit message.

The separate outlined Download award results action near the title links to `/documents/award-results-2026.pdf` with native download filename `ผลการตัดสินรางวัล.pdf`. It is available independently of API state and filters. The 388,419-byte asset is copied unchanged from the user's supplied PDF; source and asset SHA-256: `3269421cf733eee88d5bf80540212bbb0590c4e1f06c234673f5bfd0005340c2`. No document content was treated as instructions and no PDF replacement was generated. Work files still have no download action.

Validation for this revision: production build (including TypeScript), changed-component ESLint and the existing award-filter test passed. Browser checks found 23/25/9 work links in the three groups and no preview UI or work download attributes. Thai at 1440/390/320px had no horizontal overflow; work and announcement actions measured 46px high. A real browser click downloaded `ผลการตัดสินรางวัล.pdf`; its SHA-256 matched both source and public asset, and the public URL returned HTTP 200 with `application/pdf`. Local captures: `.impeccable/review/awards/file-actions-desktop.jpg` and `file-actions-mobile.jpg`.

## Authority and scope

This is an extension of the incumbent PRIS2026 identity. The implementation retains the installed Noto Sans Thai / Outfit fonts, real PRIS logo, shared Header/Footer, white surfaces, slate reading text, blue actions and orange accents. `PRODUCT.md` and `DESIGN.md` were read as existing context; their ticket and agenda history was preserved. This note does not replace the system, rewrite its history or repair unrelated drift. `.impeccable/design.json` was preserved.

The official announcement PDF dated 30 October 2569 supplies the award facts. The immutable roster contains 57 winners: 23 general Oral, 25 Highlighted Poster and 9 student Oral; award-level totals are 18 Excellent, 18 Outstanding and 21 Very Good. General Oral and Highlighted Poster each retain eight categories; student Oral retains its three official categories. Joint winners remain peers. The organizer-confirmed canonical correction is `PRIS-2026-O099`; the source PDF's P099 is not used as the public record ID. Research titles, categories, recipient names and professional prefixes remain in their source language while interface labels support Thai and English.

## Implementation evidence

| Concern | Source |
| --- | --- |
| Public route and page metadata | `src/app/[locale]/awards/page.tsx` |
| Reading layout, controls, states and file actions | `src/components/awards/AwardsPage.tsx` |
| Downloadable user-provided announcement | `public/documents/award-results-2026.pdf` |
| Shared PDF renderer compatibility and minified-build types | `src/components/poster-kiosk/pdfFirstPage.ts`, `src/types/pdfjs-min.d.ts` |
| Scoped presentation and responsive values | `src/components/awards/awards.css` |
| Filtering and official group/level order | `src/lib/awards.ts` |
| No-store public metadata request | `src/lib/presentationApi.ts` |
| Public DTO | `src/types/awards.ts` |
| Installed fonts and inherited locale rules | `src/app/layout.tsx`, `src/app/globals.css` |
| Navigation and light Header integration | `src/data/navigation.ts`, `src/components/layout/Header.tsx` |
| Current-file projection and public endpoint | `../conference-api/src/modules/presentations/awards.ts` |
| Static official facts | `../conference-api/src/modules/presentations/data/awardResults.ts` |

No dependency or database migration was added. Production code does not depend on companion mockups, local PDF extraction files or their file-URL snapshot.

## Observed visual values

These are route-local source values, not additions to the global token system.

| Role | Implemented value |
| --- | --- |
| Main ink / muted copy / actions / rules | `#0f172a` / `#526076` / `#2563eb` / `#e2e8f0` |
| Page ground | White (`#fff`) |
| Excellent band: ground / ink / border | `#fff3e8` / `#9a3412` / `#fed7aa` |
| Outstanding band: ground / ink / border | `#eff6ff` / `#1e40af` / `#bfdbfe` |
| Very Good band: ground / ink / border | `#f1f5f9` / `#334155` / `#cbd5e1` |
| Inactive presentation count: ink / ground | `#526076` / `#f1f5f9` (reported contrast 5.82:1) |
| Active count: ink / ground | `#1d4ed8` / `#eff6ff` |
| Container | `min(1320px, calc(100% - 72px))`; 48px total inset at ≤1099px; 36px at ≤760px |
| Desktop reading grid | 240px index + 48px gap + flexible results; at ≤1099px, 205px + 28px + flexible results |
| Mobile reading layout | One column at ≤760px; category index replaced with native selector |
| Hero title | `clamp(34px, 4.2vw, 58px)`, weight 800, line height 1.28; mobile 38px / 1.35 |
| All-categories headings | 26px desktop / 21px mobile |
| Award heading | 18px desktop / 15px mobile; explicit label and count, 9px corners |
| Work title | 17px / 1.7; 16px at ≤1099px; 14px / 1.75 at ≤760px |
| Recipient | 13px / 1.7; mobile 11px |
| Work row | Oral and student Oral: full-width copy. Highlighted Poster: flexible copy + 174px thumbnail, 30px gap; medium 134px / 20px; mobile 88px / 14px |
| Thumbnail | Contained image, 16:10 desktop / 4:3 mobile; expanded image capped at 650px high |
| Focus | 3px blue outline, 4px offset on buttons, links, inputs and selects |

The All categories view separates successive visible categories with 96px before a 1px `#cbd5e1` divider and 32px after it. At ≤760px this becomes 64px + 1px + 24px. The competing category-bottom margin is removed in this view. The first category has no leading divider; a single selected category does not acquire inter-category spacing. Award groups have 32px separation, reduced to 26px on mobile. Full titles and recipient names wrap without line clamps.

Surfaces use fine rules and light tonal bands rather than raised result cards. The hero retains the source's very faint blue/orange radial washes. Controls inherit the installed font; native selectors provide mobile category and award filtering. Reduced-motion CSS disables animation/transitions within this route.

## Reading behavior and failure states

The initial selection is general Oral, All categories, All awards and an empty query. Switching presentation group resets the other filters. Category, award level and case-normalized, trimmed search combine; search covers canonical tracking ID, title and recipient. Index counts describe the whole selected group/category, while the live results count describes current matches. Award groups with no matching winners are omitted. An empty search state offers Clear filters without implying there were no winners.

Each row preserves its canonical ID, full title and recipient. Following the user's 5 November revision, both general Oral and student Oral use full-width copy and only the original-file action; they mount no thumbnail, preview trigger or expanded preview. Only `highlighted-poster` retains the small first-page thumbnail and inline preview. Presentation group determines this behavior, so the canonical O099 in Highlighted Poster still has a preview. Preview buttons expose `aria-expanded` and `aria-controls`. An available original opens with `target="_blank"` and `rel="noopener noreferrer"`, with a new-tab accessible label. No download control, attribute or endpoint was introduced. Public provider/browser save behavior remains outside this control contract.

Metadata loading and API failure are distinct states; failure offers Retry. Missing files leave official facts visible, show an unavailable-file message and disable the thumbnail trigger. Thumbnail failure shows a document fallback and keeps an available original link. Thumbnails enter the loading path near the viewport (`IntersectionObserver` root margin 300px). Drive uses its provider thumbnail URL; supported R2 PDFs reuse the existing first-page renderer (400px compact / 1200px expanded), with abort handling and object-URL cleanup. File URL/version keys prevent a replacement from retaining the previous rendered preview. Preview success is not required for a winner to remain listed.

A real R2 PDF browser check exposed `TypeError: Object.defineProperty called on non-object` in the unminified PDF.js ESM import. This local failure was consistent with the [Next.js 16/Webpack upstream report](https://github.com/vercel/next.js/issues/89177); the issue link is context, not certification of every local cause. The shared renderer now imports `pdfjs-dist/build/pdf.min.mjs` from the already installed PDF.js 5.6.205 package, and `src/types/pdfjs-min.d.ts` re-exports the original package types for that import path. This is a shared renderer compatibility correction with no dependency-version or build-configuration change. Temporary diagnostic console logging was removed. In the subsequent browser check, O099's actual R2 PDF thumbnail loaded from a blob URL and its expanded first page rendered at 1200px. The local capture is `.impeccable/review/awards/r2-pdf-preview.jpg`; it establishes this observed R2 path rather than every PDF/provider state.

## Data boundary

Public `GET /api/events/PRIS-2026/awards` returns official facts plus a nullable current-file descriptor. Other event codes are rejected. Both response metadata and frontend fetch use `no-store`.

The reader scopes announcements to PRIS-2026 and follows `presentation_targets.current_upload_id` to the target's upload file. It associates through the canonical roster/source key and returns a file only for one unambiguous match with ready matching, available status, a populated version and a supported public HTTPS PDF/PNG URL. Missing eligibility, conflicts or unusable files produce a null file, not a missing winner. The public projection exposes no submitter email, upload history, matching snapshots or storage credentials. Existing R2 behavior is reused; Drive view URLs are not passed through the R2-only proxy.

## Verification evidence and limits

The implementation handoff supplied the following results; this documentation pass inspected the named source files and the desktop/320px/R2-preview captures and did not rerun application tests or database access.

| Check | Recorded result |
| --- | --- |
| Real database, SELECT-only reader path | HTTP 200; 57 official winners and 57 current files at the observed time |
| Focused API and kiosk tests | 10 passed |
| Focused frontend tests | 10 passed |
| Existing render-cache tests | 4 passed; 24 focused tests total with the API/frontend checks above |
| TypeScript and changed-file ESLint | Final checks after the shared PDF import correction passed; ESLint exit 0 and TypeScript passed within the frontend build |
| Production builds | API passed; final frontend repeat after the shared PDF import correction passed (exit 0, compiled in 7.2s), including `/[locale]/awards` |
| Design detector | One run returned `[]`; no second detector run |
| Full finish review | No other material issue in the supplied source/viewport scope beyond the inactive-count contrast finding |
| Visual finish disposition | `ship` for the sole contrast correction to `#526076` on `#f1f5f9` (5.82:1); this verdict's scope is that fix |
| PDF compatibility follow-up | Narrow reviewer disposition `ship`, with no material compatibility concern in the supplied import/types/runtime evidence; thumbnail and expanded R2 proof confirmed |
| Browser checks | Student group: 9 works / 3 categories; O099 search; empty state; `/en/awards` retained after refresh; original-file new-tab behavior; no download attributes; no overflow at 320, 390 and 1440px |
| Actual R2 PDF preview | O099 thumbnail loaded from a blob URL; expanded first page rendered at 1200px after the PDF.js import correction |

Local review images are ignored development evidence: `.impeccable/review/awards/desktop.jpg`, `mobile.jpg`, `mobile-320.jpg`, `category-separation.jpg` and `r2-pdf-preview.jpg`. They show the supplied captures, not every category, scroll position, browser, device, zoom setting or provider response. The narrow capture preserves wrapping and the mobile category selector; source rules supply the exact spacing values above. The R2 capture follows the compatibility correction; its narrow follow-up review covers that change, while the earlier contrast-only verdict remains limited to the visual fix.

External Drive thumbnail failures were observed for O030 and O048, so the preview fallback remains intentional. A successful current-file metadata read does not certify every external preview or future link. The data counts describe a point in time; the public reader continues following current pointers on subsequent requests. Browser evidence and the fix-scoped reviewer verdict do not certify all browser/provider states or repair global design drift.

The subsequent Oral-only preview removal was checked in the browser: all 23 general Oral and 9 student Oral rows retained their original-file links and had zero preview controls or containers. All 25 Highlighted Poster rows retained thumbnail triggers and preview actions, including O099 despite its O prefix. Oral rows used one full-width column without horizontal overflow at 320, 390 and 1440px. Changed-component ESLint, TypeScript and the existing award-filter test passed. Local captures: `.impeccable/review/awards/oral-no-preview-desktop.jpg` and `oral-no-preview-mobile.jpg`. This small follow-up did not rerun the production build or backend tests.

No deployment, source-PDF replacement or production database write was performed. The temporary awards-only review API used a read-only database connection and excluded application startup jobs.
