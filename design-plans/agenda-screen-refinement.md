# Agenda screen refinement: keep the matrix, make the schedule readable

Written against: 2e68b10
Status: Implemented after the user requested work to start; follow-up typography requests incorporated.

## Confirmed brief

User: "เอาแบบเดิม แต่ปรับปรุงดีไซน์หน่อย มันแย่ไม่สวยเลย"
User: "ตัวอักษร เวลา กิจกรรม ห้องที่จัด จะต้องเด่น"

Visitor mode: Operate / Read. Conference attendees scan the same timetable to find the session, its time and its room. Preserve the current room matrix as default, day tabs, room/innovation grouping, timeline alternative, mobile layout and detail interaction. Refine hierarchy and visual treatment, not the information architecture.

## Evidence chain

- User-provided screenshot of the Agenda: four equal statistic cards, large raised controls container, inner tab containers, separate rounded table shell, colorful event cards, small schedule labels.
- src/components/sections/AgendaSchedule.tsx:237–300 statistic grid with four color-coded icon tiles; :305 controls container; :316 day tabs; :351 view switch; :416 table shell.
- AgendaSchedule.tsx:444 nested scroll viewport; :455 header grid uses 36px + 56px rows even in ordinary room view; :570 event cells have gradient fills, borders, shadows and small type.
- AgendaSchedule.tsx:734–776 time/category metadata, glowing dot, small pills and 13px compact title.
- App root owns Noto Sans Thai and Outfit; existing PRIS blue remains the one primary interaction accent.
- EventScheduleSection.tsx also renders AgendaSchedule on the homepage. Scope the new appearance to Agenda page; verify homepage behavior when adding any optional variant/class.
- The PDF lives in separate AgendaPrintDocument and print CSS; it has already shipped in 2e68b10.
- No current binding visual contract requires the screenshot's nested cards, rainbow tones or glows. The user's screenshot and stated hierarchy are the authority for this refinement.
- Explicit direction: large statistic values, no statistic icons, and oversized session time/title per the user's follow-up screenshots.

## Design decision

Keep the existing arrangement, make the schedule the focal content. Use white surfaces, dark slate typography, one PRIS blue accent, fine neutral separators and a restrained corner scale. Preserve genuine empty slots: they communicate that a room has no session at that time. Do not fill empty matrix cells with invented content or collapse room/time geometry.

Priority is session title first, time and room immediately identifiable, then speakers and supporting details. Express hierarchy through legible size, weight and position instead of gradients, shadows, dots or multiple colored tags.

DESIGN_VARIANCE: 3 (preserve layout), MOTION_INTENSITY: 1 (state feedback only), VISUAL_DENSITY: 5 (readable timetable).

## Proposed changes

1. Statistics: retain all four information items and their position, reduce raised card styling. Use a horizontal summary with 36px values on desktop and 28px on mobile, 14px localized labels, centered labels/values, no icons, no raised cards, and fine separators. Localize hardcoded Duration/Venues/Innovation/Sessions labels. Preserve values unless separately authorized to change factual content.
2. Controls: preserve day tabs, view toggle and venue selector in the same order. Reduce excess container padding and nested frames. Active day uses a clear blue underline or flat selection surface with dark text; secondary controls are visually quieter, with visible keyboard focus.
3. Table: one table frame rather than nested card shells. Remove decorative dot background, ambient blurred blobs and inner shadows. Ordinary room header becomes a single compact row; innovation grouping can retain its necessary two-tier header. Keep sticky room labels and left time rail while scrolling.
4. Session titles: 20px / 600 on desktop and mobile, following the user's request for larger session names. Allow Thai/English wrapping, line-height about 1.5; do not truncate titles to fake density. Body uses actual Noto Sans Thai/Outfit variables.
5. Time: 18px / 600 with tabular numerals for each session; 15px for the time rail. Keep the time rail visually distinct using a quiet surface and correct sticky alignment. Full start–end time remains near each event title; it must not shrink into micro-metadata.
6. Room: sticky header labels target 15px / 600–700 with strong contrast. Use 16px / 600 room text in event details on desktop and mobile. Category chips or decorative icons must not be more prominent than the venue. Keep station identifiers and combined room spans intact.
7. Event surface: white or very light neutral fill, one thin boundary and restrained 6–8px corners. Remove glows, card gradients, drop shadows and colored status dots. Use a blue accent for hover/selection/focus; category labels remain text with sufficient contrast. Primary title remains dark rather than color-coded by event type.
8. Secondary content: organizer, speakers and details remain available. Target 14px body and 12–13px metadata, with tight internal grouping and a readable line height. Rebalance padding so text gets more room without shrinking the grid or data.

Sizes are implementation targets to verify against the actual longest Thai and English content, not permission to cut content.

## Ownership and scope

- Primary: src/components/sections/AgendaSchedule.tsx
- Consumer: src/app/[locale]/agenda/page.tsx
- Targeted stylesheet if needed: Agenda-owned rules in globals.css or a scoped module; do not globally change shared buttons/headings
- Copy: messages/th.json and messages/en.json for any existing hardcoded UI labels
- Reuse: eventScheduleLayout.ts, agendaPresentation.ts, scheduleData.ts, current locale fonts and existing icons
- If separation is needed, add an optional Agenda appearance prop with legacy/default behavior for the homepage. Do not duplicate schedule data or create a second layout algorithm.
- No PDF redesign, schedule factual edits, new search/filter feature, or replacement default view in this plan.

## Validation before completion

- Screenshot the same screenshot region at desktop width before/after; time, activity and room must be immediately legible without zooming.
- Check both dates, normal rooms and innovation stations, matrix and timeline, TH/EN, mobile and desktop.
- Exercise day/view/venue controls and detail opening by keyboard and mouse. Keep focus visible, compare selection by more than color alone.
- Preserve all 58 event identities; combined-room sessions render correctly; no invisible/overlapping text or horizontal page overflow.
- Test longest titles, nine-speaker session and research description extremes. No line-clamp deletion of primary information.
- Verify homepage consumer still works and exported PDF retains the shipped print design.
- Focused schedule rendering tests, lint, production build. Record pre-existing agendaPresentation fixture failures separately; do not weaken tests.
- One batched visual inspection, one correction batch, one confirmation; independent review of remaining concrete defects.

## Execution checklist

- [x] User requests implementation and supplies further visual direction
- [x] Implement scoped styles and type hierarchy
- [x] Verify screen variants and PDF regression boundary
- [x] Record before/after evidence and actual test results

The initial plan was prepared without screen changes. The implementation preserves the shared data/layout functions and scopes all visual changes under `@media screen` / `.agenda-page` in `src/app/[locale]/agenda/agenda.css`, imported from globals.css. The homepage keeps its styling. Shared interaction fixes add keyboard event triggers, pressed state to controls, native modal focus/Escape handling and visible Agenda focus indicators.

## Verification

- Production build and focused ESLint pass.
- Eight Agenda/print rendering tests pass, including exact shared homepage schedule content and all 58 printed events.
- Full npm suite: 101/104 pass; three unchanged agendaPresentation fixture failures reference obsolete event IDs. Standalone layout suite: nine algorithm/data-coverage checks pass, two unchanged fixtures expect obsolete 34/30 daily event counts instead of current 29/29. No data, layout algorithm or tests changed.
- Full repository ESLint retains 23 unrelated errors (legacy require scripts, an abstracts effect, profileReceipt test); targeted changed component lint passes.
- Batched browser inspection covers TH/EN, both dates, both venue groups, both views and mobile. No page overflow or clipped titles. Browser evidence is ignored under artifacts/agenda-screen/.
- Printing with the detail dialog open produces the same 21-page A4 agenda; rendered first page is clean with no modal overlay.
- Independent code review found a card-padding click regression during implementation; fixed before final verification.
- Detector's single static warning was a false positive for the square day selector underline; documented locally, no rounded accent card is introduced.

Final confirmation: title 20px, time 18px, room 16px computed in the browser. Stats icons visible: zero; values 36px desktop / 28px at 320px. No horizontal overflow at 320px. Native modal focus trap and Escape return-focus pass in TH and EN. User then requested centered statistic labels and values, applied within each equal column.

Follow-up: activity-type badges use the site's orange palette (orange-50 / orange-200 / orange-800), while station grouping labels remain neutral. During push, upstream 0dc4a8d introduced three speaker-title corrections and a stray unquoted Thai word at scheduleData.ts:225. Rebased onto upstream, retained all corrected titles, and removed only the stray token so the application compiles.
