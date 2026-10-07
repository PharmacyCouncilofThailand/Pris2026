import assert from "node:assert/strict";
import test from "node:test";
import { shouldRedirectReload } from "./refreshRedirect.js";

test("reload redirect exemption keeps home and invitation confirmation routes", () => {
  for (const pathname of [
    "/",
    "/th",
    "/en/",
    "/sessions/confirm",
    "/sessions/confirm/",
    "/th/sessions/confirm",
    "/en/sessions/confirm/",
  ]) {
    assert.equal(shouldRedirectReload(pathname), false, pathname);
  }
});

test("poster reloads and auth-return reloads preserve the work and request context", () => {
  const search = "?abstractId=501&requestId=123e4567-e89b-42d3-a456-426614174000";
  for (const path of ["/presentation-submission", "/th/presentation-submission", "/en/presentation-submission/"]) {
    assert.equal(shouldRedirectReload(path, "?abstractId=501"), false, path);
    assert.equal(shouldRedirectReload(path, search), false, path);
    assert.equal(shouldRedirectReload(path, "?abstractId=0"), true, path);
    assert.equal(shouldRedirectReload(path, "?abstractId=501&email=owner@example.com"), true, path);
  }
  const returnQuery = `?redirect=${encodeURIComponent(`/th/presentation-submission${search}`)}`;
  for (const path of ["/th/login", "/en/signup", "/signup/student", "/signup/pending"]) {
    assert.equal(shouldRedirectReload(path, returnQuery), false, path);
    assert.equal(shouldRedirectReload(path, "?redirect=%2Fpresentation-submission%3FabstractId%3D0"), true, path);
  }
});

test("ordinary routes still redirect reload to home", () => {
  assert.equal(shouldRedirectReload("/profile"), true);
  assert.equal(shouldRedirectReload("/th/profile"), true);
});

test("ticket and Lucky Wheel auth-return reloads stay in their journeys", () => {
  for (const path of [
    "/ticket",
    "/th/ticket",
    "/en/ticket/",
    "/lucky-wheel",
    "/th/lucky-wheel",
    "/en/lucky-wheel/history",
    "/th/lucky-wheel/claim",
    "/th/lucky-wheel/rewards/123e4567-e89b-42d3-a456-426614174000",
  ]) {
    assert.equal(shouldRedirectReload(path), false, path);
  }
  for (const path of ["/th/login", "/signup/student", "/en/signup/pending"]) {
    assert.equal(shouldRedirectReload(path, "?redirect=%2Fticket"), false);
    assert.equal(shouldRedirectReload(path, "?redirect=%2Flucky-wheel"), false);
    assert.equal(shouldRedirectReload(path, "?redirect=%2Flucky-wheel%2Fclaim"), false);
  }
  assert.equal(shouldRedirectReload("/en/login", "?redirect=%2Flucky-wheel"), false);
  assert.equal(shouldRedirectReload("/login"), true);
  assert.equal(shouldRedirectReload("/login", "?redirect=%2Fprofile"), true);
  assert.equal(shouldRedirectReload("/profile"), true);
  assert.equal(shouldRedirectReload("/th/profile"), true);
  assert.equal(shouldRedirectReload("/en/sessions/confirm"), false);
});
