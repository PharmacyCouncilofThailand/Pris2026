const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AbstractEmailValidationTarget =
  | { kind: "author" }
  | { kind: "coAuthor"; index: number };

export function normalizeEmail(value: string): string {
  return value.trim();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(value));
}

export function normalizeCoAuthorEmails<T extends { email: string }>(
  coAuthors: readonly T[],
): T[] {
  return coAuthors.map((coAuthor) => ({
    ...coAuthor,
    email: normalizeEmail(coAuthor.email),
  }));
}

export function findAbstractEmailValidationTarget(
  details: unknown,
): AbstractEmailValidationTarget | null {
  if (!Array.isArray(details)) return null;

  for (const rawIssue of details) {
    if (!rawIssue || typeof rawIssue !== "object") continue;
    const path = (rawIssue as { path?: unknown }).path;
    if (!Array.isArray(path)) continue;

    if (path.length === 1 && path[0] === "email") {
      return { kind: "author" };
    }

    if (
      path.length === 3 &&
      path[0] === "coAuthors" &&
      typeof path[1] === "number" &&
      Number.isInteger(path[1]) &&
      path[1] >= 0 &&
      path[2] === "email"
    ) {
      return { kind: "coAuthor", index: path[1] };
    }
  }

  return null;
}
