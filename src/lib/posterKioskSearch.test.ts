import assert from "node:assert/strict";
import { test } from "node:test";
import { searchPosters } from "./posterKioskSearch";
import type { PosterKioskItem } from "@/types/presentations";

const make = (
  trackingId: string,
  title: string,
  extra: Partial<PosterKioskItem> = {},
): PosterKioskItem => ({
  trackingId,
  title,
  submitterName: null,
  affiliation: null,
  categoryName: "RDU",
  presentationType: "poster",
  file: null,
  ...extra,
});

const fixture: PosterKioskItem[] = [
  make("PRIS-2026-P018", "การขับเคลื่อนนโยบาย RDU Coordinator จังหวัดอุดรธานี", {
    submitterName: "ชวกณ วารีบุญมา",
    file: { url: "/p018.png", mimeType: "image/png", version: 1 },
  }),
  make("PRIS-2026-P077", "การประเมินผล RDU Hospital ในเขตสุขภาพที่ 8"),
  make("PRIS-2026-P101", "งานวิจัยเรื่องที่หนึ่ง"),
  make("PRIS-2026-P180", "งานวิจัยเรื่องที่สอง"),
];

test("tracking id variants find the same work", () => {
  for (const q of ["p018", "P-018", "PRIS-2026-P018", " pris 2026 p018 "]) {
    const r = searchPosters(fixture, q);
    assert.equal(r.status, "found", q);
    if (r.status === "found") assert.equal(r.items[0].trackingId, "PRIS-2026-P018");
  }
});

test("exact tracking id ranks first", () => {
  const items = [make("PRIS-2026-P200", "ภาพรวม P018 อื่น"), ...fixture];
  const r = searchPosters(items, "PRIS-2026-P018");
  assert.equal(r.status, "found");
  if (r.status === "found") assert.equal(r.items[0].trackingId, "PRIS-2026-P018");
  const r2 = searchPosters(items, "p018");
  if (r2.status === "found") assert.equal(r2.items[0].trackingId, "PRIS-2026-P018");
});

test("submitter name matches with irregular and invisible whitespace", () => {
  const r = searchPosters(fixture, "ชวกณ  วารีบุญมา\u200B ");
  assert.equal(r.status, "found");
  if (r.status === "found") assert.equal(r.items.length, 1);
});

test("title term matches several works", () => {
  const r = searchPosters(fixture, "RDU");
  assert.equal(r.status, "found");
  if (r.status === "found") assert.equal(r.total, 2);
});

test("queries under two characters are short", () => {
  assert.deepEqual(searchPosters(fixture, "p"), { status: "short" });
  assert.deepEqual(searchPosters(fixture, " "), { status: "short" });
});

test("unlisted queries return none", () => {
  assert.deepEqual(searchPosters(fixture, "PRIS-2026-O078"), { status: "none" });
  assert.deepEqual(searchPosters(fixture, "PRIS-2026-P198"), { status: "none" });
});

test("results cap at twenty with the full total", () => {
  const many = Array.from({ length: 25 }, (_, i) =>
    make(`PRIS-2026-P${String(i + 1).padStart(3, "0")}`, `งาน ${i}`),
  );
  const r = searchPosters(many, "PRIS-2026");
  assert.equal(r.status, "found");
  if (r.status === "found") {
    assert.equal(r.items.length, 20);
    assert.equal(r.total, 25);
  }
});

test("items without files are still returned", () => {
  const r = searchPosters(fixture, "P077");
  assert.equal(r.status, "found");
  if (r.status === "found") assert.equal(r.items[0].file, null);
});
