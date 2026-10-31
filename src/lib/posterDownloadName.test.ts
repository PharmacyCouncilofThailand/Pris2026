import assert from "node:assert/strict";
import { test } from "node:test";
import { posterDownloadName } from "./posterDownloadName";

const png = { mimeType: "image/png" };
const pdf = { mimeType: "application/pdf" };

test("joins tracking id, title and submitter with the file extension", () => {
  assert.equal(
    posterDownloadName({
      trackingId: "ABS-PRIS-2026-003",
      title: "ผลของการให้คำปรึกษา",
      submitterName: "ภัทราภรณ์ ศรีสวัสดิ์",
      file: png,
    }),
    "ABS-PRIS-2026-003_ผลของการให้คำปรึกษา_ภัทราภรณ์ ศรีสวัสดิ์.png",
  );
  assert.equal(
    posterDownloadName({
      trackingId: "A1",
      title: "T",
      submitterName: "N",
      file: pdf,
    }),
    "A1_T_N.pdf",
  );
});

test("removes characters that file systems reject", () => {
  const name = posterDownloadName({
    trackingId: "A1",
    title: 'Effect of "X": a/b\\c?*<>|',
    submitterName: "N",
    file: png,
  });
  assert.equal(name, "A1_Effect of X a b c_N.png");
});

test("skips a missing submitter and falls back when everything is empty", () => {
  assert.equal(
    posterDownloadName({
      trackingId: "A1",
      title: "T",
      submitterName: null,
      file: png,
    }),
    "A1_T.png",
  );
  assert.equal(
    posterDownloadName({
      trackingId: "",
      title: "",
      submitterName: null,
      file: png,
    }),
    "poster.png",
  );
});

test("shortens very long titles without splitting a character or leaving a trailing dot", () => {
  const long = "ก".repeat(300);
  const name = posterDownloadName({
    trackingId: "A1",
    title: long,
    submitterName: "N",
    file: png,
  });
  assert.equal(name, `A1_${"ก".repeat(100)}_N.png`);
  assert.equal(
    posterDownloadName({
      trackingId: "A1",
      title: `${"x".repeat(99)}...`,
      submitterName: null,
      file: png,
    }),
    `A1_${"x".repeat(99)}.png`,
  );
});
