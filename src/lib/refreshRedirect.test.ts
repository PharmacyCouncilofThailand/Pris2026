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
