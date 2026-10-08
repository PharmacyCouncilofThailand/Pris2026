import assert from "node:assert/strict";
import test from "node:test";
import { scheduleData } from "../data/scheduleData";
import {
  buildScheduleLayout,
  resolveVenueKeys,
} from "../components/sections/eventScheduleLayout";
import {
  formatAgendaTime,
  formatAgendaTitle,
  getAgendaDescription,
  groupAgendaSpeakers,
} from "./agendaPresentation";

test("Day1 Jupiter 4-7 corrections preserve the shared agenda layout", () => {
  const events = scheduleData[0].events;
  const eventById = (id: number) => events.find((event) => event.id === id)!;
  for (const id of [1001, 1009, 1014, 1030]) {
    assert.equal(
      getAgendaDescription(eventById(id).descriptionTh).organizer,
      "สภาเภสัชกรรม",
    );
  }
  assert.equal(eventById(1003).speakers[0].nameTh, "ศ.ดร.ภก.ชลภัทร สุขเกษม");
  const exhibition = eventById(1006);
  assert.deepEqual(resolveVenueKeys(exhibition), ["track:JUPITER 4-7"]);
  assert.equal(exhibition.locationTh, "ห้อง JUPITER 4-7");
  const cell = buildScheduleLayout(events).cells.find((cell) =>
    cell.events.some((event) => event.id === 1006),
  )!;
  assert.deepEqual(cell.columnKeys, ["track:JUPITER 4-7"]);
  assert.equal(
    eventById(1031).speakers[0].nameTh,
    "ภก.ภัทรพงศ์ ภาพภักดี (รองประธานเจ้าหน้าที่บริหาร สายงานการจัดการทั่วไป โรงพยาบาลบำรุงราษฎร์)",
  );
});

test("Day1 Jupiter 11-13 corrections retain organizers and separate moderator roles", () => {
  const eventById = (id: number) =>
    scheduleData[0].events.find((event) => event.id === id)!;
  const workshop = eventById(1008);
  assert.deepEqual(getAgendaDescription(workshop.descriptionTh), {
    organizer: "สภาเภสัชกรรม",
    description: undefined,
  });
  assert.deepEqual(
    workshop.speakers.map((person) => person.nameTh),
    [
      "ผศ.ดร.จิตรสุดา ลิมเกรียงไกร (คณะสังคมศาสตร์และมนุษยศาสตร์ มหาวิทยาลัยมหิดล)",
      "ดร.ปุณญาดา ไชยราช (คณะมนุษยศาสตร์และสังคมศาสตร์ มหาวิทยาลัยทักษิณ)",
      "Nia Academy (สำนักงานนวัตกรรมแห่งชาติ)",
    ],
  );
  assert.equal(
    getAgendaDescription(eventById(1010).descriptionTh).organizer,
    "วิทยาลัยคุ้มครองผู้บริโภค และ ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
  );
  assert.equal(
    getAgendaDescription(eventById(1016).descriptionTh).organizer,
    "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
  );
  const panel = groupAgendaSpeakers(eventById(1017).speakers);
  assert.equal(panel.speakers.length, 7);
  assert.equal(panel.moderators.length, 2);
  assert.equal(
    panel.moderators[1].nameTh,
    "ภก.พงษ์ศิวะ ภู่นอก (ผู้ช่วยเลขาธิการ สภาเภสัชกรรม)",
  );
});

test("presentation fields start a new line on both days without changing other titles", () => {
  assert.equal(formatAgendaTitle("Coffee Break"), "Coffee Break");
  assert.equal(
    formatAgendaTitle("สาขาเภสัชกรรมสมุนไพร"),
    "สาขาเภสัชกรรมสมุนไพร",
  );
  for (const day of scheduleData) {
    const presentations = day.events.filter((event) =>
      event.type.includes("Presentation"),
    );
    assert.ok(presentations.length > 0);
    for (const event of presentations) {
      const formatted = formatAgendaTitle(event.titleTh);
      assert.ok(formatted.includes("\nสาขา"), event.titleTh);
      assert.equal(formatted.replace("\n", " "), event.titleTh);
      assert.equal(formatAgendaTitle(formatted), formatted);
    }
  }
});

test("Thai times have one suffix while English and raw schedule times remain intact", () => {
  assert.equal(formatAgendaTime("09:00 – 10:00", "th"), "09:00 – 10:00 น.");
  assert.equal(formatAgendaTime("09:00 น.", "th"), "09:00 น.");
  assert.equal(formatAgendaTime("09:00 – 10:00", "en"), "09:00 – 10:00");
  for (const day of scheduleData) {
    for (const event of day.events) {
      assert.ok(!event.time.includes("น."));
      assert.ok(formatAgendaTime(event.time, "th").endsWith(" น."));
    }
  }
});

test("organizer extraction preserves workshop details and unrelated descriptions", () => {
  assert.deepEqual(getAgendaDescription("จัดโดย สภาเภสัชกรรม\nโดย ทีมงาน"), {
    organizer: "สภาเภสัชกรรม",
    description: "โดย ทีมงาน",
  });
  assert.deepEqual(
    getAgendaDescription(
      "Organized by the Pharmacy Council, conducted by the team",
    ),
    {
      organizer: "the Pharmacy Council",
      description: "conducted by the team",
    },
  );
  assert.deepEqual(getAgendaDescription("โดย TED FUND"), {
    organizer: "TED FUND",
    description: undefined,
  });
  assert.deepEqual(
    getAgendaDescription("Committee: College of Herbal Pharmacy"),
    {
      organizer: undefined,
      description: "Committee: College of Herbal Pharmacy",
    },
  );
  assert.deepEqual(getAgendaDescription(undefined), {
    organizer: undefined,
    description: undefined,
  });
});

test("speakers, moderators and chairs are separate and preserve every person", () => {
  const people = [
    { name: "Moderator first", role: "Moderator" },
    { name: "Speaker" },
    { name: "Chair", role: "Chair" },
    { name: "Thai moderator", roleTh: "ผู้ดำเนินรายการ" },
  ];
  assert.deepEqual(groupAgendaSpeakers(people), {
    speakers: [people[1]],
    moderators: [people[0], people[3]],
    chairs: [people[2]],
  });
  for (const day of scheduleData) {
    for (const event of day.events) {
      const groups = groupAgendaSpeakers(event.speakers);
      assert.equal(
        groups.speakers.length +
          groups.moderators.length +
          groups.chairs.length,
        event.speakers.length,
      );
    }
  }
});

test("Day2 titles omit หัวข้อ and Health Hack organizer occupies its own line", () => {
  const day2 = scheduleData[1];
  assert.ok(day2.events.every((event) => !event.titleTh.includes("หัวข้อ")));
  const healthHack = day2.events.find((event) => event.id === 231)!;
  assert.equal(healthHack.titleTh, "PSAT Health Hack 2026");
  assert.equal(
    getAgendaDescription(healthHack.descriptionTh).organizer,
    "สภาเภสัชกรรม และ สมาพันธ์นิสิตนักศึกษาเภสัชศาสตร์แห่งประเทศไทย (สนภท.)",
  );
  for (const day of scheduleData) {
    assert.ok(day.events.every((event) => !/จัดโดย| โดย /.test(event.titleTh)));
  }
});

test("Day2 revisions align times, remove TED FUND and preserve speaker roles", () => {
  const events = scheduleData[1].events;
  const eventById = (id: number) => events.find((event) => event.id === id)!;
  assert.equal(eventById(202).time, "11:00 – 11:10");
  assert.equal(eventById(202).speakers[0].nameTh, "ศ.ดร.ภก.ชลภัทร สุขเกษม");
  assert.equal(eventById(203).time, "09:00 – 09:50");
  assert.equal(eventById(206).time, "11:10 – 12:00");
  assert.ok(
    eventById(206).speakers[0].nameTh?.includes(
      "รองนายกรัฐมนตรี\nรัฐมนตรีว่าการ",
    ),
  );
  assert.ok(
    !events.some(
      (event) => event.id === 221 || event.description?.includes("TED FUND"),
    ),
  );
  assert.equal(eventById(224).speakers[0].nameTh, "ศ.ดร.ภก.ชลภัทร สุขเกษม");
  const digital = groupAgendaSpeakers(eventById(209).speakers);
  assert.equal(
    digital.moderators[0].nameTh,
    "ภก.อภินันท์ วัชราภิชาต (ผู้ช่วยเลขาธิการสภาเภสัชกรรม)",
  );
  assert.equal(
    digital.speakers[0].nameTh,
    "ดร.ภก.สามารถ จำรัส (คณะเภสัชศาสตร์ มหาวิทยาลัยศิลปากร)",
  );
  const layout = buildScheduleLayout(events);
  assert.ok(
    layout.cells.some(
      (cell) =>
        cell.events.some((event) => event.id === 202) &&
        cell.start === 660 &&
        cell.end === 670,
    ),
  );
  assert.ok(
    layout.cells.some(
      (cell) =>
        cell.events.some((event) => event.id === 206) &&
        cell.start === 670 &&
        cell.end === 720,
    ),
  );
});
