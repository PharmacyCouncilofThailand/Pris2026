import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import AgendaSchedule from "../components/sections/AgendaSchedule";
import EventScheduleSection from "../components/sections/EventScheduleSection";
import AgendaPage from "../app/[locale]/agenda/page";
import th from "../../messages/th.json";
import en from "../../messages/en.json";

test("homepage and agenda render the same complete schedule in both languages", () => {
  for (const [locale, messages] of [
    ["th", th],
    ["en", en],
  ] as const) {
    const render = (component: React.ComponentType) => {
      const providerProps = {
        locale,
        messages,
        timeZone: "Asia/Bangkok",
        now: new Date("2026-10-09T00:00:00Z"),
        children: React.createElement(component),
      };
      return renderToStaticMarkup(
        React.createElement(NextIntlClientProvider, providerProps),
      );
    };
    const shared = render(AgendaSchedule);
    const home = render(EventScheduleSection);
    const agenda = render(AgendaPage);
    assert.ok(home.includes(shared));
    assert.ok(agenda.includes(shared));
    assert.equal((home.match(/<main\b/g) ?? []).length, 0);
    assert.equal((agenda.match(/<main\b/g) ?? []).length, 1);
    assert.ok(home.includes('role="table"'));
    assert.ok(
      home.includes("17:00"),
      "homepage includes sessions beyond the old six-card preview",
    );
    assert.ok(home.includes(messages.schedule.venueGroupInnovation));
  }
});
