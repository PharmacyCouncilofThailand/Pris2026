import assert from "node:assert/strict";
import test from "node:test";
import {
  eventReturnQuery,
  normalizeLocalizedRedirectPath,
  presentationReturnPath,
} from "./localizedRedirect.js";

test("keeps locale-relative internal redirects unchanged", () => {
  assert.equal(
    normalizeLocalizedRedirectPath("/registration"),
    "/registration",
  );
  assert.equal(
    normalizeLocalizedRedirectPath("/abstract-submission?edit=42"),
    "/abstract-submission?edit=42",
  );
});

test("poster return accepts only a positive safe abstract ID and optional UUID request", () => {
  const requestId = "123e4567-e89b-42d3-a456-426614174000";
  assert.equal(
    presentationReturnPath("?abstractId=501"),
    "/presentation-submission?abstractId=501",
  );
  assert.equal(
    presentationReturnPath(`?requestId=${requestId}&abstractId=00501`),
    `/presentation-submission?abstractId=501&requestId=${requestId}`,
  );
  for (const search of [
    "",
    "?abstractId=0",
    "?abstractId=-1",
    "?abstractId=1.5",
    "?abstractId=1e3",
    "?abstractId=9007199254740992",
    "?abstractId=501&abstractId=502",
    "?abstractId=501&next=https://evil.invalid",
    "?abstractId=501&email=owner@example.com",
    "?abstractId=501&requestId=",
    "?abstractId=501&requestId=not-a-uuid",
    `?abstractId=501&requestId=${requestId}&requestId=${requestId}`,
  ])
    assert.equal(presentationReturnPath(search), null, search);
});

test("poster auth journeys retain a validated locale-relative return path", () => {
  const path =
    "/presentation-submission?abstractId=501&requestId=123e4567-e89b-42d3-a456-426614174000";
  for (const locale of ["", "/th", "/en"]) {
    const search = `?redirect=${encodeURIComponent(locale + path)}`;
    assert.deepEqual(eventReturnQuery(search), { redirect: path });
    assert.equal(
      normalizeLocalizedRedirectPath(eventReturnQuery(search)?.redirect),
      path,
    );
  }
  for (const path of [
    "/presentation-submission",
    "/presentation-submission?abstractId=0",
    "/presentation-submission?abstractId=501&next=https://evil.invalid",
    "/presentation-submission?abstractId=501#fragment",
    "//evil.invalid/presentation-submission?abstractId=501",
    "https://evil.invalid/presentation-submission?abstractId=501",
    "/foo/../presentation-submission?abstractId=501",
  ])
    assert.equal(
      eventReturnQuery(`?redirect=${encodeURIComponent(path)}`),
      undefined,
      path,
    );
  for (const path of [
    "/th/presentation-submission?abstractId=0",
    "/en/presentation-submission?abstractId=501&email=owner@example.com",
    "/presentation-submission?abstractId=501&next=https://evil.invalid",
    "/presentation-submission?abstractId=501#fragment",
  ])
    assert.equal(normalizeLocalizedRedirectPath(path), "/", path);
  assert.equal(
    normalizeLocalizedRedirectPath(
      "/th/presentation-submission?abstractId=00501",
    ),
    "/presentation-submission?abstractId=501",
  );
});

test("strips an existing supported locale before next-intl navigation", () => {
  assert.equal(
    normalizeLocalizedRedirectPath("/th/registration"),
    "/registration",
  );
  assert.equal(
    normalizeLocalizedRedirectPath("/en/registration"),
    "/registration",
  );
  assert.equal(normalizeLocalizedRedirectPath("/th"), "/");
  assert.equal(
    normalizeLocalizedRedirectPath("/en?source=login"),
    "/?source=login",
  );
});

test("direct login rejects alternate paths that resolve to poster submission", () => {
  for (const path of [
    "/foo/../presentation-submission",
    "/foo/%2e%2e/presentation-submission",
    "/foo/.%2E/presentation-submission",
    "/foo/%2E./presentation-submission",
    "/presentation-submission/",
    "/presentation-submission//",
    "/presentation-submission/.",
    "/presentation-submission/%2e/",
  ]) {
    for (const locale of ["", "/th", "/en"]) {
      for (const search of [
        "?abstractId=501",
        "?abstractId=0&email=owner@example.com",
        "?abstractId=501&next=https://evil.invalid",
        "?abstractId=501#fragment",
      ]) {
        const redirect = locale + path + search;
        assert.equal(normalizeLocalizedRedirectPath(redirect), "/", redirect);
        assert.equal(
          eventReturnQuery(`?redirect=${encodeURIComponent(redirect)}`),
          undefined,
          redirect,
        );
      }
    }
  }
  assert.equal(
    normalizeLocalizedRedirectPath("/th/foo/../registration?edit=42"),
    "/foo/../registration?edit=42",
  );
});

test("falls back to home for unsafe or missing redirects", () => {
  assert.equal(normalizeLocalizedRedirectPath(null), "/");
  assert.equal(normalizeLocalizedRedirectPath(""), "/");
  assert.equal(normalizeLocalizedRedirectPath("https://example.com"), "/");
  assert.equal(normalizeLocalizedRedirectPath("//example.com/path"), "/");
  assert.equal(normalizeLocalizedRedirectPath("/\\evil.test/path"), "/");
  assert.equal(normalizeLocalizedRedirectPath("/\t/evil.test/path"), "/");
});

test("malformed authorities disguised with URL-stripped controls safely reject", () => {
  for (const redirect of [
    "/\t/[",
    "/\n/%",
    "/th/\r/[",
    "/en/\t/%",
    "/\r\n/[",
    "/tick\tet",
  ]) {
    assert.equal(
      normalizeLocalizedRedirectPath(redirect),
      "/",
      JSON.stringify(redirect),
    );
    assert.equal(
      eventReturnQuery(`?redirect=${encodeURIComponent(redirect)}`),
      undefined,
      JSON.stringify(redirect),
    );
  }
});

test("event return query preserves only ticket and bounded Lucky Wheel destinations", () => {
  assert.deepEqual(eventReturnQuery("?redirect=%2Fticket"), {
    redirect: "/ticket",
  });
  assert.deepEqual(eventReturnQuery("?redirect=%2Fth%2Flucky-wheel"), {
    redirect: "/lucky-wheel",
  });
  assert.deepEqual(eventReturnQuery("?redirect=%2Fen%2Flucky-wheel%2Fclaim"), {
    redirect: "/lucky-wheel/claim",
  });
  assert.deepEqual(
    eventReturnQuery("?redirect=%2Fen%2Flucky-wheel%2Fhistory"),
    {
      redirect: "/lucky-wheel/history",
    },
  );
  assert.deepEqual(
    eventReturnQuery(
      "?redirect=%2Flucky-wheel%2Frewards%2F123e4567-e89b-42d3-a456-426614174000",
    ),
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
