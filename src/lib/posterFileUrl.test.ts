import assert from "node:assert/strict";
import { test } from "node:test";
import { isAllowedPosterDownloadUrl, isAllowedPosterFileUrl } from "./posterFileUrl";

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

test("pinned host accepts only that exact host", () => {
  assert.equal(isAllowedPosterFileUrl(ok, "pub-abc123.r2.dev"), true);
  assert.equal(isAllowedPosterFileUrl(ok.replace("pub-abc123", "pub-other"), "pub-abc123.r2.dev"), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace("pub-abc123", "x.pub-abc123"), "pub-abc123.r2.dev"), false);
  assert.equal(isAllowedPosterFileUrl(ok.replace("https:", "http:"), "pub-abc123.r2.dev"), false);
});

test("unpinned (undefined or empty) keeps any *.r2.dev", () => {
  assert.equal(isAllowedPosterFileUrl(ok, undefined), true);
  assert.equal(isAllowedPosterFileUrl(ok.replace("pub-abc123", "pub-other")), true);
});

test("download variant also accepts png but keeps every other rule", () => {
  const png = ok.replace(".pdf", ".png");
  assert.equal(isAllowedPosterDownloadUrl(png), true);
  assert.equal(isAllowedPosterDownloadUrl(ok), true);
  assert.equal(isAllowedPosterDownloadUrl(ok.replace(".pdf", ".exe")), false);
  assert.equal(isAllowedPosterDownloadUrl(png.replace("pub-abc123.r2.dev", "example.com")), false);
  assert.equal(isAllowedPosterDownloadUrl(`${png}?x=1`), false);
  assert.equal(isAllowedPosterDownloadUrl(png, "pub-other.r2.dev"), false);
});
