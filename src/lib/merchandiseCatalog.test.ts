import test from "node:test";
import assert from "node:assert/strict";
import { filterCatalog, nextCatalogFilter } from "./merchandiseCatalog";
import type { ProductDto } from "../types/merchandise";

const mk = (i: number, o: Partial<ProductDto> = {}): ProductDto => ({
  id: `p${i}`, kind: "single", nameTh: `สินค้า ${i}`, descriptionTh: null,
  sizeChartTh: null, images: [], categoryId: "c1", sortOrder: i, hasOptions: false,
  variants: [], components: [], price: null, purchasable: true, unavailableCodes: [], ...o,
});
const all = [
  mk(0, { nameTh: "แก้ว Mug", categoryId: "c2" }),
  mk(1, { kind: "bundle" }),
  ...Array.from({ length: 11 }, (_, i) => mk(i + 2)),
];

test("search is case-insensitive on name", () => {
  const r = filterCatalog(all, { q: "mug" });
  assert.deepEqual(r.items.map((p) => p.nameTh), ["แก้ว Mug"]);
  assert.equal(r.total, 1);
});
test("kind and category filters", () => {
  assert.deepEqual(filterCatalog(all, { kind: "bundle" }).items.map((p) => p.id), ["p1"]);
  assert.equal(filterCatalog(all, { categoryId: "c2" }).total, 1);
});
test("paging: page 2 of 13 has 1 item; overflow clamps", () => {
  const r = filterCatalog(all, { page: 2 });
  assert.equal(all.length, 13);
  assert.equal(r.items.length, 1);
  assert.equal(r.totalPages, 2);
  const c = filterCatalog(all, { page: 99 });
  assert.equal(c.page, 2);
  assert.equal(c.items.length, 1);
  assert.equal(filterCatalog(all, { page: 0 }).page, 1);
});
test("empty result still has one page", () => {
  const r = filterCatalog(all, { q: "zzz" });
  assert.deepEqual([r.items.length, r.page, r.totalPages, r.total], [0, 1, 1, 0]);
});

test("picking a category clears bundle", () =>
  assert.deepEqual(nextCatalogFilter({ categoryId: null, kind: "bundle" }, { categoryId: "c1" }), { categoryId: "c1", kind: null }));
test("picking bundle clears the category", () =>
  assert.deepEqual(nextCatalogFilter({ categoryId: "c1", kind: null }, "bundle"), { categoryId: null, kind: "bundle" }));
test("pressing the active pill returns to all", () => {
  assert.deepEqual(nextCatalogFilter({ categoryId: "c1", kind: null }, { categoryId: "c1" }), { categoryId: null, kind: null });
  assert.deepEqual(nextCatalogFilter({ categoryId: null, kind: "bundle" }, "bundle"), { categoryId: null, kind: null });
});
test("all clears both", () =>
  assert.deepEqual(nextCatalogFilter({ categoryId: "c1", kind: null }, "all"), { categoryId: null, kind: null }));
