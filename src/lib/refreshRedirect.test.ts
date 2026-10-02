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

test("ordinary routes still redirect reload to home", () => {
  assert.equal(shouldRedirectReload("/profile"), true);
  assert.equal(shouldRedirectReload("/th/profile"), true);
});

test("ticket and ticket-directed auth reloads stay in the journey", () => {
  for (const path of ["/ticket", "/th/ticket", "/en/ticket/"]) {
    assert.equal(shouldRedirectReload(path), false);
  }
  for (const path of ["/th/login", "/signup/student", "/en/signup/pending"]) {
    assert.equal(shouldRedirectReload(path, "?redirect=%2Fticket"), false);
  }
  assert.equal(shouldRedirectReload("/login"), true);
  assert.equal(shouldRedirectReload("/login", "?redirect=%2Fprofile"), true);
  assert.equal(shouldRedirectReload("/profile"), true);
});
