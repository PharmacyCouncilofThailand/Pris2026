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

  if (
    event.track &&
    STANDARD_TRACKS.includes(event.track as (typeof STANDARD_TRACKS)[number])
  ) {
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

  for (const event of events) {
    if (event.track !== "Common" || !event.location.trim()) continue;

    const key = `common:${event.location.trim()}`;

    if (!commonByKey.has(key)) {
      commonByKey.set(key, {
        key,
        label: locale === "th" && event.locationTh ? event.locationTh : event.location,
        kind: "common",
      });
    }
  }

  const hasFallback = events.some((event) => resolveVenueKey(event) === "fallback:other");

  return [
    ...roomColumns,
    ...innovationColumns,
    ...commonByKey.values(),
    ...(hasFallback
      ? [
          {
            key: "fallback:other",
            label: locale === "th" ? "สถานที่อื่น" : "Other venue",
            kind: "fallback" as const,
          },
        ]
      : []),
  ];
}

function overlaps(left: ParsedTime, right: ParsedTime) {
  return left.start < right.end && right.start < left.end;
}

export function buildScheduleLayout(events: Event[]): ScheduleLayout {
  const parsed = events.flatMap((event) => {
    const time = parseScheduleTime(event.time);

    return time ? [{ event, time, columnKey: resolveVenueKey(event) }] : [];
  });
  const fallbackEvents = events.filter((event) => !parseScheduleTime(event.time));
  const boundaries = [...new Set(parsed.flatMap(({ time }) => [time.start, time.end]))].sort(
    (left, right) => left - right,
  );
  const pending = [...parsed].sort(
    (left, right) =>
      left.time.start - right.time.start ||
      left.time.end - right.time.end ||
      left.event.id - right.event.id,
  );
  const groups: (typeof pending)[] = [];

  while (pending.length > 0) {
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
    const start = Math.min(...group.map(({ time }) => time.start));
    const end = Math.max(...group.map(({ time }) => time.end));
    const eventsInCell = group
      .sort(
        (left, right) =>
          left.time.start - right.time.start || left.event.id - right.event.id,
      )
      .map(({ event }) => event);

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
  const sortedEvents = [...events].sort((left, right) => {
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

  for (const event of sortedEvents) {
    const start = parseScheduleTime(event.time)?.start ?? null;
    const key = start === null ? `fallback:${event.time}` : `start:${start}`;
    const existing = groups.get(key);

    if (existing) {
      existing.events.push(event);
    } else {
      groups.set(key, {
        timeLabel: start === null ? event.time : formatMinutes(start),
        start,
        events: [event],
      });
    }
  }

  return [...groups.values()];
}
