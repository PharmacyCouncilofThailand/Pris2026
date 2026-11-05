import assert from "node:assert/strict";
import test from "node:test";
import { filterAwards } from "./awards.js";
import type { AwardItem } from "../types/awards.js";
const base: AwardItem = {
  trackingId: "PRIS-2026-O099",
  group: "highlighted-poster",
  categoryName: "การบริหารเภสัชกิจ",
  awardLevel: "excellent",
  title: "PharmaSea Inventory Program",
  submitterName: "ภก. ดำรงศักดิ์ เป๊กทอง",
  file: null,
};
const items: AwardItem[] = [
  base,
  { ...base, trackingId: "PRIS-2026-P126", awardLevel: "outstanding" },
  {
    ...base,
    trackingId: "PRIS-2026-P150",
    group: "student-oral",
    categoryName: "สาขาการบริบาลทางเภสัชกรรม (Pharm. Care)",
  },
];
test("award filters combine official groups/categories/levels with normalized search", () => {
  const all = {
    group: "highlighted-poster" as const,
    category: "all",
    level: "all" as const,
    query: "",
  };
  assert.equal(filterAwards(items, all).length, 2);
  assert.deepEqual(
    filterAwards(items, { ...all, query: " o099 " }).map((r) => r.trackingId),
    ["PRIS-2026-O099"],
  );
  assert.equal(
    filterAwards(items, { ...all, query: "PHARMASEA", level: "outstanding" })
      .length,
    1,
  );
  assert.equal(filterAwards(items, { ...all, query: "ดำรงศักดิ์" }).length, 2);
  assert.equal(filterAwards(items, { ...all, category: "other" }).length, 0);
  assert.equal(
    filterAwards(items, { ...all, group: "student-oral" }).length,
    1,
  );
  assert.equal(filterAwards(items, { ...all, query: "not found" }).length, 0);
  assert.equal(items.length, 3);
});
