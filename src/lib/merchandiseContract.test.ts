import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  StorefrontView,
  StoreHeaderTools,
  formatStoreMoney,
  type StorefrontViewProps,
} from "@conference/merchandise-storefront-view";
import type { StoreDto, ProductDto } from "../types/merchandise";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
const storeMatches: Equal<StoreDto, StorefrontViewProps["store"]> = true;
const productsMatch: Equal<ProductDto[], StorefrontViewProps["products"]> =
  true;
test("the private packed renderer exposes canonical Store/Product types and pure React exports", () => {
  assert.equal(storeMatches, true);
  assert.equal(productsMatch, true);
  assert.equal(typeof StorefrontView, "function");
  assert.equal(typeof StoreHeaderTools, "function");
  assert.equal(
    formatStoreMoney("900719925474099301"),
    "฿ 9,007,199,254,740,993.01",
  );
});
test("the vendored archive and generated type body match the prerequisite evidence exactly", () => {
  const record = JSON.parse(
    readFileSync("docs/verification/merchandise/frontend-start.json", "utf8"),
  );
  const hash = (bytes: Buffer | string) =>
    createHash("sha256").update(bytes).digest("hex");
  assert.equal(
    hash(readFileSync(record.renderer.vendorPath)),
    record.renderer.sha256,
  );
  const copy = readFileSync("src/types/merchandise.ts", "utf8").replace(
    /\r/g,
    "",
  );
  assert.match(copy.split("\n")[0], /Do not format/);
  assert.equal(hash(copy.slice(copy.indexOf("\n") + 1)), record.typesSha256);
});
