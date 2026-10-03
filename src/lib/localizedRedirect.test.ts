import assert from "node:assert/strict";
import test from "node:test";
import {
  eventReturnQuery,
  normalizeLocalizedRedirectPath,
} from "./localizedRedirect.js";

test("keeps locale-relative internal redirects unchanged", () => {
  assert.equal(normalizeLocalizedRedirectPath("/registration"), "/registration");
  assert.equal(normalizeLocalizedRedirectPath("/abstract-submission?edit=42"), "/abstract-submission?edit=42");
});

test("strips an existing supported locale before next-intl navigation", () => {
  assert.equal(normalizeLocalizedRedirectPath("/th/registration"), "/registration");
  assert.equal(normalizeLocalizedRedirectPath("/en/registration"), "/registration");
  assert.equal(normalizeLocalizedRedirectPath("/th"), "/");
  assert.equal(normalizeLocalizedRedirectPath("/en?source=login"), "/?source=login");
});

test("falls back to home for unsafe or missing redirects", () => {
  assert.equal(normalizeLocalizedRedirectPath(null), "/");
  assert.equal(normalizeLocalizedRedirectPath(""), "/");
  assert.equal(normalizeLocalizedRedirectPath("https://example.com"), "/");
  assert.equal(normalizeLocalizedRedirectPath("//example.com/path"), "/");
  assert.equal(normalizeLocalizedRedirectPath("/\\evil.test/path"), "/");
});

test("event return query preserves only ticket and bounded Lucky Wheel destinations", () => {
  assert.deepEqual(eventReturnQuery("?redirect=%2Fticket"), { redirect: "/ticket" });
  assert.deepEqual(eventReturnQuery("?redirect=%2Fth%2Flucky-wheel"), { redirect: "/lucky-wheel" });
  assert.deepEqual(eventReturnQuery("?redirect=%2Fen%2Flucky-wheel%2Fclaim"), {
    redirect: "/lucky-wheel/claim",
  });
  assert.deepEqual(eventReturnQuery("?redirect=%2Fen%2Flucky-wheel%2Fhistory"), {
    redirect: "/lucky-wheel/history",
  });
  assert.deepEqual(
    eventReturnQuery("?redirect=%2Flucky-wheel%2Frewards%2F123e4567-e89b-42d3-a456-426614174000"),
    { redirect: "/lucky-wheel/rewards/123e4567-e89b-42d3-a456-426614174000" },
  );

  for (const search of [
    "?redirect=https%3A%2F%2Fevil.test",
    "?redirect=%2F%2Fevil.test%2Fpath",
    "?redirect=%2F%5Cevil.test%2Fpath",
    "?redirect=%2Fprofile",
    "?redirect=%2Flucky-wheel%2Frewards%2Fnot-a-uuid",
    "?redirect=%2Flucky-wheel%3Fnext%3D%2Fprofile",
    "?redirect=%2Flucky-wheel%2Fclaim%23not-a-uuid",
    "?redirect=%2Flucky-wheel%2Fclaim%2F123e4567-e89b-42d3-a456-426614174000",
  ]) {
    assert.equal(eventReturnQuery(search), undefined, search);
  }
});
