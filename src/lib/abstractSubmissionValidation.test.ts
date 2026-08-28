import assert from "node:assert/strict";
import test from "node:test";
import {
  findAbstractEmailValidationTarget,
  isValidEmail,
  normalizeCoAuthorEmails,
  normalizeEmail,
} from "./abstractSubmissionValidation.js";

test("normalizes only leading and trailing email whitespace", () => {
  assert.equal(normalizeEmail("  person@example.com  "), "person@example.com");
  assert.equal(normalizeEmail("person @example.com"), "person @example.com");
});

test("provides early client email validation on normalized input", () => {
  assert.equal(isValidEmail("  person@example.com  "), true);
  assert.equal(isValidEmail("person@"), false);
  assert.equal(isValidEmail("person @example.com"), false);
});

test("normalizes co-author emails without mutating the input array", () => {
  const original = [
    { firstName: "Suda", email: "  suda@example.com  " },
  ];

  const normalized = normalizeCoAuthorEmails(original);

  assert.notEqual(normalized, original);
  assert.notEqual(normalized[0], original[0]);
  assert.equal(normalized[0].email, "suda@example.com");
  assert.equal(original[0].email, "  suda@example.com  ");
});

test("maps presenting-author Zod path", () => {
  assert.deepEqual(
    findAbstractEmailValidationTarget([
      { code: "invalid_string", path: ["email"], message: "Invalid email address" },
    ]),
    { kind: "author" },
  );
});

test("maps exact co-author Zod path and zero-based index", () => {
  assert.deepEqual(
    findAbstractEmailValidationTarget([
      {
        code: "invalid_string",
        path: ["coAuthors", 2, "email"],
        message: "Invalid email address",
      },
    ]),
    { kind: "coAuthor", index: 2 },
  );
});

test("ignores malformed or unrelated API details", () => {
  assert.equal(findAbstractEmailValidationTarget(undefined), null);
  assert.equal(findAbstractEmailValidationTarget({ path: ["email"] }), null);
  assert.equal(
    findAbstractEmailValidationTarget([
      { code: "too_small", path: ["title"], message: "Title too short" },
    ]),
    null,
  );
});

test("does not classify non-email co-author issues as email failures", () => {
  assert.equal(
    findAbstractEmailValidationTarget([
      {
        code: "too_small",
        path: ["coAuthors", 0, "institution"],
        message: "Institution is required",
      },
    ]),
    null,
  );
});
