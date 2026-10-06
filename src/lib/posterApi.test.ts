import assert from 'node:assert/strict';
import test from 'node:test';
import { getApprovedAnnouncements, getOwnerPoster, PosterApiError, uploadPoster } from './posterApi';
import { selectPosterFile } from './posterSubmissionState';
import type { UploadDto } from '../types/posters';

test('announcements use the public API, no cache, and abort signal; failures reject', async () => {
  const originalFetch = globalThis.fetch;
  const controller = new AbortController();
  const rows = [{ id: 1, round: 2, title: 'Synthetic announcement' }];
  try {
    globalThis.fetch = async (url, options) => {
      assert.ok(String(url).endsWith('/api/events/PRIS-2026/approved-abstracts'));
      assert.equal(options?.cache, 'no-store');
      assert.equal(options?.signal, controller.signal);
      return Response.json({ success: true, data: rows });
    };
    assert.deepEqual(await getApprovedAnnouncements(controller.signal), rows);
    for (const response of [Response.json({ success: false, data: [] }), Response.json({ success: true, data: {} }), Response.json({ success: true, data: [] }, { status: 503 })]) {
      globalThis.fetch = async () => response;
      await assert.rejects(getApprovedAnnouncements(), /ANNOUNCEMENTS_UNAVAILABLE/);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('owner GET scopes token to header, encodes request, forwards signal and suppresses private error bodies', async () => {
  const original = globalThis.fetch, controller = new AbortController();
  try {
    globalThis.fetch = async (url, options) => {
      assert.ok(String(url).endsWith('/api/abstracts/51/poster?requestId=synthetic%26other%3D52'));
      assert.equal(String(url).includes('secret-token'), false);
      assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer secret-token');
      assert.equal(options?.cache, 'no-store');
      assert.equal(options?.signal, controller.signal);
      return Response.json({ success: true, data: { abstractId: 51, canUpload: false, blockCode: 'POSTER_REQUEST_CANCELLED' } });
    };
    assert.equal((await getOwnerPoster('secret-token', 51, 'synthetic&other=52', controller.signal)).blockCode, 'POSTER_REQUEST_CANCELLED');
    for (const status of [401, 403, 404, 409]) {
      globalThis.fetch = async () => Response.json({ success: false, code: 'POSTER_OWNER_REQUIRED', error: 'private@example.invalid', data: { abstractId: 52 } }, { status });
      await assert.rejects(getOwnerPoster('token', 52), error => error instanceof PosterApiError &&
        error.status === status && error.message === 'POSTER_OWNER_REQUIRED' && !JSON.stringify(error).includes('private@'));
    }
    globalThis.fetch = async () => Response.json({ success: true, data: { abstractId: 52 } });
    await assert.rejects(getOwnerPoster('token', 51), { code: 'POSTER_LOAD_FAILED', status: 200 });
    globalThis.fetch = async () => new Response('invalid');
    await assert.rejects(getOwnerPoster('token', 51), { code: 'POSTER_LOAD_FAILED' });
    globalThis.fetch = async () => { throw new Error('private network detail'); };
    await assert.rejects(getOwnerPoster('token', 51), { code: 'POSTER_LOAD_FAILED', status: 0 });
  } finally { globalThis.fetch = original; }
});

class MockXhr {
  static instances: MockXhr[] = [];
  method = ''; url = ''; status = 0; timeout = 0; responseText = ''; form: FormData | null = null;
  headers: Record<string, string> = {};
  upload: { onprogress: ((event: { loaded: number; total: number; lengthComputable: boolean }) => void) | null } = { onprogress: null };
  onerror: (() => void) | null = null; ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null; onload: (() => void) | null = null;
  constructor() { MockXhr.instances.push(this); }
  open(method: string, url: string) { this.method = method; this.url = url; }
  setRequestHeader(name: string, value: string) { this.headers[name] = value; }
  send(form: FormData) { this.form = form; }
  abort() { this.onabort?.(); }
  respond(status: number, body: unknown) { this.status = status; this.responseText = JSON.stringify(body); this.onload?.(); }
}

const receipt: UploadDto = { id: 'synthetic-upload', version: 1, fileName: 'x.pdf', mimeType: 'application/pdf',
  sizeBytes: 1, publicUrl: 'https://example.invalid/x.pdf', receivedAt: '2026-10-07T00:00:00Z', revisionRequestId: null };

test('XHR multipart, progress, receipts, known rejection, ambiguous retries, tampered scope and cancellation', async () => {
  const original = globalThis.XMLHttpRequest;
  globalThis.XMLHttpRequest = MockXhr as unknown as typeof XMLHttpRequest;
  const selected = selectPosterFile(new File(['synthetic'], 'x.pdf', { type: 'application/pdf' }));
  const progress: number[] = [];
  const input = { token: 'secret-token', abstractId: 51, requestId: null, ...selected, onProgress: (value: number) => progress.push(value) };
  const last = () => MockXhr.instances.at(-1)!;
  try {
    let settled = false;
    const first = uploadPoster(input).then(value => { settled = true; return value; });
    const xhr = last();
    assert.equal(xhr.method, 'POST');
    assert.ok(xhr.url.endsWith('/api/abstracts/51/poster-uploads'));
    assert.deepEqual(xhr.headers, { Authorization: 'Bearer secret-token', 'Idempotency-Key': selected.key });
    assert.equal(xhr.timeout, 180_000);
    assert.deepEqual([...xhr.form!.keys()], ['file']);
    assert.equal(await (xhr.form!.get('file') as File).text(), 'synthetic');
    xhr.upload.onprogress?.({ loaded: 50, total: 100, lengthComputable: true });
    xhr.upload.onprogress?.({ loaded: 100, total: 100, lengthComputable: true });
    xhr.upload.onprogress?.({ loaded: 1, total: 0, lengthComputable: true });
    xhr.upload.onprogress?.({ loaded: 1, total: 2, lengthComputable: false });
    await Promise.resolve();
    assert.deepEqual(progress, [50, 100]);
    assert.equal(settled, false);
    xhr.respond(201, { success: true, data: { upload: receipt, replayed: false } });
    assert.deepEqual(await first, { upload: receipt, replayed: false });
    assert.equal(xhr.upload.onprogress, null);

    const revision = uploadPoster({ ...input, requestId: 'synthetic-revision' });
    assert.deepEqual([...last().form!.keys()], ['file', 'requestId']);
    assert.equal(last().form!.get('requestId'), 'synthetic-revision');
    last().respond(200, { success: true, data: { upload: { ...receipt, revisionRequestId: 'synthetic-revision' }, replayed: true } });
    assert.equal((await revision).replayed, true);

    for (const [status, code] of [[422, 'POSTER_FILE_INVALID'], [413, 'POSTER_FILE_TOO_LARGE'], [403, 'POSTER_OWNER_REQUIRED'], [409, 'POSTER_REQUEST_CANCELLED']] as const) {
      const pending = uploadPoster({ ...input, abstractId: 52, requestId: 'tampered-request' });
      assert.ok(last().url.endsWith('/api/abstracts/52/poster-uploads'));
      last().respond(status, { success: false, code, error: 'private@example.invalid' });
      await assert.rejects(pending, error => error instanceof PosterApiError && error.code === code && error.status === status && !error.message.includes('private@'));
    }

    for (const event of ['onerror', 'ontimeout', 'onabort'] as const) {
      const pending = uploadPoster(input);
      last()[event]?.();
      await assert.rejects(pending, { code: 'POSTER_NETWORK_UNKNOWN', status: 0 });
      const retry = uploadPoster(input);
      assert.equal(last().headers['Idempotency-Key'], selected.key);
      assert.equal(await (last().form!.get('file') as File).text(), 'synthetic');
      last().respond(201, { success: true, data: { upload: receipt, replayed: true } });
      assert.equal((await retry).replayed, true);
    }
    for (const body of [null, { success: true, data: {} }, { success: true, data: { upload: receipt } }]) {
      const pending = uploadPoster(input);
      last().respond(201, body);
      await assert.rejects(pending, { code: 'POSTER_NETWORK_UNKNOWN' });
    }
    const invalid = uploadPoster(input);
    last().status = 201; last().responseText = 'broken response'; last().onload?.();
    await assert.rejects(invalid, { code: 'POSTER_NETWORK_UNKNOWN' });
    const noResponse = uploadPoster(input);
    last().respond(0, {});
    await assert.rejects(noResponse, { code: 'POSTER_NETWORK_UNKNOWN', status: 0 });
    const cancel = new AbortController();
    const cancelled = uploadPoster({ ...input, signal: cancel.signal });
    const cancelledXhr = last();
    cancel.abort();
    await assert.rejects(cancelled, { code: 'POSTER_NETWORK_UNKNOWN' });
    assert.equal(cancelledXhr.upload.onprogress, null);
    const alreadyAborted = uploadPoster({ ...input, signal: cancel.signal });
    assert.equal(last().form, null);
    await assert.rejects(alreadyAborted, { code: 'POSTER_NETWORK_UNKNOWN' });
  } finally { globalThis.XMLHttpRequest = original; MockXhr.instances = []; }
});
