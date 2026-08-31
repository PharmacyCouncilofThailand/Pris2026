import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLocalizedRedirectPath } from "./localizedRedirect.js";

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
});
