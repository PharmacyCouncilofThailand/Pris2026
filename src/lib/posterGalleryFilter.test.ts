import assert from "node:assert/strict";
import { test } from "node:test";
import type { PosterKioskItem } from "@/types/presentations";
import {
  filterGallery,
  galleryCategories,
  galleryCounts,
  galleryPosters,
} from "./posterGalleryFilter";

const file = {
  url: "https://x.r2.dev/a.png",
  mimeType: "image/png" as const,
  version: 1,
};
const make = (
  trackingId: string,
  categoryName: string,
  presentationType: PosterKioskItem["presentationType"],
  withFile = true,
): PosterKioskItem => ({
  trackingId,
  title: trackingId,
  submitterName: null,
  affiliation: null,
  categoryName,
  presentationType,
  file: withFile ? file : null,
});

const roster = [
  make("1", "ก", "poster"),
  make("2", "ก", "highlighted-poster"),
  make("3", "ข", "poster"),
  make("4", "ข", "poster", false),
  make("5", "ค", "highlighted-poster"),
];
const items = galleryPosters(roster);

test("keeps only works that have a file", () => {
  assert.deepEqual(
    items.map((i) => i.trackingId),
    ["1", "2", "3", "5"],
  );
});

test("filters by type and category together", () => {
  assert.deepEqual(
    filterGallery(items, { type: "all", category: "all" }).length,
    4,
  );
  assert.deepEqual(
    filterGallery(items, { type: "poster", category: "all" }).map(
      (i) => i.trackingId,
    ),
    ["1", "3"],
  );
  assert.deepEqual(
    filterGallery(items, { type: "highlighted-poster", category: "ก" }).map(
      (i) => i.trackingId,
    ),
    ["2"],
  );
  assert.deepEqual(filterGallery(items, { type: "poster", category: "ค" }), []);
});

test("type counts follow the category and category counts follow the type", () => {
  const c = galleryCounts(items, { type: "poster", category: "ก" });
  assert.deepEqual(c.types, { all: 2, poster: 1, "highlighted-poster": 1 });
  assert.equal(c.categories.get("ก"), 1);
  assert.equal(c.categories.get("ข"), 1);
  assert.equal(c.categories.get("ค"), undefined);
  assert.equal(c.categoryTotal, 2);
});

test("lists every category once", () => {
  assert.deepEqual(galleryCategories(items), ["ก", "ข", "ค"]);
});
