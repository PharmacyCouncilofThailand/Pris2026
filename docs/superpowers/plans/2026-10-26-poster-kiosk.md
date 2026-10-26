# Poster Kiosk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A public, URL-only portrait kiosk page where a PRIS 2026 presenter finds their Poster by Tracking ID, submitter name or title and views the submitted file full screen.

**Architecture:** conference-api gains one public read endpoint that joins the Round 2 Poster roster to each work's current available upload. Pris2026 loads that list once, searches it in the browser, and renders PNG through `next/image` and PDF page 1 through `pdfjs-dist`, inside a three-state page (`idle` / `results` / `viewing`) with a 60 s idle reset.

**Tech Stack:** Fastify + drizzle `sql` + `node:test` (conference-api); Next.js 16 (`--webpack`), React 19, next-intl, Tailwind 4, `node:test` via `tsx`, Playwright 1.64 (Pris2026); new dependency `pdfjs-dist@5.6.205`.

**Spec:** `docs/superpowers/specs/2026-10-26-poster-kiosk-design.md` (visual reference: `.impeccable/mocks/kiosk-poster-finder.html`, section "D · Gallery · Night", local only).

## Global Constraints

- Repos: `D:\confer\confer\conference\conference-api` and `D:\confer\confer\conference\Pris2026`, both on `main`. Create branch `feat/poster-kiosk` in each before Task 1; never commit to `main`.
- Endpoint: `GET /api/events/PRIS-2026/poster-kiosk`, public, `Cache-Control: public, max-age=60`; other event code → `404 PRESENTATION_EVENT_NOT_FOUND`; any query → `400 PRESENTATION_INVALID_INPUT`.
- Roster: `loadCurrentPresentationAnnouncements()` filtered to `poster` / `highlighted-poster` with non-null `trackingId`. Only `file_status = 'available'` counts as a file.
- Response item keys exactly: `trackingId, title, submitterName, affiliation, categoryName, presentationType, file` where `file = { url, mimeType, version } | null`. No email, abstractId or storage identity.
- Search: NFC, lowercase, collapse whitespace; Tracking ID ignores hyphens and spaces; minimum 2 characters; exact Tracking ID first; at most 20 results.
- Copy (Thai, verbatim): "ไม่มีไฟล์ผลงานในระบบ", "ไม่มีในรายชื่อผลงานที่ผ่านการคัดเลือก", "กำลังโหลดรายชื่อผลงาน…", "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่", "ลองใหม่", "เปิดไฟล์ Poster ไม่ได้", "ดูเต็มจอ", "ปิดและค้นหาใหม่", "จะกลับหน้าแรกใน X วินาที".
- Timing: idle reset 60 000 ms in `results`/`viewing`; countdown during the last 10 000 ms; roster refresh every 300 000 ms only in `idle`; roster retry every 30 000 ms while no roster is cached.
- Visual: ground `#050a1c`, blue/orange curtain beams, CTA gradient `#2563eb → #6d5ee0 → #ea580c` white text, Tracking ID `#fb923c`, no gold; viewport units, touch targets ≥ 64 CSS px; existing Noto Sans Thai / Outfit variables.
- PNG via `next/image`: 400 px thumbnails/wall, 2160 px quality 85 full screen; `remotePatterns` only `https://**.r2.dev/events/*/presentations/**`.
- PDF: page 1 only; 400 px thumbnails; full screen = screen width × `devicePixelRatio`, max 2160 px; keep the 10 most recent renders.
- No download button, no on-screen language toggle, no menu link.

## Review Focus

- A query that matches more than 20 works (e.g. `PRIS-2026` matches all 195): show the first 20 plus "แสดง 20 จาก {total} รายการ พิมพ์เพิ่มเพื่อให้แคบลง", never silently truncate. Test in Task 3.
- Invisible characters from Thai keyboards (U+200B zero-width space, trailing spaces) must not break matching. Test in Task 3.
- Very long Thai titles and names (the real titles exceed 150 characters) must clamp at 4 lines without horizontal overflow at 1080 and 768 px. Test in Task 9.
- Repeated fast taps on "ดูเต็มจอ" or close must not open two viewers or leave a stale viewer after reset. Test in Task 4.
- A corrupt or unreachable PDF shows "เปิดไฟล์ Poster ไม่ได้", never a blank screen or "ไม่มีไฟล์". Test in Task 9.

---

### Task 1: Kiosk reader and route (conference-api)

**Files:**
- Create: `src/modules/presentations/kiosk.ts`
- Test: `src/modules/presentations/kiosk.test.ts`

**Interfaces:**
- Consumes: `Announcement` (`./types.js`), `sourceKey(row)` (`./policy.js`), `rows`, `fail`, `PresentationDatabase` (`./access.js`), `presentationValidationErrors` (`./public.routes.js`), `loadCurrentPresentationAnnouncements` (`./data/index.js`).
- Produces:
  ```ts
  export type PosterKioskFile = { url: string; mimeType: 'image/png' | 'application/pdf'; version: number };
  export type PosterKioskItem = { trackingId: string; title: string; submitterName: string | null; affiliation: string | null;
    categoryName: string; presentationType: 'poster' | 'highlighted-poster'; file: PosterKioskFile | null };
  export type PosterKioskFileRow = { sourceKey: string; url: string | null; mimeType: string; version: number; fileStatus: string };
  export function posterKioskItems(roster: Announcement[], files: PosterKioskFileRow[]): PosterKioskItem[];
  export async function readPosterKiosk(database: PresentationDatabase, roster: Announcement[]): Promise<PosterKioskItem[]>;
  export const presentationKioskRoutes: FastifyPluginAsync<{ database: PresentationDatabase; roster?: () => Announcement[] }>;
  ```

- [ ] **Step 1: Write the failing tests** in `kiosk.test.ts` (style of `readers.test.ts`: `node:test`, `assert/strict`, no database).

  - `posterKioskItems keeps only poster and highlighted-poster rows with tracking IDs`: roster of an `oral` row `PRIS-2026-O078`, `poster` with `trackingId: null`, `poster` `PRIS-2026-P001`, `highlighted-poster` `PRIS-2026-P002` (all `round: 2`) → result trackingIds `['PRIS-2026-P001','PRIS-2026-P002']` in roster order.
  - `posterKioskItems attaches only available files by source key`: files `{sourceKey:'2:1',fileStatus:'available',url:'https://b.r2.dev/events/1/presentations/9/u.png',mimeType:'image/png',version:2}`, `{sourceKey:'2:2',fileStatus:'deletion_pending',…}`; roster ids 1, 2, 3 → item 1 `file` deep-equals `{url,mimeType:'image/png',version:2}`; items 2 and 3 `file === null`.
  - `posterKioskItems exposes exactly the public keys`: `Object.keys(item).sort()` equals `['affiliation','categoryName','file','presentationType','submitterName','title','trackingId']`.
  - `route returns items publicly with cache header`: `Fastify()` registering `presentationKioskRoutes` at `/api/events` with a fake `database.execute` returning `[]` and `roster: () => [posterRow]`; `GET /api/events/PRIS-2026/poster-kiosk` → 200, `cache-control` `public, max-age=60`, `json().data.items.length === 1`.
  - `route rejects other events and query strings`: `/api/events/OTHER/poster-kiosk` → 404 with `code === 'PRESENTATION_EVENT_NOT_FOUND'` (install an error handler mapping `ApiError` as in `routes.integration.test.ts`); `/api/events/PRIS-2026/poster-kiosk?x=1` → 400.

- [ ] **Step 2: Run to verify failure**

  Run: `npx tsx --test src/modules/presentations/kiosk.test.ts`
  Expected: FAIL, cannot find module `./kiosk.js`.

- [ ] **Step 3: Implement `kiosk.ts`**

  `posterKioskItems` filters the roster, maps files by `sourceKey` keeping `fileStatus === 'available' && url`. `readPosterKiosk` runs one query:
  ```sql
  SELECT a.source_key AS "sourceKey", f.file_url AS url, f.mime_type AS "mimeType", f.version, f.file_status AS "fileStatus"
  FROM presentation_announcements a
  JOIN events e ON e.id=a.event_id AND e.event_code='PRIS-2026'
  JOIN presentation_targets t ON t.id=a.target_id
  JOIN presentation_upload_files f ON f.id=t.current_upload_id
  WHERE a.present=true
  ```
  The route calls `presentationValidationErrors(app)`, parses params/query with `z` as `presentationAnnouncementRoutes` does, sets the header with `reply.header`, and returns `{ success: true, data: { items } }`. `roster` defaults to `loadCurrentPresentationAnnouncements`.

- [ ] **Step 4: Run to verify pass**

  Run: `npx tsx --test src/modules/presentations/kiosk.test.ts`
  Expected: 5 tests pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/modules/presentations/kiosk.ts src/modules/presentations/kiosk.test.ts
  git commit -m "feat(presentations): public poster kiosk reader"
  ```

### Task 2: Register endpoint and integration test (conference-api)

**Files:**
- Modify: `src/index.ts:294` (register next to `presentationAnnouncementRoutes`)
- Create: `src/modules/presentations/kiosk.integration.test.ts`
- Modify: `package.json` scripts `test:presentations`, `test:presentations:integration`

**Interfaces:**
- Consumes: Task 1 `presentationKioskRoutes`; `preparePresentationScenario(t, { type: 'poster', round: 2 })` from `./test-support.js`.

- [ ] **Step 1: Write the failing integration test** `public poster kiosk shows the current available upload`. Build the Fastify app exactly as `routes.integration.test.ts` lines 26–56 do (jwt, multipart, `ApiError` handler, owner routes with the fake `https://test.r2.dev` storage), plus `presentationKioskRoutes` at `/api/events` with `{ database, roster: () => [announcement] }`. Assertions:
  - before upload: `GET /api/events/PRIS-2026/poster-kiosk` without auth → 200, item `trackingId === 'PRIS-2026-P001'`, `file === null`;
  - after an owner PNG upload through `/api/abstracts/:id/presentation-uploads` (sharp-generated 900×1600 PNG, `PRESENTATION_SUBMISSIONS_ENABLED='true'`): `file.mimeType === 'image/png'`, `file.version === 1`, `file.url` starts with `https://test.r2.dev/events/`;
  - response body does not include `f.owner.email`; header `cache-control === 'public, max-age=60'`.

- [ ] **Step 2: Run to verify failure**

  Run: `npx tsx --test --test-concurrency=1 src/modules/presentations/kiosk.integration.test.ts` (requires the approved test database at `127.0.0.1:55073/confer_posters_integration_test`)
  Expected: PASS against Task 1's plugin. This test pins the real SQL join (announcement → target → upload view); if it fails, fix `readPosterKiosk` in Task 1's file. Temporarily changing the query's `file_status` filter must make it fail.

- [ ] **Step 3: Register in `src/index.ts`**: `fastify.register(presentationKioskRoutes, { prefix: "/api/events", database: db });` and add the import from `./modules/presentations/kiosk.js`. Append `src/modules/presentations/kiosk.test.ts` to `test:presentations` and `kiosk.integration.test.ts` to `test:presentations:integration`.

- [ ] **Step 4: Verify**

  Run: `npm run test:presentations` → all pass. Run: `npx tsx --test --test-concurrency=1 src/modules/presentations/kiosk.integration.test.ts` → pass. Run: `npx tsc --noEmit` → no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add src/index.ts src/modules/presentations/kiosk.integration.test.ts package.json
  git commit -m "feat(presentations): register poster kiosk endpoint"
  ```

### Task 3: Kiosk types, client and search (Pris2026)

**Files:**
- Modify: `src/types/presentations.ts` (append types)
- Modify: `src/lib/presentationApi.ts` (append client)
- Create: `src/lib/posterKioskSearch.ts`
- Test: `src/lib/posterKioskSearch.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // src/types/presentations.ts — mirrors Task 1 PosterKioskItem / PosterKioskFile
  export type PosterKioskFile = { url: string; mimeType: "image/png" | "application/pdf"; version: number };
  export type PosterKioskItem = { trackingId: string; title: string; submitterName: string | null; affiliation: string | null;
    categoryName: string; presentationType: "poster" | "highlighted-poster"; file: PosterKioskFile | null };
  // src/lib/presentationApi.ts
  export async function getPosterKiosk(signal?: AbortSignal): Promise<PosterKioskItem[]>; // throws PresentationApiError(code, status)
  // src/lib/posterKioskSearch.ts
  export const POSTER_SEARCH_LIMIT = 20;
  export function normalizeSearchText(value: string): string;
  export type PosterSearchResult =
    | { status: "short" } | { status: "none" }
    | { status: "found"; items: PosterKioskItem[]; total: number };
  export function searchPosters(items: PosterKioskItem[], query: string): PosterSearchResult;
  ```

- [ ] **Step 1: Write the failing tests** in `posterKioskSearch.test.ts` with a fixture of four items: `PRIS-2026-P018` (title containing "RDU Coordinator", submitter "ชวกณ วารีบุญมา", PNG file), `PRIS-2026-P077` (title containing "RDU Hospital", `file: null`), `PRIS-2026-P101`, `PRIS-2026-P180`.
  - `tracking id variants find the same work`: `p018`, `P-018`, `PRIS-2026-P018`, ` pris 2026 p018 ` → `found`, first item `PRIS-2026-P018`.
  - `exact tracking id ranks first`: query `PRIS-2026-P018` with another item whose title contains `P018` → index 0 is `PRIS-2026-P018`.
  - `submitter name matches with irregular and invisible whitespace`: `"ชวกณ  วารีบุญมา\u200B "` → `found`, 1 item.
  - `title term matches several works`: `RDU` → `found`, `total === 2`.
  - `queries under two characters are short`: `"p"`, `" "` → `{ status: "short" }`.
  - `unlisted queries return none`: `PRIS-2026-O078`, `PRIS-2026-P198` → `{ status: "none" }`.
  - `results cap at twenty with the full total`: 25 generated items, query `PRIS-2026` → `items.length === 20`, `total === 25`.
  - `items without files are still returned`: `P077` → `found`, `items[0].file === null`.

- [ ] **Step 2: Run to verify failure**

  Run: `npx tsx --test src/lib/posterKioskSearch.test.ts`
  Expected: FAIL, module not found.

- [ ] **Step 3: Implement**. `normalizeSearchText`: `normalize("NFC")`, strip `[\u200B-\u200D\uFEFF]`, lowercase, collapse `\s+` to one space, trim. Tracking comparison uses `normalizeSearchText(x).replace(/[\s-]/g, "")`. `getPosterKiosk` fetches `${API_BASE}/api/events/PRIS-2026/poster-kiosk` with `cache: "no-store"` and validates `json.success === true && Array.isArray(json.data?.items)`, else throws `PresentationApiError(errorCode(json.code, "POSTER_KIOSK_UNAVAILABLE"), response.status)`.

- [ ] **Step 4: Run to verify pass**

  Run: `npx tsx --test src/lib/posterKioskSearch.test.ts` → 8 pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/types/presentations.ts src/lib/presentationApi.ts src/lib/posterKioskSearch.ts src/lib/posterKioskSearch.test.ts
  git commit -m "feat(poster-kiosk): roster client and local search"
  ```

### Task 4: Kiosk state reducer (Pris2026)

**Files:**
- Create: `src/lib/posterKioskState.ts`
- Test: `src/lib/posterKioskState.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const IDLE_RESET_MS = 60_000, COUNTDOWN_MS = 10_000, ROSTER_REFRESH_MS = 300_000, ROSTER_RETRY_MS = 30_000;
  export type KioskMode = "idle" | "results" | "viewing";
  export type KioskState = { mode: KioskMode; query: string; viewingTrackingId: string | null; lastActivityAt: number };
  export type KioskAction =
    | { type: "query"; query: string; now: number }
    | { type: "view"; trackingId: string; now: number }
    | { type: "close" }
    | { type: "activity"; now: number }
    | { type: "tick"; now: number };
  export const initialKioskState: KioskState; // mode "idle", query "", viewingTrackingId null, lastActivityAt 0
  export function kioskReducer(state: KioskState, action: KioskAction): KioskState;
  export function secondsUntilReset(state: KioskState, now: number): number | null; // null unless within the last COUNTDOWN_MS of a non-idle state
  export function canRefreshRoster(state: KioskState): boolean; // mode === "idle"
  ```

- [ ] **Step 1: Write the failing tests**
  - `typing enters results and clearing returns to idle`: `query "RDU"` → `results`; `query ""` → `idle`.
  - `view opens once and ignores a second view`: from `results`, `view P018` then `view P077` → still `viewingTrackingId === "PRIS-2026-P018"`.
  - `close resets to a fresh idle`: from `viewing` → equals `{ ...initialKioskState, lastActivityAt: <unchanged> }` with `query ""`, `viewingTrackingId null`.
  - `view is ignored in idle`: `view` from `idle` → state unchanged.
  - `sixty seconds without activity resets results and viewing`: `lastActivityAt 1000`, `tick 61_000` → `idle`, query `""`; `tick 60_999` → unchanged.
  - `activity postpones the reset`: `activity 55_000` then `tick 61_000` → unchanged.
  - `idle never resets`: idle `tick 10_000_000` → unchanged.
  - `countdown only in the last ten seconds`: `secondsUntilReset` at `lastActivityAt + 49_000` → `null`; at `+51_000` → `9`; idle → `null`.
  - `roster refresh only in idle`: `canRefreshRoster` true for idle, false for results and viewing.

- [ ] **Step 2: Run to verify failure**: `npx tsx --test src/lib/posterKioskState.test.ts` → FAIL, module not found.

- [ ] **Step 3: Implement** the reducer as a pure function; `secondsUntilReset` returns `Math.ceil((IDLE_RESET_MS - (now - lastActivityAt)) / 1000)` when that remainder is `> 0` and `<= COUNTDOWN_MS`.

- [ ] **Step 4: Verify**: same command → 9 pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/lib/posterKioskState.ts src/lib/posterKioskState.test.ts
  git commit -m "feat(poster-kiosk): idle/results/viewing state machine"
  ```

### Task 5: Route shell, chrome exclusions, copy and image config (Pris2026)

**Files:**
- Modify: `src/lib/refreshRedirect.ts`, `src/lib/refreshRedirect.test.ts`
- Modify: `src/components/layout/Header.tsx:129-136`, `src/components/layout/Footer.tsx:28-35`
- Modify: `messages/th.json`, `messages/en.json` (new top-level `posterKiosk`)
- Modify: `next.config.ts`
- Create: `src/app/[locale]/poster-kiosk/page.tsx`

**Interfaces:**
- Produces: route `/[locale]/poster-kiosk` rendering `<PosterKiosk />` (Task 7) — until Task 7 lands, render the heading only. Message keys under `posterKiosk`, used by Tasks 6–8:

  | key | th | en |
  |---|---|---|
  | `headingLine1` | ค้นหา Poster | Find your |
  | `headingLine2` | ของคุณ | Poster |
  | `intro` | พิมพ์ข้อมูลผลงานเพื่อเปิดดู Poster ของคุณ | Type your work details to open your Poster |
  | `searchLabel` | ค้นหา Poster | Search Posters |
  | `searchPlaceholder` | Tracking ID, ชื่อผู้ส่ง หรือชื่อบทความ | Tracking ID, submitter or title |
  | `searchButton` | ค้นหา | Search |
  | `searchHint` | ค้นหาได้จาก Tracking ID, ชื่อผู้ส่ง และชื่อบทความ | Search by Tracking ID, submitter name or title |
  | `resultCount` | พบ {count} ผลงานที่ตรงกับ “{query}” | {count} works match “{query}” |
  | `resultCapped` | แสดง 20 จาก {total} รายการ พิมพ์เพิ่มเพื่อให้แคบลง | Showing 20 of {total}. Type more to narrow down |
  | `view` | ดูเต็มจอ | View full screen |
  | `noFile` | ไม่มีไฟล์ผลงานในระบบ | No Poster file in the system |
  | `notListed` | ไม่มีในรายชื่อผลงานที่ผ่านการคัดเลือก | Not in the list of accepted works |
  | `loadingRoster` | กำลังโหลดรายชื่อผลงาน… | Loading the list of works… |
  | `rosterError` | เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่ | Cannot reach the system. Please try again |
  | `retry` | ลองใหม่ | Try again |
  | `loadingPoster` | กำลังเปิด Poster… | Opening Poster… |
  | `fileError` | เปิดไฟล์ Poster ไม่ได้ | Cannot open the Poster file |
  | `close` | ปิดและค้นหาใหม่ | Close and search again |
  | `countdown` | จะกลับหน้าแรกใน {seconds} วินาที | Returning to start in {seconds} seconds |
  | `typePoster` | Poster Presentation | Poster Presentation |
  | `typeHighlighted` | Highlighted Poster Presentation | Highlighted Poster Presentation |

- [ ] **Step 1: Write the failing test** in `refreshRedirect.test.ts`: `poster kiosk reloads stay on the kiosk` — `shouldRedirectReload` is `false` for `/poster-kiosk`, `/th/poster-kiosk`, `/en/poster-kiosk/`.

- [ ] **Step 2: Run**: `npx tsx --test src/lib/refreshRedirect.test.ts` → the new test FAILS.

- [ ] **Step 3: Implement**: add `normalized === "/poster-kiosk"` to the exemption list in `shouldRedirectReload`; add `pathname.startsWith("/poster-kiosk")` to the `return null` conditions in `Header` and `Footer`; add the `posterKiosk` blocks to both message files; add `images: { remotePatterns: [{ protocol: "https", hostname: "**.r2.dev", pathname: "/events/*/presentations/**" }] }` to `nextConfig`; create the page following the locale/metadata pattern of `src/app/[locale]/presentation-templates/page.tsx` (metadata title "Poster Kiosk | PRIS 2026", `robots: { index: false }`).

- [ ] **Step 4: Verify**: `npx tsx --test src/lib/refreshRedirect.test.ts` → pass; `npx tsc --noEmit` → clean; `npx eslint src/lib/refreshRedirect.ts src/components/layout/Header.tsx src/components/layout/Footer.tsx "src/app/[locale]/poster-kiosk/page.tsx"` → clean; open `http://localhost:3001/th/poster-kiosk`, confirm no Header/Footer and reload stays on the page.

- [ ] **Step 5: Commit**

  ```bash
  git add src/lib/refreshRedirect.ts src/lib/refreshRedirect.test.ts src/components/layout/Header.tsx src/components/layout/Footer.tsx messages/th.json messages/en.json next.config.ts "src/app/[locale]/poster-kiosk/page.tsx"
  git commit -m "feat(poster-kiosk): route shell, chrome exclusion and copy"
  ```

### Task 6: Poster rendering (PNG and PDF) (Pris2026)

**Files:**
- Modify: `package.json` (`pdfjs-dist` exact `5.6.205`)
- Create: `src/lib/posterRenderCache.ts`, test `src/lib/posterRenderCache.test.ts`
- Create: `src/components/poster-kiosk/pdfFirstPage.ts`
- Create: `src/components/poster-kiosk/PosterImage.tsx`

**Interfaces:**
- Consumes: `PosterKioskFile` (Task 3).
- Produces:
  ```ts
  // src/lib/posterRenderCache.ts — LRU of rendered PDF object URLs
  export function createRenderCache(limit: number, revoke: (url: string) => void): {
    get(key: string): string | undefined; set(key: string, url: string): void };
  // src/components/poster-kiosk/pdfFirstPage.ts
  export async function renderPdfFirstPage(url: string, width: number, signal?: AbortSignal): Promise<string>; // object URL of a PNG; rejects on load/render failure
  // src/components/poster-kiosk/PosterImage.tsx
  export function PosterImage(props: { file: PosterKioskFile; variant: "thumb" | "full"; alt: string;
    onError?: () => void; onLoad?: () => void }): React.JSX.Element;
  ```

- [ ] **Step 1: Write the failing tests** in `posterRenderCache.test.ts`:
  - `keeps the most recent entries and revokes the evicted one`: limit 2; set a, b, c → `get("a") === undefined`, revoke called with a's URL once.
  - `get refreshes recency`: set a, b; get a; set c → b evicted, a kept.
  - `replacing a key revokes the old url`.

- [ ] **Step 2: Run**: `npx tsx --test src/lib/posterRenderCache.test.ts` → FAIL.

- [ ] **Step 3: Implement**
  - Cache with a `Map` (insertion order = recency).
  - `renderPdfFirstPage`: `await import("pdfjs-dist")`, `GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()`, `getDocument({ url })`, page 1 scaled to `width`, canvas → `toBlob("image/png")` → `URL.createObjectURL`; module-level cache `createRenderCache(10, URL.revokeObjectURL)` keyed `${url}@${width}`.
  - `PosterImage`: PNG → `next/image` with `width` 400 (`thumb`) or 2160 and `quality` 85 (`full`), `height` from 9:16, `sizes` `"(orientation: portrait) 100vw"` for full, `object-fit: contain`. PDF → `renderPdfFirstPage(url, thumb ? 400 : Math.min(2160, Math.round(window.innerWidth * devicePixelRatio)))` then `<img>`; call `onError` on rejection.

- [ ] **Step 4: Verify**: cache tests pass; `npx tsc --noEmit` clean; `npm run build` succeeds (confirms the worker URL resolves under webpack).

- [ ] **Step 5: Commit**

  ```bash
  git add package.json package-lock.json src/lib/posterRenderCache.ts src/lib/posterRenderCache.test.ts src/components/poster-kiosk/pdfFirstPage.ts src/components/poster-kiosk/PosterImage.tsx
  git commit -m "feat(poster-kiosk): PNG and PDF poster rendering"
  ```

### Task 7: Kiosk page UI — idle, search and results (Pris2026)

**Files:**
- Create: `src/components/poster-kiosk/PosterKiosk.tsx` (container: data, reducer, timers)
- Create: `src/components/poster-kiosk/PosterWall.tsx`
- Create: `src/components/poster-kiosk/PosterResultCard.tsx`
- Create: `src/components/poster-kiosk/IdleCountdown.tsx`
- Create: `src/components/poster-kiosk/posterKiosk.module.css`
- Modify: `src/app/[locale]/poster-kiosk/page.tsx` (render `<PosterKiosk />`)

**Interfaces:**
- Consumes: `getPosterKiosk` and `searchPosters` (Task 3), `kioskReducer`, `secondsUntilReset`, `canRefreshRoster` and timing constants (Task 4), `PosterImage` (Task 6), `posterKiosk.*` messages (Task 5).
- Produces: `PosterKiosk` renders `PosterViewer` (Task 8) when `mode === "viewing"`; until Task 8, a placeholder.
  ```ts
  export function PosterWall(props: { items: PosterKioskItem[] }): React.JSX.Element | null;
  // picks up to 9 random PNG items per roster load; fewer than 6 repeat to fill 3 columns; 0 PNGs → returns null (curtain only)
  export function PosterResultCard(props: { item: PosterKioskItem; onView: () => void }): React.JSX.Element;
  export function IdleCountdown(props: { seconds: number }): React.JSX.Element;
  ```

- [ ] **Step 1: Implement `PosterKiosk`**
  - Roster: `getPosterKiosk` on mount; on failure with no roster show `rosterError` + `retry` and retry every `ROSTER_RETRY_MS`; refresh every `ROSTER_REFRESH_MS` when `canRefreshRoster`; a failed refresh keeps the previous roster.
  - Timers: a 1 s interval dispatches `tick`; `pointerdown` and `keydown` on the root dispatch `activity`.
  - Search: input with visible `<label>` (`searchLabel`, visually hidden is acceptable); results region `aria-live="polite"` announcing `resultCount`; while the roster is loading and the query has ≥ 2 characters, show `loadingRoster`; `found` with `total > 20` adds `resultCapped`.
  - Focus on the input in `idle` applies the "search at top" layout so the OS keyboard never covers the field.

- [ ] **Step 2: Implement `PosterWall`, `PosterResultCard`, `IdleCountdown` and the CSS module** to match D Night: wall 3 columns, CSS `@keyframes` vertical drift, `aria-hidden`, paused under `prefers-reduced-motion`; card with 9:16 `PosterImage variant="thumb"` (or a neutral 9:16 block when `file` is null), Tracking ID `#fb923c`, title clamped to 4 lines (`-webkit-line-clamp: 4`), submitter · affiliation, type label from `typePoster`/`typeHighlighted`, and either the gradient `view` button or the `noFile` text; `none` status shows `notListed`. `user-select: none` on the root except the input.

- [ ] **Step 3: Verify in the browser**: `npm run dev`, open `/th/poster-kiosk` at a 1080×1920 viewport against the local API; check idle, a `RDU` search, a no-file card, and `PRIS-2026-O078` → `notListed`; screenshot and compare with the D Night mockup. `npx tsc --noEmit` and `npx eslint src/components/poster-kiosk` clean.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/poster-kiosk "src/app/[locale]/poster-kiosk/page.tsx"
  git commit -m "feat(poster-kiosk): idle wall, search and result cards"
  ```

### Task 8: Full-screen viewer and zoom (Pris2026)

**Files:**
- Create: `src/lib/posterZoom.ts`, test `src/lib/posterZoom.test.ts`
- Create: `src/components/poster-kiosk/usePosterZoom.ts`
- Create: `src/components/poster-kiosk/PosterViewer.tsx`
- Modify: `src/components/poster-kiosk/PosterKiosk.tsx` (replace the Task 7 placeholder)

**Interfaces:**
- Produces:
  ```ts
  // src/lib/posterZoom.ts — pure math, unit tested
  export type ZoomState = { scale: number; x: number; y: number };
  export const MIN_ZOOM = 1, MAX_ZOOM = 3, DOUBLE_TAP_ZOOM = 2;
  export function zoomAt(state: ZoomState, point: { x: number; y: number }, nextScale: number,
    bounds: { width: number; height: number }): ZoomState; // clamps scale and keeps content inside bounds
  export function panBy(state: ZoomState, dx: number, dy: number, bounds: { width: number; height: number }): ZoomState;
  // src/components/poster-kiosk/PosterViewer.tsx
  export function PosterViewer(props: { item: PosterKioskItem & { file: PosterKioskFile }; onClose: () => void }): React.JSX.Element;
  ```

- [ ] **Step 1: Write failing tests** in `posterZoom.test.ts`:
  - `double tap zooms around the tap point`: `zoomAt({1,0,0}, {x:100,y:200}, 2, {width:1080,height:1920})` → `scale 2`, and the tapped point maps to the same screen position.
  - `scale clamps to 1..3`: next scale 5 → 3; 0.5 → 1 with `x 0, y 0`.
  - `pan stays inside bounds`: at scale 2, `panBy` by +10 000 → `x` equals the maximum allowed offset.

- [ ] **Step 2: Run**: `npx tsx --test src/lib/posterZoom.test.ts` → FAIL.

- [ ] **Step 3: Implement** the math, then `usePosterZoom` (pointer events: two pointers → pinch, double tap within 300 ms → toggle `DOUBLE_TAP_ZOOM`/1, single pointer drag → pan when `scale > 1`, `touch-action: none` on the stage) and `PosterViewer`: native `<dialog>` opened with `showModal()`, Escape → `onClose`, focus returns to the triggering button; `PosterImage variant="full"` over the blurred thumbnail with `loadingPoster` until `onLoad`; `onError` → `fileError` with `retry` (remount the image) and `close`; bottom-centre gradient button `close`; no overlay on the poster, no download.

- [ ] **Step 4: Verify**: zoom tests pass; manual check in the browser (open, double-tap, close, Escape, auto reset from `viewing`); `npx tsc --noEmit` and eslint clean.

- [ ] **Step 5: Commit**

  ```bash
  git add src/lib/posterZoom.ts src/lib/posterZoom.test.ts src/components/poster-kiosk
  git commit -m "feat(poster-kiosk): full-screen viewer with zoom"
  ```

### Task 9: End-to-end tests and visual check (Pris2026)

**Files:**
- Create: `playwright.poster-kiosk.config.ts` (copy of `playwright.merchandise.config.ts` with `testDir: "./tests/poster-kiosk"`, port 3104 / fake API 3105, single project `{ name: "kiosk", use: { ...devices["Desktop Chrome"], viewport: { width: 1080, height: 1920 } } }`)
- Create: `tests/poster-kiosk/poster-kiosk.spec.ts`
- Create: `tests/poster-kiosk/fixtures/poster.png` (900×1600), `poster.pdf` (one 9:16 page), `broken.pdf` (invalid bytes)
- Modify: `package.json` script `"test:e2e:poster-kiosk": "playwright test -c playwright.poster-kiosk.config.ts"`

**Interfaces:**
- Consumes: the whole page. Fixtures: intercept `http://127.0.0.1:3105/api/events/PRIS-2026/poster-kiosk` with `page.route`; intercept `**/_next/image**` and fulfil with `poster.png`; intercept `https://fixture.r2.dev/**` and fulfil PDFs with `access-control-allow-origin: *`.

- [ ] **Step 1: Write the specs**
  - `kiosk has no site chrome`: `/th/poster-kiosk` has no `header` / `footer` element.
  - `search, view, close returns to an empty idle`: type `RDU` → 2 cards; click first `ดูเต็มจอ` → dialog visible with poster image; click `ปิดและค้นหาใหม่` → dialog closed, input value `""`.
  - `pdf poster renders`: item with `poster.pdf` → dialog shows an `img` with a `blob:` src.
  - `broken pdf shows the file error`: item with `broken.pdf` → text `เปิดไฟล์ Poster ไม่ได้`, not `ไม่มีไฟล์ผลงานในระบบ`.
  - `no-file and not-listed states`: query matching the `file: null` item shows `ไม่มีไฟล์ผลงานในระบบ` and no view button; `PRIS-2026-O078` shows `ไม่มีในรายชื่อผลงานที่ผ่านการคัดเลือก`.
  - `api failure shows retry`: route returns 503 → `เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่` and `ลองใหม่`; switching the route to 200 and clicking retry loads results.
  - `idle reset with countdown`: `page.clock.install()`, search, `fastForward(51_000)` → `จะกลับหน้าแรกใน` visible; `fastForward(10_000)` → input empty, no results.
  - `escape closes the viewer and restores focus`: open viewer, `Escape` → dialog closed, focused element is the card's view button.
  - `long titles do not overflow`: fixture title of 220 Thai characters; at 1080×1920 and after `setViewportSize({width:768,height:1366})`, `document.documentElement.scrollWidth <= clientWidth`.

- [ ] **Step 2: Run**: `npm run test:e2e:poster-kiosk` → all pass (fix the owning task's code if not).

- [ ] **Step 3: Visual check**: capture `idle`, `results` and `viewing` at 1080×1920 into `.impeccable/screenshots/poster-kiosk-*.png`; compare against the D Night mockup (colours, CTA gradient, no gold, wall fade, search position).

- [ ] **Step 4: Full verification**: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build` → all succeed.

- [ ] **Step 5: Commit**

  ```bash
  git add playwright.poster-kiosk.config.ts tests/poster-kiosk package.json
  git commit -m "test(poster-kiosk): end-to-end kiosk flow"
  ```

### Task 10 (conditional): PDF proxy when R2 CORS is unavailable (Pris2026)

Gate before starting Task 6's PDF path in production: run `curl -sI -H "Origin: https://<pris-web-origin>" "<a real poster .pdf url>"` and look for `access-control-allow-origin`. If present (or the bucket owner adds the rule), skip this task. Otherwise:

**Files:**
- Create: `src/app/api/poster-kiosk/file/route.ts`, test `src/lib/posterFileUrl.test.ts`, `src/lib/posterFileUrl.ts`
- Modify: `src/components/poster-kiosk/pdfFirstPage.ts` (fetch through the proxy)

**Interfaces:**
- Produces: `export function isAllowedPosterFileUrl(url: string): boolean;` — true only for `https:` URLs whose host ends with `.r2.dev` and whose path matches `^/events/\d+/presentations/\d+/[0-9a-f-]+\.pdf$`.

- [ ] **Step 1: Failing tests**: allowed real-shaped URL → true; `http:`, other host, `../` path, `.png`, query string → false.
- [ ] **Step 2: Run**: `npx tsx --test src/lib/posterFileUrl.test.ts` → FAIL.
- [ ] **Step 3: Implement** the validator and a `GET` handler that rejects with 400 unless allowed, then streams the upstream body with `content-type: application/pdf` and `cache-control: public, max-age=31536000, immutable`; point `renderPdfFirstPage` at `/api/poster-kiosk/file?url=<encoded>`.
- [ ] **Step 4: Verify**: unit tests pass; the Task 9 PDF spec passes with the R2 route intercept removed.
- [ ] **Step 5: Commit**: `git commit -m "feat(poster-kiosk): same-origin PDF proxy"` with the files above.
