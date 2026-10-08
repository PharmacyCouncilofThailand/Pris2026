import assert from "node:assert/strict";
import test from "node:test";
import {
  extractDistinctCategories,
  filterAcceptedAbstracts,
  type AcceptedAbstract,
} from "../lib/acceptedAbstractsFilter";

test("announcement filters accept API rounds with overlapping row IDs", () => {
  const round1Poster: AcceptedAbstract = {
    id: 1,
    trackingId: "SYNTHETIC-1",
    title: "Round one",
    presentationType: "poster",
    categoryId: 10,
    categoryName: "Clinical",
    submitterName: null,
    affiliation: null,
    round: 1,
  };
  const round2Poster: AcceptedAbstract = {
    ...round1Poster,
    round: 2,
    categoryId: 20,
    categoryName: "Digital",
  };
  const round1Oral: AcceptedAbstract = {
    ...round1Poster,
    id: 2,
    presentationType: "oral",
  };
  assert.deepEqual(
    filterAcceptedAbstracts([round1Poster, round2Poster, round1Oral], {
      search: "",
      presentationType: "poster",
      round: "2",
      categoryId: "all",
    }),
    [round2Poster],
  );
  assert.equal(
    extractDistinctCategories([round1Poster, round2Poster]).length,
    2,
  );
});
