import assert from "node:assert/strict";
import test from "node:test";
import { approvedRound1Abstracts } from "./approvedRound1Abstracts";

test("contains every Round 1 row from the PDF", () => {
  assert.equal(approvedRound1Abstracts.length, 119);
  assert.deepEqual(
    approvedRound1Abstracts.reduce<Record<string, number>>((counts, item) => {
      counts[item.presentationType] = (counts[item.presentationType] ?? 0) + 1;
      return counts;
    }, {}),
    { oral: 31, "highlighted-poster": 39, poster: 49 },
  );
});

test("preserves Round 1 and the two rows without Tracking ID", () => {
  assert.ok(approvedRound1Abstracts.every((item) => item.round === 1));
  assert.equal(
    approvedRound1Abstracts.filter((item) => item.trackingId === null).length,
    2,
  );
  assert.equal(
    new Set(
      approvedRound1Abstracts
        .map((item) => item.trackingId)
        .filter((trackingId): trackingId is string => trackingId !== null),
    ).size,
    117,
  );
});

test("uses stable unique IDs and exact section ranges", () => {
  assert.equal(
    new Set(approvedRound1Abstracts.map((item) => item.id)).size,
    119,
  );
  assert.deepEqual(
    approvedRound1Abstracts
      .filter((item) => item.presentationType === "oral")
      .map((item) => item.id),
    Array.from({ length: 31 }, (_, index) => index + 1),
  );
  assert.deepEqual(
    approvedRound1Abstracts
      .filter((item) => item.presentationType === "highlighted-poster")
      .map((item) => item.id),
    Array.from({ length: 39 }, (_, index) => index + 101),
  );
  assert.deepEqual(
    approvedRound1Abstracts
      .filter((item) => item.presentationType === "poster")
      .map((item) => item.id),
    Array.from({ length: 49 }, (_, index) => index + 201),
  );
});

test("keeps the PDF's two pending announcement rows", () => {
  const pendingRows = approvedRound1Abstracts.filter(
    (item) => item.trackingId === null,
  );
  assert.equal(pendingRows.length, 2);
  assert.ok(pendingRows.every((item) => item.title === "รอผลประกาศ"));
  assert.ok(pendingRows.every((item) => item.submitterName === null));
  assert.ok(pendingRows.every((item) => item.affiliation === null));
});
