import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import {
  buildScheduleLayout,
  buildVenueColumns,
  formatVenueGroupLabel,
  groupEventsForMobile,
  parseScheduleTime,
  resolveVenueKey,
  resolveVenueKeys,
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

function loadScheduleData() {
  const source = readFileSync(
    new URL("../src/data/scheduleData.ts", import.meta.url),
    "utf8",
  );
  const executable = source
    .replace(/^import\s+.+?;\s*$/m, "")
    .replace(
      "export const scheduleData: ScheduleDay[] =",
      "scheduleData =",
    );
  const context = vm.createContext({ scheduleData: undefined });

  vm.runInContext(executable, context);
  return context.scheduleData;
}

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
  assert.equal(resolveVenueKey(event({ track: undefined, location: "" })), "fallback:other");
});

test("buildVenueColumns keeps rooms, Innovation groups, and localized Common locations", () => {
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

test("groupEventsForMobile groups matching starts and keeps unparseable times last", () => {
  const groups = groupEventsForMobile([
    event({ id: 3, time: "TBA" }),
    event({ id: 2, time: "10:00 – 11:00", track: "JUPITER 11" }),
    event({ id: 1, time: "09:00 – 10:00" }),
    event({ id: 4, time: "09:00 – 09:30", track: "JUPITER 12" }),
  ]);

  assert.deepEqual(groups.map((group) => group.timeLabel), ["09:00", "10:00", "TBA"]);
  assert.deepEqual(groups.flatMap((group) => group.events.map((item) => item.id)), [4, 1, 2, 3]);
});

test("every source event is represented once by desktop and mobile layouts", () => {
  for (const day of loadScheduleData()) {
    const desktop = buildScheduleLayout(day.events);
    const desktopIds = [
      ...desktop.cells.flatMap((cell) => cell.events.map((item) => item.id)),
      ...desktop.fallbackEvents.map((item) => item.id),
    ];
    const mobileIds = groupEventsForMobile(day.events).flatMap((group) =>
      group.events.map((item) => item.id),
    );
    const sourceIds = Array.from(day.events, (item) => item.id);
    const numericSort = (left, right) => left - right;

    assert.deepEqual(desktopIds.toSorted(numericSort), sourceIds.toSorted(numericSort));
    assert.deepEqual(mobileIds.toSorted(numericSort), sourceIds.toSorted(numericSort));
    assert.equal(new Set(desktopIds).size, sourceIds.length);
    assert.equal(new Set(mobileIds).size, sourceIds.length);
  }
});

test("formatVenueGroupLabel displays Innovation Zone groups as stations", () => {
  assert.equal(formatVenueGroupLabel("GROUP 1"), "STATION 1");
  assert.equal(formatVenueGroupLabel("GROUP 4"), "STATION 4");
});

test("resolveVenueKeys preserves a single event across consecutive room columns", () => {
  const spanningEvent = event({
    track: "JUPITER 12",
    spanTracks: ["JUPITER 12", "JUPITER 13"],
  });

  assert.deepEqual(resolveVenueKeys(spanningEvent), [
    "track:JUPITER 12",
    "track:JUPITER 13",
  ]);
  assert.equal(resolveVenueKey(spanningEvent), "track:JUPITER 12");
});

test("Day 1 follows the authoritative workbook venue mapping and required details", () => {
  const day1 = loadScheduleData()[0];
  const byId = new Map(day1.events.map((item) => [item.id, item]));

  assert.equal(day1.events.length, 35);
  assert.deepEqual(
    [1002, 1010, 1011].map((id) => byId.get(id)?.track),
    ["JUPITER 12", "JUPITER 12", "JUPITER 13"],
  );
  assert.deepEqual(Array.from(byId.get(1002)?.spanTracks ?? []), [
    "JUPITER 12",
    "JUPITER 13",
  ]);
  assert.deepEqual(Array.from(byId.get(1006)?.spanTracks ?? []), [
    "JUPITER 4-7",
    "JUPITER 11",
  ]);
  assert.match(byId.get(1010)?.descriptionTh ?? "", /วิทยาลัยคุ้มครองผู้บริโภค/);
  assert.match(byId.get(1011)?.descriptionTh ?? "", /วิทยาลัยเภสัชกรรมสมุนไพร/);
  assert.match(byId.get(1018)?.descriptionTh ?? "", /Committee:/);
  assert.match(byId.get(1022)?.descriptionTh ?? "", /Committee:/);
  assert.equal(byId.get(1027)?.descriptionTh, "คัดเลือก 6 ผลงาน");
  assert.equal(byId.get(1033)?.descriptionTh, "คัดเลือก 6 ผลงาน");
  assert.equal(byId.get(1034)?.descriptionTh, "คัดเลือก 6 ผลงาน");
  assert.equal(byId.get(1035)?.descriptionTh, "คัดเลือก 6 ผลงาน");
});

test("Day 2 follows the authoritative workbook schedule", () => {
  const day2 = loadScheduleData()[1];
  const byId = new Map(day2.events.map((item) => [item.id, item]));

  assert.equal(day2.events.length, 31);
  assert.equal(byId.get(231)?.track, "JUPITER 12");
  assert.deepEqual(Array.from(byId.get(231)?.spanTracks ?? []), [
    "JUPITER 12",
    "JUPITER 13",
  ]);
  assert.equal(byId.get(241), undefined);
  assert.deepEqual(
    [224, 225, 242, 243, 212].map((id) => byId.get(id)?.time),
    [
      "13:00 – 14:00",
      "14:00 – 15:30",
      "13:00 – 14:00",
      "14:00 – 15:30",
      "16:00 – 16:30",
    ],
  );
  assert.match(byId.get(221)?.descriptionTh ?? "", /TED FUND/);
  assert.match(byId.get(224)?.descriptionTh ?? "", /เภสัชพันธุศาสตร์และเภสัชกรรมแม่นยำ/);
  assert.match(byId.get(225)?.descriptionTh ?? "", /วิทยาลัยคุ้มครองผู้บริโภค/);
  assert.match(byId.get(242)?.descriptionTh ?? "", /บรรณาธิการสมาคมเภสัชกรรมโรงพยาบาล/);
  assert.match(byId.get(233)?.descriptionTh ?? "", /วิทยาลัยเภสัชกรรมสมุนไพร/);
  assert.equal(byId.get(257)?.group, "GROUP 3");
  assert.equal(byId.get(251)?.time, "11:00 – 12:00");
  assert.equal(byId.get(226)?.descriptionTh, "คัดเลือก 6 ผลงาน");
  assert.equal(byId.get(234)?.descriptionTh, "คัดเลือก 6 ผลงาน");
  assert.equal(byId.get(244)?.descriptionTh, "คัดเลือก 6 ผลงาน");
  assert.equal(byId.get(251)?.descriptionTh, "คัดเลือก 6 ผลงาน");
  assert.equal(byId.get(253)?.descriptionTh, "คัดเลือก 6 ผลงาน");
  assert.equal(byId.get(257)?.descriptionTh, "คัดเลือก 6 ผลงาน");
});
