# Agenda: direct room access on mobile

Implemented 2026-10-26 against main b5ca43b.

## Problem and behavior

Below 768px the room matrix was replaced by a chronological list of every venue, while room navigation disappeared. Several early sessions belong to JUPITER 4-7, so other rooms were difficult to discover. Baseline inspection at390px found all29 day1 events present; it did not reproduce a blocked horizontal gesture. At820px the existing matrix could scroll to JUPITER13.

Add a native, labeled48px venue selector to the mobile layout. It offers all rooms/venues, each Jupiter room and each foyer station. Selecting a venue immediately shows its chronological sessions. The selection persists between days; a venue absent from a day falls back to all venues. Sessions spanning rooms remain available under either room. Empty venues display a localized message.

The shared homepage receives the same selector. Desktop grid/timeline keep all their data and controls. Mobile no longer shows a desktop view toggle that changed between two equivalent lists. Print content remains independent of web filters. No schedule data changed.

## Verification

- Production build, TypeScript and focused ESLint passed
- Agenda presentation/rendering/print tests:16/16 passed
- Independent reviewer reran shared homepage/Agenda and print tests:8/8 passed, no blocking code findings
- Chromium with Android touch/mobile emulation:3/3 browser tests passed against production build
- Both languages; both days; all venue options at320,390,640,767px; exact expected session counts/titles and no horizontal page overflow
- Combined JUPITER12–13 event, modal open/Escape/focus return, selected room across day changes, desktop timeline after resize,820px table reachability and print isolation passed
- Screenshot inspection at320,390,1440px: time18px, session title20px, room16px retained; mobile selector48px
- Console errors:0. Impeccable detector findings:0. Graft wiring check passed
- Existing standalone layout suite:9 passed,2 failed on obsolete34/30 daily event-count fixtures versus current29/23. Data, layout algorithm and those fixtures are unchanged
- WebKit/iPhone tests could not launch: host lacks libicu74 and libjpeg-turbo8. Safari and physical devices remain unverified. Programmatic table scrolling verifies scroll range, not a physical swipe

Run: `npx playwright test -c playwright.agenda.config.ts`. To test a running server, set `PRIS_AGENDA_TEST_URL`.

Local screenshots/logs are under ignored `artifacts/agenda-screen/mobile-fix/`. Browser output is covered by existing `.gitignore` rules; no generated artifacts or credentials belong in the commit.

INTENT: code hides room navigation below768px and shows a long all-room timeline; user expects direct access to every room on a phone; incumbent design requires complete sessions, prominent time/title/room and desktop matrix preservation.

TWINS: searched groupEventsForMobile, mobile timeline wrappers and AgendaSchedule consumers — one other consumer, EventScheduleSection on the homepage, receives the shared fix; no separate duplicate schedule implementation found.

AUTH: user said "อัปเข้าgit ใช้sshของบัญชีtask-pharmacyเท่านั้นนะ" and confirmed "ใช่ ใช้ task-pharmacycouncil". SSH authentication returned task-pharmacycouncil; repository SSH command pins only that account's key with IdentitiesOnly=yes.
