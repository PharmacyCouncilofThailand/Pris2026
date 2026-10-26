import { test, expect } from "@playwright/test";
import { scheduleData } from "../../src/data/scheduleData";
import type { Event } from "../../src/types";

function belongsToVenue(event: Event, venue: string) {
  if (venue === "all") return true;
  const [kind, name] = venue.split(":");
  if (kind === "track") {
    return event.track === name || event.spanTracks?.includes(name);
  }
  if (kind === "innovation") return event.group === name;
  return event.location.trim() === name;
}

for (const locale of ["th", "en"] as const) {
  test(`${locale}: every mobile venue opens the correct sessions on both days`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/agenda`);
    const picker = page.getByLabel(
      locale === "th" ? "เลือกห้อง / พื้นที่" : "Choose room / venue",
    );
    const events = page.locator(
      ".agenda-mobile-results .agenda-timeline-event:visible",
    );

    for (const width of [320, 390, 640, 767]) {
      await page.setViewportSize({ width, height: 844 });
      await expect(picker).toBeVisible();
      expect(
        await picker.evaluate((el) => el.getBoundingClientRect().height),
      ).toBeGreaterThanOrEqual(44);
      for (const [dayIndex, day] of scheduleData.entries()) {
        await page.locator(".agenda-days button").nth(dayIndex).click();
        const choices = await picker
          .locator("option")
          .evaluateAll((options) =>
            options.map((option) => (option as HTMLOptionElement).value),
          );
        for (const room of [
          "JUPITER 4-7",
          "JUPITER 11",
          "JUPITER 12",
          "JUPITER 13",
        ]) {
          expect(choices).toContain(`track:${room}`);
        }
        for (const choice of choices) {
          await picker.selectOption(choice);
          const expected = day.events.filter((event) =>
            belongsToVenue(event, choice),
          );
          await expect(events).toHaveCount(expected.length);
          const labels = await events.evaluateAll((nodes) =>
            nodes.map((node) => node.getAttribute("aria-label") ?? ""),
          );
          for (const event of expected) {
            expect(
              labels.some((label) =>
                label.endsWith(
                  locale === "th" && event.titleTh
                    ? event.titleTh
                    : event.title,
                ),
              ),
            ).toBe(true);
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
          ).toBeLessThanOrEqual(width);
        }
        await picker.selectOption("all");
        await expect(events).toHaveCount(day.events.length);
      }
    }
  });
}

test("room selection survives day changes and resizing without filtering desktop or print", async ({
  page,
}) => {
  await page.goto("/th/agenda");
  await page.setViewportSize({ width: 390, height: 844 });
  const picker = page.getByLabel("เลือกห้อง / พื้นที่");
  await picker.selectOption("track:JUPITER 13");
  await page.locator(".agenda-days button").nth(1).click();
  await expect(picker).toHaveValue("track:JUPITER 13");
  const mobileEvents = page.locator(
    ".agenda-mobile-results .agenda-timeline-event:visible",
  );
  const expected = scheduleData[1].events.filter((event) =>
    belongsToVenue(event, "track:JUPITER 13"),
  );
  await expect(mobileEvents).toHaveCount(expected.length);

  // Includes the combined JUPITER 12–13 session, even when its primary track is 12.
  const combined = expected.find((event) =>
    event.spanTracks?.includes("JUPITER 12"),
  );
  expect(combined).toBeDefined();
  const session = mobileEvents.filter({
    hasText: combined!.titleTh || combined!.title,
  });
  await session.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(session).toBeFocused();

  await page.setViewportSize({ width: 820, height: 900 });
  await expect(picker).toBeHidden();
  const table = page.getByRole("table");
  await expect(table).toBeVisible();
  for (const room of [
    "JUPITER 4-7",
    "JUPITER 11",
    "JUPITER 12",
    "JUPITER 13",
  ]) {
    await expect(
      table.getByRole("columnheader", { name: `ห้อง ${room}`, exact: true }),
    ).toBeVisible();
  }
  await page.locator(".schedule-scroll").evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
  });
  const lastHeader = await table
    .getByRole("columnheader", { name: "ห้อง JUPITER 13", exact: true })
    .boundingBox();
  expect(lastHeader!.x).toBeGreaterThanOrEqual(0);
  expect(lastHeader!.x + lastHeader!.width).toBeLessThanOrEqual(820);

  await page.getByRole("button", { name: "เรียงตามเวลา", exact: true }).click();
  await expect(page.locator(".agenda-timeline-event:visible")).toHaveCount(
    scheduleData[1].events.length,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(picker).toHaveValue("track:JUPITER 13");
  await expect(page.locator(".agenda-timeline-event:visible")).toHaveCount(
    expected.length,
  );

  // Print content is independent of screen day/venue selection.
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".agenda-print-document")).toBeVisible();
  await expect(page.locator(".agenda-schedule")).toBeHidden();
});
