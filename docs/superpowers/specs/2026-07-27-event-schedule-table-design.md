# Event Schedule Table Design

## Goal

Replace the room-filtered vertical timeline in `EventScheduleSection.tsx` with a responsive conference timetable inspired by the supplied reference image. The timetable must keep `scheduleData` as its source of truth, place every event in the column indicated by its existing `track`, `group`, and `location` fields, and use the PRIS website's navy, black, gold, and restrained orange visual language.

## Scope

- Change the schedule presentation and the data transformation local to `EventScheduleSection.tsx`.
- Preserve the existing Day 1 / Day 2 navigation and Thai/English localization behavior.
- Remove room and Innovation Zone group filters because all applicable venues will be visible together.
- Do not change event content in `scheduleData.ts`.
- Do not reproduce the reference image's colors, branding, background artwork, or exact dimensions.
- Do not refactor unrelated page sections.

## Information Architecture

### Desktop and tablet timetable

The timetable has a sticky header followed by a time-based grid:

1. The first column contains time labels.
2. Standard room tracks receive one column each: JUPITER 4-7, JUPITER 11, JUPITER 12, and JUPITER 13.
3. Innovation Zone receives four sub-columns, one for each existing `group` value.
4. Events with `track: "Common"` use their localized `location` as the venue key. A shared-location column is added for each distinct Common location used on the active day.
5. An event is never reassigned to another room merely to simplify the layout.

The desktop grid may horizontally scroll when the active day contains more columns than the viewport can present legibly. The time column and column header remain sticky so users retain context while scrolling.

### Mobile schedule

Below the desktop breakpoint, the same events are presented as chronological time groups rather than as a compressed multi-column table. Each event contains:

- start and end time;
- localized title and description;
- localized venue or room;
- Innovation Zone group when present;
- existing speakers and roles.

Events sharing a start time appear in the same time group. This preserves simultaneous-session discovery without requiring horizontal scrolling.

## Data Transformation

All derived structures are memoized from the active `ScheduleDay`.

### Venue columns

- Standard track order is fixed: JUPITER 4-7, JUPITER 11, JUPITER 12, JUPITER 13.
- Innovation Zone group order is fixed: GROUP 1 through GROUP 4.
- Common-location columns are appended in first-appearance order for the active day.
- Empty standard or Innovation Zone columns may remain visible to keep the room structure consistent with the published programme.
- Common-location columns are shown only when that location has events on the active day.

Each event resolves to a column key:

- `INNOVATION ZONE + group` for grouped foyer events;
- the standard track name for room events;
- `Common + location` for Common events.

If an event lacks the metadata needed for its expected column, it falls back to a localized "Other venue" column rather than being omitted.

### Time grid

- Parse each `time` string into start and end minutes.
- Collect and sort all unique start and end boundaries for the active day.
- Create one grid interval between each adjacent boundary.
- Place each event from its start boundary through its end boundary, allowing long sessions to span multiple intervals.
- When events overlap within the same resolved venue, render them in an inner stack within that venue span so no event is hidden.
- If a time cannot be parsed, keep the event visible in a final fallback group and avoid breaking the rest of the timetable.

## Visual Direction

The visual direction is a refined, information-dense conference control board:

- section atmosphere remains the existing black-to-navy-to-warm-dark gradient;
- table surface uses translucent deep navy;
- primary dividers use low-opacity white;
- sticky time and room headers use stronger navy surfaces for contrast;
- gold `#ca9b52` identifies active day, time markers, focus states, and important accents;
- restrained burnt orange may distinguish presentation highlights;
- room columns do not receive unrelated rainbow colors;
- typography follows the website's configured heading and sans families;
- event density is handled through hierarchy, spacing, and font weight rather than oversized cards.

The table uses subtle borders and a single entrance reveal. Hover and focus states improve scanning without causing layout movement.

## Component Structure

The implementation remains local to `EventScheduleSection.tsx` and introduces small focused helpers:

- time parsing and formatting helpers;
- venue-column derivation;
- timetable-layout derivation;
- a compact desktop event cell;
- a mobile time group and event item;
- a reusable localized event-content block where practical.

The public component API and `scheduleData` types remain unchanged.

## Accessibility

- Day controls retain native button behavior and visible focus styles.
- Desktop timetable uses appropriate table/grid labeling so venue headers and time labels are understandable to assistive technology.
- Decorative effects are hidden from assistive technology.
- Text and dividers maintain readable contrast against dark surfaces.
- Horizontal overflow is keyboard- and touch-scrollable.
- Motion respects reduced-motion preferences through the existing GSAP media/context setup or CSS alternatives.

## Empty and Error States

- An active day with no events shows the existing localized empty-state intent.
- Unparseable times and incomplete venue metadata do not remove events; they use fallback placement.
- Missing optional descriptions, speaker roles, or images do not leave broken visual gaps.

## Verification

1. Run ESLint for the changed component or project.
2. Run the production build or TypeScript validation available in the project.
3. Visually inspect Day 1 and Day 2 in Thai and English.
4. Check desktop widths around 1440px and 1024px for sticky headers and horizontal overflow.
5. Check mobile widths around 390px and 430px for chronological grouping and readable Thai wrapping.
6. Confirm every event ID from the active day's source data appears exactly once in either desktop or mobile rendering.
7. Confirm Innovation Zone events appear under their stored group and Common events under their stored location.
8. Confirm the unrelated existing change in `src/app/[locale]/page.tsx` remains untouched.

