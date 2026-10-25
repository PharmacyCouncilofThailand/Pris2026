# PRIS2026 Poster kiosk

Date: 2026-10-26, Asia/Bangkok.

Status: design approved section by section by the user on 2026-10-26; visual direction D Night selected from `.impeccable/mocks/kiosk-poster-finder.html` (local, gitignored). Spans Pris2026 and conference-api. Approval of this design does not authorize production deployment or R2 configuration changes.

## Purpose and scope

A portrait kiosk page at the PRIS 2026 venue (29–30 October 2569) where a presenter finds their own Poster and views the presentation file they submitted. The page is reachable only by URL: no menu link, no sitemap entry.

- Searchable works: the current Round 2 roster (`approvedRound2Abstracts`, via `loadCurrentPresentationAnnouncements()`), types `poster` and `highlighted-poster` only (148 + 47 = 195 at time of writing). Oral works and withdrawn works (e.g. P198) are out of scope.
- Search fields: Tracking ID, submitter name, abstract title.
- Access: fully public. No key, no login. Roster fields are already public through `GET /api/events/PRIS-2026/approved-abstracts`; poster files already live at public R2 URLs.
- Flow: search, see matching works, view the Poster full screen, close, and the page resets to a fresh search.
- Out of scope: download buttons, upload or revision from the kiosk, Oral files, on-screen language toggle, custom on-screen keyboard, analytics.

## Existing-system facts this design relies on

- Poster files are stored on R2 (`presentationStorageProvider('poster') === 'r2'`) at `https://<bucket>.r2.dev/events/<eventId>/presentations/<abstractId>/<uploadId>.<png|pdf>`. The backend rejects non-`.r2.dev` public bases. Objects are written with `Cache-Control: public, max-age=31536000, immutable`, and a resubmission creates a new object key.
- Poster files are one PNG image or a one-page PDF, 9:16 portrait, at most 30 MB (`MAX_POSTER_BYTES`).
- Roster rows link to files through `presentation_announcements` (`source_key = "<round>:<id>"`, `present`) → `presentation_targets.current_upload_id` → `presentation_upload_files` (`file_url`, `mime_type`, `version`, `file_status`).
- Pris2026 `GlobalRefreshRedirect` sends any browser reload back to `/<locale>` unless `shouldRedirectReload` excludes the path. `Header` and `Footer` render on every route unless they return `null` for it.

## API (conference-api)

New public plugin `presentationKioskRoutes` in `src/modules/presentations/`, taking `{ database: PresentationDatabase }`, registered in `src/index.ts` under prefix `/api/events` next to `presentationAnnouncementRoutes` (no auth hook).

`GET /api/events/:eventCode/poster-kiosk`

- `eventCode` other than `PRIS-2026` → `404 PRESENTATION_EVENT_NOT_FOUND`. Any query string → `400 PRESENTATION_INVALID_INPUT` (existing `presentationValidationErrors`).
- Header `Cache-Control: public, max-age=60`.
- Database failure → `503`; the existing error handler shape applies.

Data assembly:

1. Roster: `loadCurrentPresentationAnnouncements()` filtered to `presentationType` in (`poster`, `highlighted-poster`) and non-null `trackingId`.
2. Files: one SQL query for the PRIS-2026 event joining `presentation_announcements` (`present = true`) → `presentation_targets` → `presentation_upload_files` on `current_upload_id`, keeping only `file_status = 'available'`, returning `source_key`, `file_url`, `mime_type`, `version`.
3. Match each roster row to a file row by `source_key = "2:<id>"`. No target, no current upload, or a non-available file → `file: null`.

Step 3 is a pure exported function so it can be unit tested without a database.

Response:

```ts
{ success: true, data: { items: Array<{
  trackingId: string;
  title: string;
  submitterName: string | null;
  affiliation: string | null;
  categoryName: string;
  presentationType: "poster" | "highlighted-poster";
  file: { url: string; mimeType: "image/png" | "application/pdf"; version: number } | null;
}> } }
```

No email, abstractId, target id, storage identity or other internal field is returned. Expected size is roughly 60–80 KB.

## Search (Pris2026, `src/lib/posterKioskSearch.ts`)

- Normalize query and fields: Unicode NFC, lowercase, collapse whitespace, trim.
- Tracking ID match ignores hyphens and spaces on both sides, so `p018`, `P-018` and `PRIS-2026-P018` all find `PRIS-2026-P018`.
- Submitter name and title match by substring after normalization.
- Search starts at 2 or more characters. An exact Tracking ID match ranks first; then roster order. At most 20 results.
- Result states:
  1. Item with `file` → shows the "ดูเต็มจอ" action.
  2. Item with `file: null` → card still shown with "ไม่มีไฟล์ผลงานในระบบ", no view action.
  3. No matching item → "ไม่มีในรายชื่อผลงานที่ผ่านการคัดเลือก". Oral Tracking IDs and withdrawn works land here by design.

## Page and states (Pris2026)

Route `src/app/[locale]/poster-kiosk/page.tsx`. Shared changes:

- `Header` and `Footer` return `null` when the path starts with `/poster-kiosk`.
- `shouldRedirectReload` in `src/lib/refreshRedirect.ts` excludes `/poster-kiosk`, so a reload stays on the kiosk.

Visual system (D Night): ground `#050a1c` with the site's blue/orange curtain beams; primary actions use the pill gradient `#2563eb → #6d5ee0 → #ea580c` with white text; Tracking ID in `#fb923c`; second heading line uses the site heading gradient; Noto Sans Thai / Outfit through the existing font variables; no gold. Layout is full-viewport portrait, sized with viewport units (`vw`, `svh`) rather than the mockup's fixed pixels, so it holds on 1080×1920 and other portrait screens. Touch targets are at least 64 CSS px.

State machine in `src/lib/posterKioskState.ts` (pure reducer, used by the page):

| State | Shows | Transitions |
|---|---|---|
| `idle` | Poster wall, heading, search field (about 60% down) | typing → `results` |
| `results` | Search field pinned to the top, up to 20 result cards | "ดูเต็มจอ" → `viewing`; empty query → `idle` |
| `viewing` | Full-screen Poster in a native `<dialog>`, "ปิดและค้นหาใหม่" bottom centre | close or Escape → `idle` with cleared query |

Focusing the search field in `idle` moves the heading up so the field sits at the top and the OS on-screen keyboard never covers the field or results.

Loading and errors:

- First load: search is usable; results area shows "กำลังโหลดรายชื่อผลงาน…" rather than a not-found state.
- Roster fetch failure with no cached roster: "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่", a "ลองใหม่" button, and automatic retry every 30 s. With a previously loaded roster: keep using it silently.
- Background roster refresh every 5 minutes, only while in `idle`.
- File cannot be opened in `viewing`: "เปิดไฟล์ Poster ไม่ได้" with retry and close. Never phrased as a missing file.

Idle reset: 60 s without touch or input in `results` or `viewing` returns to `idle` and clears the query. During the last 10 s a countdown bar ("จะกลับหน้าแรกใน X วินาที") appears; any touch cancels it. `idle` never resets.

Interaction and accessibility: OS on-screen keyboard only. Page-level text selection is disabled except in the search field. Search field has a real `<label>`. Result count is announced through `aria-live="polite"`. The dialog uses native Escape handling and returns focus to the triggering button. `prefers-reduced-motion` stops the wall animation.

Copy lives in `messages/th.json` and `messages/en.json` under `posterKiosk`. Locale comes from the URL (`/th/poster-kiosk`, `/en/poster-kiosk`); there is no on-screen toggle.

## File display (Pris2026)

PNG:

- `next.config.ts` gains `images.remotePatterns` allowing only `https://**.r2.dev/events/*/presentations/**`.
- `next/image` serves resized webp: 400 px wide for result thumbnails and the wall, 2160 px wide at quality 85 for full-screen view.

PDF (one page):

- `pdfjs-dist` (new dependency) loaded by dynamic import only when a PDF must be shown. Worker via `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` under the project's `--webpack` build.
- Render page 1 to a canvas: 400 px wide for thumbnails; screen width × `devicePixelRatio`, capped at 2160 px, for full screen.
- Keep the 10 most recent renders in memory.
- pdf.js fetches cross-origin, so the R2 bucket needs a CORS rule allowing `GET` from the PRIS web origins. Primary path: configure that rule once. Fallback if it cannot be configured: a Next route handler `/api/poster-kiosk/file` that streams only URLs matching the R2 pattern above, never an open proxy. Which path ships is confirmed before implementation of PDF display.

Poster wall (idle):

- Up to 9 randomly chosen PNG posters per roster load, in 3 slowly scrolling CSS columns. Fewer than 6 PNGs repeat; none leaves only the curtain background. PDFs are not used on the wall.
- Decorative: `aria-hidden`, not interactive.

Full-screen view:

- Poster shown with `contain` on the dark ground; 9:16 files fill the screen, other ratios letterbox without cropping.
- While loading, show the already-loaded thumbnail blurred with a loading indicator, then swap to the full image.
- `usePosterZoom` hook (pointer events): double-tap toggles 2× at the tap point, pinch zooms 1–3×, drag pans while zoomed; zoom resets on close.
- No information overlay on top of the Poster and no download button.

## Testing

conference-api:

- `readers.test.ts` (extend): the pure matcher keeps only `poster`/`highlighted-poster` with Tracking IDs; `available` file → `file`; `deletion_pending`, `deleted` or no target → `file: null`; item keys equal exactly the response contract.
- `routes.integration.test.ts` (extend): public access without token; 404 for another event code; 400 for any query; `Cache-Control: public, max-age=60`; a resubmission surfaces the newer version.
- Add new files to `test:presentations` / `test:presentations:integration` if any are created.

Pris2026:

- `src/lib/posterKioskSearch.test.ts`: Tracking ID variants; Thai names with irregular whitespace; title term ("RDU"); 2-character minimum; exact Tracking ID ranks first; 20-result cap; three result states including an Oral ID and P198.
- `refreshRedirect.test.ts` (extend): reload at `/th/poster-kiosk` does not redirect.
- `src/lib/posterKioskState.test.ts`: transitions, 60 s reset, countdown cancel, refresh only in `idle`.
- Playwright `tests/poster-kiosk.spec.ts` at 1080×1920 with `page.route` fixtures and small real PNG/PDF files in `tests/fixtures/`: no Header/Footer; search → view → close → empty `idle`; PDF renders; API 503 shows error and retry; `page.clock` drives the auto reset; Escape closes the dialog and focus returns.
- Visual check: screenshots of the three states at 1080×1920 against the D Night mockup, and 768×1366 for overflow.

Pre-event checklist (not automatable): on-screen keyboard on the actual kiosk device, R2 CORS in production (or fallback chosen), load time over venue Wi-Fi, pinch/double-tap on the real touchscreen.
