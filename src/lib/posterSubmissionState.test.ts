import assert from 'node:assert/strict';
import test from 'node:test';
import { fileProblem, selectPosterFile, submissionState } from './posterSubmissionState';
import type { OwnerPosterDto } from '../types/posters';

const owner: OwnerPosterDto = { abstractId: 51, trackingId: 'SYNTHETIC-P001', title: 'Synthetic',
  submitterName: 'Synthetic Author', presentationType: 'poster', categoryName: 'Test', round: 1,
  serverNow: '2026-10-07T00:00:00Z', mainClosesAt: '2026-10-15T17:00:00Z', canUpload: true,
  blockCode: null, mode: 'initial', selectedRequest: null, currentUpload: null, uploads: [] };

test('declared file checks accept PDF only and inclusive 30 MB; reject empty, oversized or mismatched declarations', () => {
  for (const [name, type] of [['x.pdf', 'application/pdf'], ['x.pdf', ''], ['x.PDF', 'application/octet-stream']]) {
    assert.equal(fileProblem(new File(['x'], name, { type })), null);
  }
  assert.equal(fileProblem(new File([], 'x.pdf')), 'POSTER_FILE_EMPTY');
  const bytes = new Uint8Array(30 * 1024 * 1024 + 1);
  assert.equal(fileProblem(new File([bytes.subarray(1)], 'x.pdf', { type: 'application/pdf' })), null);
  assert.equal(fileProblem(new File([bytes], 'x.pdf')), 'POSTER_FILE_TOO_LARGE');
  for (const [name, type] of [['x.png', 'image/png'], ['x.png', 'application/octet-stream'], ['x.jpg', 'image/jpeg'], ['x.png.exe', 'image/png'], ['x.png', 'application/pdf'], ['x.pdf', 'image/png']]) {
    assert.equal(fileProblem(new File(['x'], name, { type })), 'POSTER_FILE_TYPE');
  }
  // Content parsing belongs to the API; declared synthetic bytes remain selectable.
  assert.equal(fileProblem(new File(['not real pdf'], 'x.pdf', { type: 'application/pdf' })), null);
});

test('selected bytes and 100% progress never count as received; server locks and loading remain distinct', () => {
  const state = { loading: false, owner, selected: false, sending: false, received: false, progress: 0 };
  assert.equal(submissionState(state), 'empty');
  assert.equal(submissionState({ ...state, selected: true }), 'selected');
  assert.equal(submissionState({ ...state, selected: true, sending: true, progress: 50 }), 'uploading');
  assert.equal(submissionState({ ...state, selected: true, sending: true, progress: 100 }), 'checking');
  assert.equal(submissionState({ ...state, selected: true, progress: 100 }), 'selected');
  assert.equal(submissionState({ ...state, received: true }), 'received');
  assert.equal(submissionState({ ...state, owner: null }), 'locked');
  assert.equal(submissionState({ ...state, owner: { ...owner, canUpload: false }, selected: true }), 'locked');
  assert.equal(submissionState({ ...state, loading: true }), 'loading');
});

test('ambiguous retry preserves identical file and key; changed/reselected file gets a fresh UUID', () => {
  const file = new File(['original'], 'x.pdf');
  const selected = selectPosterFile(file);
  assert.match(selected.key, /^[a-f0-9-]{36}$/);
  assert.equal(selected.file, file);
  assert.equal(selectPosterFile(file, selected), selected);
  const changed = selectPosterFile(new File(['changed'], 'x.pdf'), selected);
  assert.notEqual(changed.key, selected.key);
  assert.notEqual(selectPosterFile(file).key, selected.key);
});
