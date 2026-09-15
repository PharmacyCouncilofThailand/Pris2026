import assert from "node:assert/strict";
import test from "node:test";
import {
  filterAcceptedAbstracts,
  extractDistinctCategories,
  type AcceptedAbstract,
} from "./acceptedAbstractsFilter.js";

const sampleAbstracts: AcceptedAbstract[] = [
  {
    id: 1,
    trackingId: "ABS-PRIS-2026-001",
    title: "Clinical Impact of Medication Reconciliation",
    presentationType: "oral",
    categoryId: 10,
    categoryName: "Clinical Pharmacy",
    submitterName: "Dr. Somchai Jaidee",
    affiliation: "Faculty of Pharmacy, Chulalongkorn University",
    round: 1,
  },
  {
    id: 2,
    trackingId: "ABS-PRIS-2026-002",
    title: "AI-Driven Drug Discovery and Machine Learning",
    presentationType: "poster",
    categoryId: 20,
    categoryName: "Digital Health",
    submitterName: "Jane Smith",
    affiliation: "Mahidol University",
    round: 1,
  },
  {
    id: 3,
    trackingId: null,
    title: "Telepharmacy Services in Rural Communities",
    presentationType: "poster",
    categoryId: 10,
    categoryName: "Clinical Pharmacy",
    submitterName: null,
    affiliation: "Khon Kaen Hospital",
    round: 2,
  },
  {
    id: 4,
    trackingId: "ABS-PRIS-2026-004",
    title: "Herbal Drug Interactions and Safety Warnings",
    presentationType: "oral",
    categoryId: 30,
    categoryName: "Pharmacology & Toxicology",
    submitterName: "Anan Sukjai",
    affiliation: null,
    round: 2,
  },
];

test("filterAcceptedAbstracts: returns all items when options are default/empty", () => {
  const result = filterAcceptedAbstracts(sampleAbstracts);
  assert.equal(result.length, 4);
  assert.deepEqual(
    result.map((a) => a.id),
    [1, 2, 3, 4],
  );
});

test("filterAcceptedAbstracts: filters case-insensitively across search targets", () => {
  // 1. Match trackingId
  const byTracking = filterAcceptedAbstracts(sampleAbstracts, { search: "2026-001" });
  assert.equal(byTracking.length, 1);
  assert.equal(byTracking[0].id, 1);

  // 2. Match title (with mixed case and whitespace)
  const byTitle = filterAcceptedAbstracts(sampleAbstracts, { search: "   DRUG DISCOVERY  " });
  assert.equal(byTitle.length, 1);
  assert.equal(byTitle[0].id, 2);

  // 3. Match submitterName
  const bySubmitter = filterAcceptedAbstracts(sampleAbstracts, { search: "somchai" });
  assert.equal(bySubmitter.length, 1);
  assert.equal(bySubmitter[0].id, 1);

  // 4. Match affiliation
  const byAffiliation = filterAcceptedAbstracts(sampleAbstracts, { search: "khon kaen" });
  assert.equal(byAffiliation.length, 1);
  assert.equal(byAffiliation[0].id, 3);

  // 5. Match categoryName
  const byCategoryName = filterAcceptedAbstracts(sampleAbstracts, { search: "toxicology" });
  assert.equal(byCategoryName.length, 1);
  assert.equal(byCategoryName[0].id, 4);
});

test("filterAcceptedAbstracts: filters by presentationType", () => {
  const oralOnly = filterAcceptedAbstracts(sampleAbstracts, { presentationType: "oral" });
  assert.equal(oralOnly.length, 2);
  assert.deepEqual(
    oralOnly.map((a) => a.id),
    [1, 4],
  );

  const posterOnly = filterAcceptedAbstracts(sampleAbstracts, { presentationType: "poster" });
  assert.equal(posterOnly.length, 2);
  assert.deepEqual(
    posterOnly.map((a) => a.id),
    [2, 3],
  );

  const all = filterAcceptedAbstracts(sampleAbstracts, { presentationType: "all" });
  assert.equal(all.length, 4);
});

test("filterAcceptedAbstracts: filters Highlighted Poster independently", () => {
  const highlightedPoster = filterAcceptedAbstracts(
    [
      { ...sampleAbstracts[0], id: 5, presentationType: "highlighted-poster" },
      ...sampleAbstracts,
    ],
    { presentationType: "highlighted-poster", round: 1 },
  );

  assert.deepEqual(
    highlightedPoster.map((abstract) => abstract.id),
    [5],
  );
});

test("filterAcceptedAbstracts: filters by categoryId", () => {
  const cat10 = filterAcceptedAbstracts(sampleAbstracts, { categoryId: 10 });
  assert.equal(cat10.length, 2);
  assert.deepEqual(
    cat10.map((a) => a.id),
    [1, 3],
  );

  const catAll = filterAcceptedAbstracts(sampleAbstracts, { categoryId: "all" });
  assert.equal(catAll.length, 4);
});

test("filterAcceptedAbstracts: combines search, presentationType, and categoryId with AND", () => {
  // Category 10 (id 1 and 3) + oral (id 1) + search "reconciliation"
  const combined = filterAcceptedAbstracts(sampleAbstracts, {
    search: "reconciliation",
    presentationType: "oral",
    categoryId: 10,
  });
  assert.equal(combined.length, 1);
  assert.equal(combined[0].id, 1);

  // Category 10 + oral + mismatching search
  const mismatch = filterAcceptedAbstracts(sampleAbstracts, {
    search: "nonexistent",
    presentationType: "oral",
    categoryId: 10,
  });
  assert.equal(mismatch.length, 0);
});

test("filterAcceptedAbstracts: filters by round", () => {
  const round1Only = filterAcceptedAbstracts(sampleAbstracts, { round: 1 });
  assert.equal(round1Only.length, 2);
  assert.deepEqual(
    round1Only.map((a) => a.id),
    [1, 2],
  );

  const round2Only = filterAcceptedAbstracts(sampleAbstracts, { round: 2 });
  assert.equal(round2Only.length, 2);
  assert.deepEqual(
    round2Only.map((a) => a.id),
    [3, 4],
  );

  const roundAll = filterAcceptedAbstracts(sampleAbstracts, { round: "all" });
  assert.equal(roundAll.length, 4);
});

test("filterAcceptedAbstracts: matches round keyword in search query", () => {
  const matchedRound1 = filterAcceptedAbstracts(sampleAbstracts, { search: "round 1" });
  assert.equal(matchedRound1.length, 2);
  assert.deepEqual(
    matchedRound1.map((a) => a.id),
    [1, 2],
  );
});

test("filterAcceptedAbstracts: treats missing or undefined round as round 1 defensively", () => {
  const itemWithoutRound: AcceptedAbstract = {
    id: 99,
    trackingId: "ABS-PRIS-2026-099",
    title: "Legacy Submission without Round Field",
    presentationType: "oral",
    categoryId: 10,
    categoryName: "Clinical Pharmacy",
    submitterName: "Test User",
    affiliation: "Hospital",
  };

  const round1Result = filterAcceptedAbstracts([itemWithoutRound], { round: 1 });
  assert.equal(round1Result.length, 1);
  assert.equal(round1Result[0].id, 99);

  const round2Result = filterAcceptedAbstracts([itemWithoutRound], { round: 2 });
  assert.equal(round2Result.length, 0);
});

test("extractDistinctCategories: extracts unique categories sorted ascending by category ID", () => {
  const categories = extractDistinctCategories(sampleAbstracts);
  assert.equal(categories.length, 3);
  assert.deepEqual(categories, [
    { id: 10, name: "Clinical Pharmacy" },
    { id: 20, name: "Digital Health" },
    { id: 30, name: "Pharmacology & Toxicology" },
  ]);
});
