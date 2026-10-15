import test from "node:test";
import assert from "node:assert/strict";
import {
  isMerchandisePath,
  merchandiseReturnPath,
  merchandiseLoginPath,
  merchandiseSsoReturnPath,
} from "./merchandiseRoutes";
import {
  eventReturnQuery,
  normalizeLocalizedRedirectPath,
} from "./localizedRedirect";
import { shouldRedirectReload } from "./refreshRedirect";
const id = "10000000-0000-4000-8000-000000000001";
test("shop route allowlist includes only actual locale-relative routes", () => {
  for (const path of [
    "/souvenirs",
    "/souvenirs/cart",
    "/souvenirs/checkout",
    "/souvenirs/orders",
    `/souvenirs/products/${id}`,
    `/souvenirs/orders/${id}`,
  ])
    for (const locale of ["", "/th", "/en"]) {
      assert.equal(isMerchandisePath(locale + path), true);
      assert.equal(shouldRedirectReload(locale + path), false);
    }
  for (const path of [
    "/souvenirs-malicious",
    "//evil.test/souvenirs",
    "https://evil.test/souvenirs",
    "/souvenirs/orders/no-id",
    "/souvenirs/products",
    "/souvenirs/../profile",
    "/souvenirs?q=abc",
  ])
    assert.equal(isMerchandisePath(path), false, path);
});
test("catalog return keeps validated filters and locale intent across auth and reload", () => {
  const path = `/souvenirs?${new URLSearchParams({ q: "แก้ว Mug", categoryId: id, kind: "bundle", page: "2", intentId: id })}`;
  assert.equal(merchandiseReturnPath("/th" + path), path);
  assert.equal(normalizeLocalizedRedirectPath("/en" + path), path);
  const query = "?redirect=" + encodeURIComponent("/th" + path);
  assert.deepEqual(eventReturnQuery(query), { redirect: path });
  assert.equal(
    merchandiseLoginPath(path),
    "/login?redirect=" + encodeURIComponent(path),
  );
  for (const p of [
    "/th/login",
    "/en/signup",
    "/signup/healthcare",
    "/signup/pending",
  ])
    assert.equal(shouldRedirectReload(p, query), false, p);
  assert.equal(
    shouldRedirectReload("/th/souvenirs", path.slice(path.indexOf("?"))),
    false,
  );
});
test("shop queries and aliases fail closed without loosening other return paths", () => {
  for (const path of [
    "/souvenirs?email=private@example.test",
    "/souvenirs?q=a&q=b",
    "/souvenirs?page=0",
    "/souvenirs?page=1.5",
    "/souvenirs?kind=unknown",
    "/souvenirs?categoryId=bad",
    `/souvenirs/cart?intentId=${id}`,
    "/souvenirs#payload",
    "/souvenirs?q=%00",
    "/souvenirs?q=%zz",
    "/x/../souvenirs",
    "/x/%2e%2e/souvenirs",
    "/souvenirs//",
    "/souvenirs/%2e",
    "/souvenirs-malicious",
    "/souvenirs\\evil",
    "/souvenirs?token=secret",
    "/%73ouvenirs?email=private@example.test",
    "/souvenirs\n",
  ]) {
    assert.equal(merchandiseReturnPath(path), null, path);
    assert.equal(normalizeLocalizedRedirectPath("/th" + path), "/", path);
    assert.equal(
      eventReturnQuery("?redirect=" + encodeURIComponent(path)),
      undefined,
      path,
    );
  }
  assert.equal(shouldRedirectReload("/souvenirs", "?token=secret"), true);
  assert.equal(
    normalizeLocalizedRedirectPath("/registration"),
    "/registration",
  );
  assert.deepEqual(eventReturnQuery("?redirect=%2Fticket"), {
    redirect: "/ticket",
  });
  assert.equal(shouldRedirectReload("/profile"), true);
  assert.equal(
    eventReturnQuery("?redirect=%2Fsouvenirs&redirect=%2Fprofile"),
    undefined,
  );
});
test("SSO adds the current locale only for validated merchandise journeys", () => {
  assert.equal(
    merchandiseSsoReturnPath("/en/souvenirs?q=Mug", "th"),
    "/th/souvenirs?q=Mug",
  );
  assert.equal(merchandiseSsoReturnPath("/registration", "th"), null);
  assert.equal(
    merchandiseSsoReturnPath("/souvenirs?token=secret", "th"),
    "/th",
  );
  assert.equal(merchandiseSsoReturnPath("/foo/../souvenirs", "th"), "/th");
  assert.equal(
    shouldRedirectReload(
      "/th/auth/sso",
      "?sso=synthetic&redirect=%2Fsouvenirs",
    ),
    false,
  );
  assert.equal(
    shouldRedirectReload("/th/auth/sso", "?sso=synthetic&redirect=%2Fprofile"),
    true,
  );
});
