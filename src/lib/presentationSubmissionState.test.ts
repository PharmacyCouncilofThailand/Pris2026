import assert from "node:assert/strict";
import test from "node:test";
import {
  fileProblem,
  selectPresentationFile,
  submissionState,
} from "./presentationSubmissionState";
import type { OwnerPresentationDto } from "../types/presentations";
import { PRESENTATION_LIMITS } from "./presentationLimits";

test("central limits preserve byte ceilings and MB labels", () => {
  assert.deepEqual(PRESENTATION_LIMITS.oral, { mb: 50, bytes: 52_428_800 });
  assert.deepEqual(PRESENTATION_LIMITS.poster, { mb: 30, bytes: 31_457_280 });
});

const owner: OwnerPresentationDto = {
  abstractId: 51,
  trackingId: "SYNTHETIC-P001",
  title: "Synthetic",
  submitterName: "Synthetic Author",
  presentationType: "poster",
  categoryName: "Test",
  round: 1,
  serverNow: "2026-10-07T00:00:00Z",
  mainClosesAt: "2026-10-15T17:00:00Z",
  canUpload: true,
  blockCode: null,
  mode: "initial",
  selectedRequest: null,
  currentUpload: null,
  uploads: [],
};

test("declared file checks accept PDF only and inclusive 30 MB; reject empty, oversized or mismatched declarations", () => {
  for (const [name, type] of [
    ["x.pdf", "application/pdf"],
    ["x.pdf", ""],
    ["x.PDF", "application/octet-stream"],
  ]) {
    assert.equal(fileProblem(new File(["x"], name, { type }), "poster"), null);
  }
  assert.equal(
    fileProblem(new File([], "x.pdf"), "poster"),
    "PRESENTATION_FILE_EMPTY",
  );
  const bytes = new Uint8Array(30 * 1024 * 1024 + 1);
  assert.equal(
    fileProblem(
      new File([bytes.subarray(1)], "x.pdf", { type: "application/pdf" }),
      "poster",
    ),
    null,
  );
  assert.equal(
    fileProblem(new File([bytes], "x.pdf"), "poster"),
    "PRESENTATION_FILE_TOO_LARGE",
  );
  for (const [name, type] of [
    ["x.png", "image/png"],
    ["x.png", "application/octet-stream"],
    ["x.jpg", "image/jpeg"],
    ["x.png.exe", "image/png"],
    ["x.png", "application/pdf"],
    ["x.pdf", "image/png"],
  ]) {
    assert.equal(
      fileProblem(new File(["x"], name, { type }), "poster"),
      "PRESENTATION_FILE_TYPE",
    );
  }
  // Content parsing belongs to the API; declared synthetic bytes remain selectable.
  assert.equal(
    fileProblem(
      new File(["not real pdf"], "x.pdf", { type: "application/pdf" }),
      "poster",
    ),
    null,
  );
});

test("Oral accepts exactly 50 MB while both Poster types retain 30 MB", () => {
  const bytes = new Uint8Array(52_428_801);
  assert.equal(
    fileProblem(new File([bytes.subarray(1)], "slides.pdf"), "oral"),
    null,
  );
  assert.equal(
    fileProblem(new File([bytes], "slides.pdf"), "oral"),
    "PRESENTATION_FILE_TOO_LARGE",
  );
  for (const type of ["poster", "highlighted-poster"] as const) {
    assert.equal(
      fileProblem(
        new File([bytes.subarray(0, 31_457_280)], "poster.pdf"),
        type,
      ),
      null,
    );
    assert.equal(
      fileProblem(
        new File([bytes.subarray(0, 31_457_281)], "poster.pdf"),
        type,
      ),
      "PRESENTATION_FILE_TOO_LARGE",
    );
  }
  assert.equal(
    fileProblem(new File(["x"], "slides.png", { type: "image/png" }), "oral"),
    "PRESENTATION_FILE_TYPE",
  );
});

test("selected bytes and 100% progress never count as received; server locks and loading remain distinct", () => {
  const state = {
    loading: false,
    owner,
    selected: false,
    sending: false,
    received: false,
    progress: 0,
  };
  assert.equal(submissionState(state), "empty");
  assert.equal(submissionState({ ...state, selected: true }), "selected");
  assert.equal(
    submissionState({ ...state, selected: true, sending: true, progress: 50 }),
    "uploading",
  );
  assert.equal(
    submissionState({ ...state, selected: true, sending: true, progress: 100 }),
    "checking",
  );
  assert.equal(
    submissionState({ ...state, selected: true, progress: 100 }),
    "selected",
  );
  assert.equal(submissionState({ ...state, received: true }), "received");
  assert.equal(submissionState({ ...state, owner: null }), "locked");
  assert.equal(
    submissionState({
      ...state,
      owner: { ...owner, canUpload: false },
      selected: true,
    }),
    "locked",
  );
  assert.equal(submissionState({ ...state, loading: true }), "loading");
});

test("ambiguous retry preserves identical file and key; changed/reselected file gets a fresh UUID", () => {
  const file = new File(["original"], "x.pdf");
  const selected = selectPresentationFile(file);
  assert.match(selected.key, /^[a-f0-9-]{36}$/);
  assert.equal(selected.file, file);
  assert.equal(selectPresentationFile(file, selected), selected);
  const changed = selectPresentationFile(
    new File(["changed"], "x.pdf"),
    selected,
  );
  assert.notEqual(changed.key, selected.key);
  assert.notEqual(selectPresentationFile(file).key, selected.key);
});
