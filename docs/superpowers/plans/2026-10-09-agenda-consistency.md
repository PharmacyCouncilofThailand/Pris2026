# Agenda consistency implementation plan

**Goal:** Apply the approved Day1/Day2 order to agenda cards, mobile lists and session details.

**Architecture:** Reuse AgendaEventCardContent in the modal. Keep raw schedule times compatible with the shared homepage schedule and format the Thai suffix only at display time. Read existing organizer descriptions and speaker roles without inventing missing information.

**Tech Stack:** Next.js, React, next-intl, Tailwind, node:test.

## Constraints

- Order: time, session, organizer, room, divider when people are present, speakers, moderators.
- Remove หัวข้อ from all Day2 session titles.
- Keep Chair separate and preserve existing descriptions and bilingual names.
- No new dependencies or unrelated redesign.

## Execution

- [x] Add a focused test for Thai time formatting, organizer extraction and role grouping.
- [x] Add agenda display helpers; remove Day2 title prefixes in scheduleData.ts.
- [x] Reuse the card content in the modal and remove the duplicate room badge above mobile cards.
- [x] Render separate speaker, moderator and Chair groups with localized labels.
- [x] Run focused tests, ESLint and TypeScript checks; review the diff.

Validation: 85 unit tests and 11 schedule layout tests passed. TypeScript and production build passed. Browser checks covered both days, Thai and English, the foyer header and bullet lists in modal details at 1440px and 390px. Existing repository lint findings remain unchanged. Deployment is outside this check.
