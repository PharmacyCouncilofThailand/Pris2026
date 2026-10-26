import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import AgendaPrintDocument from "../components/sections/AgendaPrintDocument";
import { scheduleData } from "../data/scheduleData";
import th from "../../messages/th.json";
import en from "../../messages/en.json";

function normalizeMarkup(markup: string) {
  return markup
    .replace(/<!--[^]*?-->/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expectedText(value: string) {
  return normalizeMarkup(
    renderToStaticMarkup(React.createElement("span", null, value)),
  );
}

function renderDocument(locale: "th" | "en") {
  const providerProps = {
    locale,
    messages: locale === "th" ? th : en,
    timeZone: "Asia/Bangkok",
    children: React.createElement(AgendaPrintDocument, { locale }),
  };
  const markup = renderToStaticMarkup(
    React.createElement(NextIntlClientProvider, providerProps),
  );
  const matches = [...markup.matchAll(/data-event-id="(\d+)"/g)];
  const events = new Map(
    matches.map((match, index) => [
      Number(match[1]),
      normalizeMarkup(
        markup.slice(match.index, matches[index + 1]?.index ?? markup.length),
      ),
    ]),
  );
  return { ids: matches.map((match) => Number(match[1])), events };
}

for (const locale of ["th", "en"] as const) {
  test(`${locale} print includes every event once, both days in chronological order`, () => {
    const { ids } = renderDocument(locale);
    const sourceIds = scheduleData.flatMap((day) =>
      day.events.map((event) => event.id),
    );

    assert.ok(sourceIds.length > 0);
    assert.equal(ids.length, sourceIds.length);
    assert.equal(new Set(ids).size, sourceIds.length);
    assert.deepEqual(
      [...ids].sort((a, b) => a - b),
      sourceIds.sort((a, b) => a - b),
    );

    let offset = 0;
    for (const day of scheduleData) {
      const dayIds = ids.slice(offset, offset + day.events.length);
      assert.ok(day.events.length > 0);
      assert.equal(dayIds.length, day.events.length);
      const events = new Map(day.events.map((event) => [event.id, event]));
      const starts = dayIds.map((id) => {
        const event = events.get(id);
        assert.ok(event, `${id} belongs to ${day.day}`);
        const [hour, minute] = event.time.split(/[:.]/);
        return Number(hour) * 60 + Number(minute.slice(0, 2));
      });
      assert.deepEqual(
        starts,
        [...starts].sort((a, b) => a - b),
      );
      offset += day.events.length;
    }
  });

  test(`${locale} print retains localized titles and every description paragraph`, () => {
    const { events } = renderDocument(locale);

    for (const day of scheduleData) {
      for (const event of day.events) {
        const text = events.get(event.id);
        assert.ok(text, `event ${event.id} is present`);
        const title =
          locale === "th" ? event.titleTh || event.title : event.title;
        assert.ok(
          text.includes(expectedText(title)),
          `event ${event.id}: title`,
        );

        const description =
          locale === "th"
            ? event.descriptionTh || event.description
            : event.description || event.descriptionTh;
        for (const paragraph of description?.split(/\n\s*\n/) ?? []) {
          // Organizer labels can change language or typography; their content cannot.
          const content = paragraph.replace(
            /^(?:จัดโดย|โดย|Organized by|By)\s+/i,
            "",
          );
          assert.ok(
            text.includes(expectedText(content)),
            `event ${event.id}: complete paragraph ${content.slice(0, 70)}`,
          );
        }
      }
    }
  });

  test(`${locale} print identifies parallel stations and keeps a spanning event singular`, () => {
    const { ids, events } = renderDocument(locale);
    for (const day of scheduleData) {
      for (const event of day.events.filter((event) => event.group)) {
        const station = event.group!.match(/\d+/)![0];
        assert.match(
          events.get(event.id)!,
          new RegExp(`(?:STATION|สถานี)\\s*${station}`),
          `event ${event.id}: station ${station}`,
        );
      }
    }
    assert.equal(ids.filter((id) => id === 231).length, 1);
    assert.ok(events.get(231)!.includes("JUPITER 12–13"));
    assert.ok(events.get(231)!.includes("08:00 – 12:30"));
  });
}

test("English print preserves the Thai-only research details for event 256", () => {
  const { events } = renderDocument("en");
  const text = events.get(256)!;
  for (const id of ["P119", "P178", "P139", "P033", "P162", "O076"]) {
    assert.ok(
      text.includes(`PRIS-2026-${id}`),
      `research ${id} remains available`,
    );
  }
  assert.ok(text.includes("ภญ.จัสมิน บินอะฮ์มัด"));
});
