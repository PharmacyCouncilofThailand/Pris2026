# Event Schedule Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the filtered schedule timeline with a full multi-venue timetable on desktop and a chronological, venue-labeled schedule on mobile without changing the source event data.

**Architecture:** Extract deterministic time parsing, venue resolution, column generation, overlap grouping, and mobile grouping into a pure TypeScript layout module. `EventScheduleSection.tsx` consumes that module to render two responsive views from the same active day's events: an ARIA-labeled desktop CSS grid and mobile chronological groups.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, next-intl, GSAP, Node.js built-in test runner.

## Global Constraints

- Keep `src/data/scheduleData.ts` unchanged and use it as the only schedule source of truth.
- Place events from their existing `track`, `group`, and `location` fields; never move an event to simplify the layout.
- Preserve Day 1 / Day 2 selection and Thai/English localization.
- Use the existing black, deep navy, gold `#ca9b52`, and restrained burnt-orange website palette.
- Do not copy the reference image's branding, artwork, colors, or exact dimensions.
- Desktop and tablet use the multi-venue timetable; mobile uses chronological time groups without horizontal scrolling.
- Preserve the unrelated existing modification in `src/app/[locale]/page.tsx`.
- Add no runtime or development dependencies.

---

### Task 1: Pure schedule layout model

**Files:**

- Create: `src/components/sections/eventScheduleLayout.ts`
- Create: `tests/eventScheduleLayout.test.mjs`

**Interfaces:**

- Consumes: `Event` from `src/types/index.ts`.
- Produces:
  - `parseScheduleTime(value: string): ParsedTime | null`
  - `resolveVenueKey(event: Event): string`
  - `buildVenueColumns(events: Event[], locale: string): VenueColumn[]`
  - `buildScheduleLayout(events: Event[]): ScheduleLayout`
  - `groupEventsForMobile(events: Event[]): MobileTimeGroup[]`

- [ ] **Step 1: Write tests for time parsing, venue resolution, columns, spans, overlap grouping, fallback placement, and mobile ordering**

Create `tests/eventScheduleLayout.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildScheduleLayout,
  buildVenueColumns,
  groupEventsForMobile,
  parseScheduleTime,
  resolveVenueKey,
} from "../src/components/sections/eventScheduleLayout.ts";

const event = (overrides) => ({
  id: 1,
  time: "09:00 – 10:00",
  title: "Session",
  titleTh: "กิจกรรม",
  location: "JUPITER 4-7",
  locationTh: "ห้อง JUPITER 4-7",
  type: "Session",
  typeTh: "กิจกรรม",
  track: "JUPITER 4-7",
  trackTh: "ห้อง JUPITER 4-7",
  speakers: [],
  ...overrides,
});

test("parseScheduleTime accepts conference separators and rejects invalid ranges", () => {
  assert.deepEqual(parseScheduleTime("08:00 – 09:10"), { start: 480, end: 550 });
  assert.deepEqual(parseScheduleTime("09.30-10.45"), { start: 570, end: 645 });
  assert.equal(parseScheduleTime("all day"), null);
  assert.equal(parseScheduleTime("10:00 – 09:00"), null);
});

test("resolveVenueKey uses group for Innovation Zone and location for Common", () => {
  assert.equal(resolveVenueKey(event({ track: "JUPITER 11" })), "track:JUPITER 11");
  assert.equal(
    resolveVenueKey(event({ track: "INNOVATION ZONE", group: "GROUP 3" })),
    "innovation:GROUP 3",
  );
  assert.equal(
    resolveVenueKey(event({ track: "Common", location: "Exhibition Area" })),
    "common:Exhibition Area",
  );
  assert.equal(
    resolveVenueKey(event({ track: undefined, location: "" })),
    "fallback:other",
  );
});

test("buildVenueColumns keeps published rooms, Innovation groups, and localized Common locations", () => {
  const columns = buildVenueColumns(
    [
      event({ track: "Common", location: "Foyer", locationTh: "โถงด้านหน้า" }),
      event({ id: 2, track: undefined, location: "" }),
    ],
    "th",
  );

  assert.deepEqual(
    columns.slice(0, 4).map((column) => column.key),
    [
      "track:JUPITER 4-7",
      "track:JUPITER 11",
      "track:JUPITER 12",
      "track:JUPITER 13",
    ],
  );
  assert.deepEqual(
    columns.filter((column) => column.kind === "innovation").map((column) => column.key),
    [
      "innovation:GROUP 1",
      "innovation:GROUP 2",
      "innovation:GROUP 3",
      "innovation:GROUP 4",
    ],
  );
  assert.equal(columns.find((column) => column.key === "common:Foyer")?.label, "โถงด้านหน้า");
  assert.equal(columns.at(-1)?.key, "fallback:other");
});

test("buildScheduleLayout creates boundary spans and stacks overlapping venue events", () => {
  const layout = buildScheduleLayout([
    event({ id: 1, time: "09:00 – 10:00" }),
    event({ id: 2, time: "09:30 – 10:30" }),
    event({ id: 3, time: "10:30 – 11:00", track: "JUPITER 11" }),
  ]);

  assert.deepEqual(layout.boundaries, [540, 570, 600, 630, 660]);
  assert.equal(layout.cells.length, 2);
  assert.deepEqual(layout.cells[0].events.map((item) => item.id), [1, 2]);
  assert.deepEqual(
    { startLine: layout.cells[0].startLine, endLine: layout.cells[0].endLine },
    { startLine: 1, endLine: 4 },
  );
  assert.deepEqual(layout.cells[1].events.map((item) => item.id), [3]);
});

test("unparseable events remain visible in fallbackEvents", () => {
  const invalid = event({ id: 99, time: "TBA" });
  const layout = buildScheduleLayout([invalid]);
  assert.deepEqual(layout.fallbackEvents.map((item) => item.id), [99]);
});

test("groupEventsForMobile sorts parsed starts and keeps unparseable times last", () => {
  const groups = groupEventsForMobile([
    event({ id: 3, time: "TBA" }),
    event({ id: 2, time: "10:00 – 11:00", track: "JUPITER 11" }),
    event({ id: 1, time: "09:00 – 10:00" }),
    event({ id: 4, time: "09:00 – 09:30", track: "JUPITER 12" }),
  ]);

  assert.deepEqual(groups.map((group) => group.timeLabel), [
    "09:00",
    "10:00",
    "TBA",
  ]);
  assert.deepEqual(groups.flatMap((group) => group.events.map((item) => item.id)), [1, 4, 2, 3]);
});
```

- [ ] **Step 2: Run the tests and verify that the missing module causes failure**

Run:

```powershell
cd D:\confer\confer\conference\Pris2026
node --test tests/eventScheduleLayout.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `eventScheduleLayout.ts`.

- [ ] **Step 3: Implement the pure layout module**

Create `src/components/sections/eventScheduleLayout.ts`:

```ts
import type { Event } from "@/types";

export interface ParsedTime {
  start: number;
  end: number;
}

export interface VenueColumn {
  key: string;
  label: string;
  eyebrow?: string;
  kind: "room" | "innovation" | "common" | "fallback";
}

export interface ScheduleCell {
  key: string;
  columnKey: string;
  start: number;
  end: number;
  startLine: number;
  endLine: number;
  events: Event[];
}

export interface ScheduleLayout {
  boundaries: number[];
  cells: ScheduleCell[];
  fallbackEvents: Event[];
}

export interface MobileTimeGroup {
  timeLabel: string;
  start: number | null;
  events: Event[];
}

const STANDARD_TRACKS = [
  "JUPITER 4-7",
  "JUPITER 11",
  "JUPITER 12",
  "JUPITER 13",
] as const;

const INNOVATION_GROUPS = ["GROUP 1", "GROUP 2", "GROUP 3", "GROUP 4"] as const;

function toMinutes(hour: string, minute: string) {
  const hours = Number(hour);
  const minutes = Number(minute);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
}

export function parseScheduleTime(value: string): ParsedTime | null {
  const match = value
    .trim()
    .match(/^(\d{1,2})[:.](\d{2})\s*[–—-]\s*(\d{1,2})[:.](\d{2})$/);
  if (!match) return null;

  const start = toMinutes(match[1], match[2]);
  const end = toMinutes(match[3], match[4]);
  if (start === null || end === null || end <= start) return null;
  return { start, end };
}

export function formatMinutes(value: number) {
  const hours = Math.floor(value / 60).toString().padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function resolveVenueKey(event: Event) {
  if (event.track === "INNOVATION ZONE" && event.group) {
    return `innovation:${event.group}`;
  }
  if (event.track === "Common" && event.location.trim()) {
    return `common:${event.location.trim()}`;
  }
  if (event.track && STANDARD_TRACKS.includes(event.track as (typeof STANDARD_TRACKS)[number])) {
    return `track:${event.track}`;
  }
  return "fallback:other";
}

export function buildVenueColumns(events: Event[], locale: string): VenueColumn[] {
  const roomColumns = STANDARD_TRACKS.map((track) => ({
    key: `track:${track}`,
    label: locale === "th" ? `ห้อง ${track}` : track,
    kind: "room" as const,
  }));
  const innovationColumns = INNOVATION_GROUPS.map((group) => ({
    key: `innovation:${group}`,
    label: group,
    eyebrow: "INNOVATION ZONE",
    kind: "innovation" as const,
  }));
  const commonByKey = new Map<string, VenueColumn>();

  for (const item of events) {
    if (item.track !== "Common" || !item.location.trim()) continue;
    const key = `common:${item.location.trim()}`;
    if (!commonByKey.has(key)) {
      commonByKey.set(key, {
        key,
        label: locale === "th" && item.locationTh ? item.locationTh : item.location,
        kind: "common",
      });
    }
  }

  const hasFallback = events.some((item) => resolveVenueKey(item) === "fallback:other");
  return [
    ...roomColumns,
    ...innovationColumns,
    ...commonByKey.values(),
    ...(hasFallback
      ? [{
          key: "fallback:other",
          label: locale === "th" ? "สถานที่อื่น" : "Other venue",
          kind: "fallback" as const,
        }]
      : []),
  ];
}

function overlaps(left: ParsedTime, right: ParsedTime) {
  return left.start < right.end && right.start < left.end;
}

export function buildScheduleLayout(events: Event[]): ScheduleLayout {
  const parsed = events.flatMap((item) => {
    const time = parseScheduleTime(item.time);
    return time ? [{ event: item, time, columnKey: resolveVenueKey(item) }] : [];
  });
  const fallbackEvents = events.filter((item) => !parseScheduleTime(item.time));
  const boundaries = [...new Set(parsed.flatMap((item) => [item.time.start, item.time.end]))]
    .sort((a, b) => a - b);
  const pending = [...parsed].sort(
    (a, b) => a.time.start - b.time.start || a.time.end - b.time.end || a.event.id - b.event.id,
  );
  const groups: typeof pending[] = [];

  while (pending.length) {
    const seed = pending.shift();
    if (!seed) break;
    const group = [seed];
    let changed = true;

    while (changed) {
      changed = false;
      for (let index = pending.length - 1; index >= 0; index -= 1) {
        const candidate = pending[index];
        if (
          candidate.columnKey === seed.columnKey &&
          group.some((member) => overlaps(member.time, candidate.time))
        ) {
          group.push(candidate);
          pending.splice(index, 1);
          changed = true;
        }
      }
    }
    groups.push(group);
  }

  const cells = groups.map((group) => {
    const start = Math.min(...group.map((item) => item.time.start));
    const end = Math.max(...group.map((item) => item.time.end));
    const eventsInCell = group
      .sort((a, b) => a.time.start - b.time.start || a.event.id - b.event.id)
      .map((item) => item.event);
    return {
      key: `${group[0].columnKey}:${start}-${end}`,
      columnKey: group[0].columnKey,
      start,
      end,
      startLine: boundaries.indexOf(start) + 1,
      endLine: boundaries.indexOf(end) + 1,
      events: eventsInCell,
    };
  });

  return { boundaries, cells, fallbackEvents };
}

export function groupEventsForMobile(events: Event[]): MobileTimeGroup[] {
  const sorted = [...events]
    .sort((left, right) => {
      const leftTime = parseScheduleTime(left.time);
      const rightTime = parseScheduleTime(right.time);
      return (
        (leftTime?.start ?? Number.POSITIVE_INFINITY) -
          (rightTime?.start ?? Number.POSITIVE_INFINITY) ||
        (leftTime?.end ?? Number.POSITIVE_INFINITY) -
          (rightTime?.end ?? Number.POSITIVE_INFINITY) ||
        left.id - right.id
      );
    });
  const groups = new Map<string, MobileTimeGroup>();

  for (const item of sorted) {
    const start = parseScheduleTime(item.time)?.start ?? null;
    const key = start === null ? `fallback:${item.time}` : `start:${start}`;
    const existing = groups.get(key);
    if (existing) {
      existing.events.push(item);
    } else {
      groups.set(key, {
        timeLabel: start === null ? item.time : formatMinutes(start),
        start,
        events: [item],
      });
    }
  }
  return [...groups.values()];
}
```

- [ ] **Step 4: Run the layout tests and TypeScript validation**

Run:

```powershell
node --test tests/eventScheduleLayout.test.mjs
npx tsc --noEmit
```

Expected: six Node subtests pass and TypeScript exits with code 0.

- [ ] **Step 5: Commit the tested layout model**

```powershell
git add src/components/sections/eventScheduleLayout.ts tests/eventScheduleLayout.test.mjs
git commit -m "feat: add event schedule layout model"
```

### Task 2: Responsive timetable and mobile schedule UI

**Files:**

- Modify: `src/components/sections/EventScheduleSection.tsx`
- Modify: `messages/en.json`
- Modify: `messages/th.json`

**Interfaces:**

- Consumes: `buildScheduleLayout`, `buildVenueColumns`, `formatMinutes`, `groupEventsForMobile`, and `resolveVenueKey` from Task 1.
- Produces: the existing default `EventScheduleSection` React component with no new props.

- [ ] **Step 1: Add schedule-specific localized labels**

Add these keys inside the existing `schedule` object in `messages/en.json`:

```json
"time": "Time",
"venue": "Venue",
"otherVenue": "Other venue",
"emptyTitle": "No active sessions",
"emptyDescription": "There are no sessions scheduled for this day.",
"innovationZone": "Innovation Zone",
"scheduleTableLabel": "Conference schedule by time and venue"
```

Add the matching keys inside `messages/th.json`:

```json
"time": "เวลา",
"venue": "สถานที่",
"otherVenue": "สถานที่อื่น",
"emptyTitle": "ไม่มีกิจกรรม",
"emptyDescription": "ไม่มีกิจกรรมที่กำหนดไว้สำหรับวันนี้",
"innovationZone": "โซนนวัตกรรม",
"scheduleTableLabel": "ตารางกำหนดการประชุมแยกตามเวลาและสถานที่"
```

- [ ] **Step 2: Replace filtered timeline state and derivation with shared responsive layout data**

In `EventScheduleSection.tsx`:

- Remove `Image`, `ChevronDown`, `EventSpeaker`, `TRACKS`, `getTrackColor`, `activeTrack`, `activeGroup`, their reset effect, `filteredEvents`, and the current `timeGroups`.
- Keep `MapPin`, day state, refs, `SectionTitle`, and Day buttons.
- Add imports and memoized values:

```tsx
import { CalendarClock, MapPin, Users } from "lucide-react";
import type { Event } from "@/types";
import {
  buildScheduleLayout,
  buildVenueColumns,
  formatMinutes,
  groupEventsForMobile,
  resolveVenueKey,
} from "./eventScheduleLayout";

const currentDay = scheduleData[activeTab];
const columns = useMemo(
  () => buildVenueColumns(currentDay.events, locale),
  [currentDay.events, locale],
);
const layout = useMemo(
  () => buildScheduleLayout(currentDay.events),
  [currentDay.events],
);
const mobileGroups = useMemo(
  () => groupEventsForMobile(currentDay.events),
  [currentDay.events],
);
const columnIndex = useMemo(
  () => new Map(columns.map((column, index) => [column.key, index + 2])),
  [columns],
);
```

Update the reveal animation to target `.schedule-reveal` after a day change and skip animation when reduced motion is preferred:

```tsx
useGSAP(
  () => {
    if (!containerRef.current) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        containerRef.current!.querySelectorAll(".schedule-reveal"),
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.035,
          ease: "power3.out",
          force3D: true,
        },
      );
    });
    return () => mm.revert();
  },
  { scope: containerRef, dependencies: [activeTab] },
);
```

- [ ] **Step 3: Add compact localized event content shared by both views**

Place this helper above the default component:

```tsx
function EventContent({
  event,
  locale,
  compact = false,
}: {
  event: Event;
  locale: string;
  compact?: boolean;
}) {
  const title = locale === "th" && event.titleTh ? event.titleTh : event.title;
  const description =
    locale === "th" && event.descriptionTh ? event.descriptionTh : event.description;
  const location =
    locale === "th" && event.locationTh ? event.locationTh : event.location;

  return (
    <article className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
        <span>{event.time}</span>
        {event.group && (
          <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[9px]">
            {event.group}
          </span>
        )}
      </div>
      <h4 className={cn(
        "font-heading font-bold leading-snug text-white",
        compact ? "text-sm" : "text-base sm:text-lg",
      )}>
        {title}
      </h4>
      {description && (
        <p className={cn(
          "mt-2 whitespace-pre-wrap font-light leading-relaxed text-white/58",
          compact ? "line-clamp-4 text-[11px]" : "text-sm",
        )}>
          {description}
        </p>
      )}
      <div className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-white/45">
        <MapPin aria-hidden="true" className="mt-0.5 size-3 shrink-0 text-gold/70" />
        <span>{location}</span>
      </div>
      {event.speakers.length > 0 && (
        <div className="mt-3 border-t border-white/8 pt-3">
          {event.speakers.map((speaker, index) => (
            <div key={`${speaker.name}-${index}`} className="flex gap-2 text-[11px] leading-relaxed">
              <Users aria-hidden="true" className="mt-0.5 size-3 shrink-0 text-gold/65" />
              <span className="text-white/72">
                {locale === "th" && speaker.nameTh ? speaker.nameTh : speaker.name}
                {(locale === "th" ? speaker.roleTh : speaker.role) && (
                  <span className="text-white/38">
                    {" · "}
                    {locale === "th" ? speaker.roleTh : speaker.role}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 4: Replace the track filters and timeline markup with the desktop timetable**

After the Day buttons, render this desktop block:

```tsx
{currentDay.events.length > 0 && (
  <div
    className="relative hidden lg:block"
    role="region"
    aria-label={t("scheduleTableLabel")}
    tabIndex={0}
  >
    <div className="overflow-x-auto rounded-[1.75rem] border border-gold/25 bg-[#061332]/88 shadow-[0_30px_90px_rgba(0,0,0,0.36)]">
      <div
        role="table"
        aria-label={t("scheduleTableLabel")}
        className="min-w-max"
        style={{
          width: `max(100%, ${116 + columns.length * 210}px)`,
        }}
      >
        <div
          role="row"
          className="sticky top-0 z-30 grid border-b border-gold/30 bg-[#091943]/96 backdrop-blur-xl"
          style={{ gridTemplateColumns: `116px repeat(${columns.length}, minmax(210px, 1fr))` }}
        >
          <div
            role="columnheader"
            className="sticky left-0 z-40 flex items-center gap-2 border-r border-gold/25 bg-[#0b1d4d] px-4 py-5 text-xs font-black uppercase tracking-[0.16em] text-gold"
          >
            <CalendarClock aria-hidden="true" className="size-4" />
            {t("time")}
          </div>
          {columns.map((column) => (
            <div
              key={column.key}
              role="columnheader"
              className="border-r border-white/10 px-4 py-4 text-center last:border-r-0"
            >
              {column.eyebrow && (
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-gold/65">
                  {t("innovationZone")}
                </span>
              )}
              <span className="mt-1 block text-xs font-black uppercase tracking-[0.08em] text-white">
                {column.label}
              </span>
            </div>
          ))}
        </div>

        <div
          role="rowgroup"
          className="relative grid"
          style={{
            gridTemplateColumns: `116px repeat(${columns.length}, minmax(210px, 1fr))`,
            gridTemplateRows: `repeat(${Math.max(layout.boundaries.length - 1, 1)}, minmax(54px, auto))`,
          }}
        >
          {layout.boundaries.slice(0, -1).map((boundary, index) => (
            <React.Fragment key={boundary}>
              <div
                role="rowheader"
                className="schedule-reveal sticky left-0 z-20 border-b border-r border-white/10 bg-[#08173b]/98 px-4 py-3 text-xs font-black tabular-nums text-gold"
                style={{ gridColumn: 1, gridRow: index + 1 }}
              >
                {formatMinutes(boundary)}
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none z-0 border-b border-white/8"
                style={{ gridColumn: `2 / ${columns.length + 2}`, gridRow: index + 1 }}
              />
            </React.Fragment>
          ))}

          {layout.cells.map((cell) => {
            const gridColumn = columnIndex.get(cell.columnKey);
            if (!gridColumn) return null;
            return (
              <div
                key={cell.key}
                role="cell"
                className="schedule-reveal z-10 m-1.5 self-stretch overflow-hidden rounded-xl border border-white/12 bg-[#0d2455]/92 p-3 shadow-[inset_3px_0_0_rgba(202,155,82,0.75)] transition-colors hover:border-gold/35 hover:bg-[#112b62]"
                style={{ gridColumn, gridRow: `${cell.startLine} / ${cell.endLine}` }}
              >
                <div className="space-y-4 divide-y divide-white/10">
                  {cell.events.map((event, index) => (
                    <div key={event.id} className={cn(index > 0 && "pt-4")}>
                      <EventContent event={event} locale={locale} compact />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
)}
```

Immediately after it, render unparseable desktop events when `layout.fallbackEvents.length > 0` as a compact list labeled with `t("otherVenue")`. Each item must use `<EventContent event={event} locale={locale} compact />` and `key={event.id}`.

- [ ] **Step 5: Add the mobile chronological schedule and localized empty state**

Render below the desktop block:

```tsx
{currentDay.events.length > 0 ? (
  <div className="space-y-4 lg:hidden">
    {mobileGroups.map((group) => (
      <section
        key={`${group.timeLabel}-${group.events[0].id}`}
        className="schedule-reveal overflow-hidden rounded-2xl border border-white/10 bg-[#091943]/72"
        aria-labelledby={`mobile-time-${group.events[0].id}`}
      >
        <div className="flex items-center gap-3 border-b border-gold/20 bg-[#0c2250]/82 px-4 py-3">
          <span className="h-7 w-1 rounded-full bg-gold" aria-hidden="true" />
          <h3
            id={`mobile-time-${group.events[0].id}`}
            className="font-heading text-lg font-black tabular-nums text-gold"
          >
            {group.timeLabel}
          </h3>
        </div>
        <div className="divide-y divide-white/10">
          {group.events.map((event) => {
            const venue = columns.find((column) => column.key === resolveVenueKey(event));
            return (
              <div key={event.id} className="px-4 py-5">
                <div className="mb-3 inline-flex rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-white/68">
                  {venue?.label ?? t("otherVenue")}
                </div>
                <EventContent event={event} locale={locale} />
              </div>
            );
          })}
        </div>
      </section>
    ))}
  </div>
) : (
  <div className="py-24 text-center">
    <MapPin aria-hidden="true" className="mx-auto mb-5 size-9 text-gold/55" />
    <h4 className="font-heading text-2xl font-bold text-white">{t("emptyTitle")}</h4>
    <p className="mx-auto mt-2 max-w-md text-sm text-white/55">{t("emptyDescription")}</p>
  </div>
)}
```

- [ ] **Step 6: Adjust section width and day control accessibility**

Use a wider table container while keeping the title aligned:

```tsx
<div className="container relative z-[1] mx-auto max-w-[1800px] px-4 md:px-8 lg:px-10">
```

Add to each Day button:

```tsx
aria-pressed={activeTab === index}
aria-label={`${t(`day${index + 1}`)} — ${locale === "th" && day.dateTh ? day.dateTh : day.date}`}
```

Keep the section background gradient and existing `SectionTitle`.

- [ ] **Step 7: Run unit, lint, and TypeScript checks**

Run:

```powershell
node --test tests/eventScheduleLayout.test.mjs
npx eslint src/components/sections/EventScheduleSection.tsx src/components/sections/eventScheduleLayout.ts
npx tsc --noEmit
```

Expected: all six Node subtests pass; ESLint and TypeScript exit with code 0.

- [ ] **Step 8: Commit the responsive schedule UI**

```powershell
git add src/components/sections/EventScheduleSection.tsx src/components/sections/eventScheduleLayout.ts messages/en.json messages/th.json tests/eventScheduleLayout.test.mjs
git commit -m "feat: render responsive event schedule table"
```

### Task 3: Data completeness and responsive visual verification

**Files:**

- Modify only if verification reveals a schedule-specific defect:
  - `src/components/sections/EventScheduleSection.tsx`
  - `src/components/sections/eventScheduleLayout.ts`
  - `tests/eventScheduleLayout.test.mjs`
  - `messages/en.json`
  - `messages/th.json`

**Interfaces:**

- Consumes: the completed responsive schedule from Tasks 1 and 2.
- Produces: a verified schedule where every event remains visible in the correct venue in both locales.

- [ ] **Step 1: Add a source-data completeness test**

Append to `tests/eventScheduleLayout.test.mjs`:

```js
import { scheduleData } from "../src/data/scheduleData.ts";

test("every source event is represented once by the desktop layout and mobile groups", () => {
  for (const day of scheduleData) {
    const desktop = buildScheduleLayout(day.events);
    const desktopIds = [
      ...desktop.cells.flatMap((cell) => cell.events.map((item) => item.id)),
      ...desktop.fallbackEvents.map((item) => item.id),
    ];
    const mobileIds = groupEventsForMobile(day.events)
      .flatMap((group) => group.events.map((item) => item.id));
    const sourceIds = day.events.map((item) => item.id);

    assert.deepEqual([...desktopIds].sort((a, b) => a - b), [...sourceIds].sort((a, b) => a - b));
    assert.deepEqual([...mobileIds].sort((a, b) => a - b), [...sourceIds].sort((a, b) => a - b));
    assert.equal(new Set(desktopIds).size, sourceIds.length);
    assert.equal(new Set(mobileIds).size, sourceIds.length);
  }
});
```

- [ ] **Step 2: Run the completeness test**

Run:

```powershell
node --test tests/eventScheduleLayout.test.mjs
```

Expected: seven subtests pass and no event ID is missing or duplicated.

- [ ] **Step 3: Run the production build**

Run:

```powershell
npm run build
```

Expected: Next.js production build completes successfully. If it reports an existing failure outside schedule files, record it without editing unrelated code.

- [ ] **Step 4: Start the local site and inspect both locales**

Run:

```powershell
npm run dev
```

Open the local Day 1 and Day 2 schedule in Thai and English. Verify:

- 1440px: all venue headers align with event cells; horizontal scrolling preserves the sticky time column and header.
- 1024px: desktop timetable remains legible and does not clip the final venue.
- 430px and 390px: no horizontal page overflow; time groups, venue badges, Thai wrapping, descriptions, and speakers remain readable.
- Day switching performs one restrained reveal without layout jumping.
- Keyboard focus reaches both Day buttons and the scrollable timetable region.
- Reduced-motion mode displays content immediately.
- Standard rooms, Innovation Zone groups, Common locations, and fallback events match their source metadata.

- [ ] **Step 5: Fix only defects found by verification, then rerun all checks**

For any defect, add a focused assertion to `tests/eventScheduleLayout.test.mjs` when it concerns parsing or placement, make the smallest schedule-specific change, and run:

```powershell
node --test tests/eventScheduleLayout.test.mjs
npx eslint src/components/sections/EventScheduleSection.tsx src/components/sections/eventScheduleLayout.ts
npx tsc --noEmit
npm run build
```

Expected: seven or more subtests pass and all static/build checks exit with code 0, except any documented pre-existing failure outside the scoped files.

- [ ] **Step 6: Commit verification fixes if any**

If files changed during visual verification:

```powershell
git add src/components/sections/EventScheduleSection.tsx src/components/sections/eventScheduleLayout.ts tests/eventScheduleLayout.test.mjs messages/en.json messages/th.json
git commit -m "fix: refine event schedule responsiveness"
```

If no files changed, do not create an empty commit.
