import assert from "node:assert/strict";
import { test } from "node:test";
import { isAllowedPosterFileUrl } from "./posterFileUrl";

const ok =
  "https://pub-abc123.r2.dev/events/12/presentations/345/0b9c1f2e-1a2b-4c3d-8e9f-0123456789ab.pdf";

test("allows a real-shaped R2 poster url", () => {
  assert.equal(isAllowedPosterFileUrl(ok), true);
});

test("rejects non-https, other hosts and lookalike hosts", () => {
  assert.equal(isAllowedPosterFileUrl(ok.replace("https:", "http:")), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace("pub-abc123.r2.dev", "example.com")), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace("pub-abc123.r2.dev", "evil.com/.r2.dev")), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace("pub-abc123.r2.dev", "r2.dev.evil.com")), false);
  assert.equal(isAllowedPosterFileUrl("not a url"), false);
});

test("rejects bad paths and extensions", () => {
  assert.equal(isAllowedPosterFileUrl(ok.replace("/presentations/345/", "/presentations/../345/")), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace(".pdf", ".png")), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace("/events/12/", "/events/abc/")), false);
});

test("rejects query, hash, credentials and non-default port", () => {
  assert.equal(isAllowedPosterFileUrl(`${ok}?x=1`), false);
  assert.equal(isAllowedPosterFileUrl(`${ok}#frag`), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace("https://", "https://user:pw@")), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace(".r2.dev/", ".r2.dev:8443/")), false);
});

test("rejects percent-encoded and backslash path tricks", () => {
  assert.equal(isAllowedPosterFileUrl(ok.replace("/presentations/", "/%2e%2e/presentations/")), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace("/presentations/", "/%2E%2E/presentations/")), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace("/presentations/", "%2Fpresentations/")), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace("/presentations/", "\\presentations/")), false);
});
