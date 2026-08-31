import assert from "node:assert/strict";
import test from "node:test";
import { abstractTimeline, submissionGuidelines } from "./abstractData.js";

test("publishes Round 1 and Round 2 submission and result dates", () => {
  assert.ok(abstractTimeline.some((item) => item.label === "Abstract Submission — Round 1"));
  assert.ok(abstractTimeline.some((item) => item.label === "Round 1 Result Announcement"));
  assert.ok(abstractTimeline.some((item) => item.label === "Abstract Submission — Round 2"));
  assert.ok(abstractTimeline.some((item) => item.label === "Round 2 Result Announcement"));
  assert.ok(abstractTimeline.some((item) => item.date.includes("10 September 2026")));
  assert.ok(abstractTimeline.some((item) => item.date.includes("20 September 2026")));
  assert.ok(abstractTimeline.some((item) => item.date.includes("30 September 2026")));
  assert.ok(submissionGuidelines.importantDates.some((item) => item.label === "Round 2 Result Announcement" && item.value === "30 September 2026"));
});

test("Early Bird copy uses account plus abstract cutoff and fixed payment deadline", () => {
  assert.doesNotMatch(submissionGuidelines.presenterRegistrationNote, /approved/i);
  assert.match(submissionGuidelines.importantDatesReservationNote, /created their PRIS 2026 account/i);
  assert.match(submissionGuidelines.importantDatesReservationNote, /submitted at least one PRIS 2026 abstract/i);
  assert.match(submissionGuidelines.presenterRegistrationNote, /1,250/);
  assert.match(submissionGuidelines.presenterRegistrationNote, /15 September 2026/);
  assert.match(submissionGuidelines.presenterRegistrationNote, /first PRIS 2026 abstract is submitted on or after 1 September 2026/i);
  assert.match(submissionGuidelines.presenterRegistrationNote, /Regular rate/i);
});

test("abstract policy no longer publishes obsolete June deadlines", () => {
  const policy = JSON.stringify(submissionGuidelines.policies);
  assert.doesNotMatch(policy, /30th June|30 June|30 มิถุนายน/i);
  assert.match(submissionGuidelines.policies.withdrawal, /pr@pharmacycouncil\.org/);
});
