import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire, Module } from 'node:module';
import type { ReactTestRenderer } from 'react-test-renderer';
import type { PosterUploadInput } from './posterApi';
import type { OwnerPosterDto, UploadDto } from '../types/posters';
import en from '../../messages/en.json';

const require = createRequire(import.meta.url);
const globals = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };

test('page preserves ambiguous retry file/key, creates modal only for server receipt and clears scope on account/query changes', async () => {
  const React = require('react') as typeof import('react'), { act, create } = require('react-test-renderer') as typeof import('react-test-renderer');
  const api = require('./posterApi') as typeof import('./posterApi');
  const paths = ['next-intl', 'next/navigation', '../i18n/routing', '../context/AuthContext', './posterApi', 'gsap', '@gsap/react'].map(path => require.resolve(path));
  const oldModules = paths.map(path => require.cache[path]);
  const original = { window: globalThis.window, document: globalThis.document, HTMLElement: globalThis.HTMLElement, act: globals.IS_REACT_ACT_ENVIRONMENT };
  const receipt: UploadDto = { id: 'u1', version: 1, fileName: 'synthetic.pdf', mimeType: 'application/pdf', sizeBytes: 5,
    publicUrl: 'https://example.invalid/file.pdf', receivedAt: '2026-10-07T00:00:00Z', revisionRequestId: null };
  const owner: OwnerPosterDto = { abstractId: 51, trackingId: 'SYNTHETIC-P001', title: 'Owner 51 synthetic', submitterName: 'Synthetic', presentationType: 'poster', categoryName: 'Synthetic', round: 1,
    serverNow: '2026-10-07T00:00:00Z', mainClosesAt: '2026-10-15T17:00:00Z', canUpload: true, blockCode: null, mode: 'initial', currentUpload: null, uploads: [], selectedRequest: null };
  let query = new URLSearchParams('abstractId=51'), token: string | null = 'synthetic-token', renderer: ReactTestRenderer | undefined;
  const redirects: string[] = [], attempts: PosterUploadInput[] = [];
  let current = owner, wrong = false, lostCommit = false;
  const router = { replace: (path: string) => redirects.push(path) }, logout = () => { token = null; };
  const lookup = (key: string) => key.split('.').reduce<unknown>((value, name) => value && typeof value === 'object' ? (value as Record<string, unknown>)[name] : undefined, en.poster);
  const t = Object.assign((key: string) => String(lookup(key) ?? key), { has: (key: string) => !!lookup(key) });
  try {
    globals.IS_REACT_ACT_ENVIRONMENT = true;
    globalThis.window = { addEventListener() {}, removeEventListener() {}, location: { reload() {} } } as unknown as Window & typeof globalThis;
    globalThis.document = { addEventListener() {}, removeEventListener() {}, getElementById() { return null; }, activeElement: null, visibilityState: 'visible' } as unknown as Document;
    globalThis.HTMLElement = class {} as typeof HTMLElement;
    const exports = [ { useTranslations: () => t, useLocale: () => 'en' }, { useSearchParams: () => query }, { useRouter: () => router },
      { useAuth: () => ({ token, logout }) }, { ...api,
        getOwnerPoster: async () => { if (wrong) throw new api.PosterApiError('POSTER_OWNER_REQUIRED', 403); return current; },
        uploadPoster: async (input: PosterUploadInput) => {
          attempts.push(input); input.onProgress(100);
          if (attempts.length === 1) throw new api.PosterApiError('POSTER_NETWORK_UNKNOWN', 0);
          current = { ...owner, canUpload: false, blockCode: 'POSTER_ALREADY_SUBMITTED', currentUpload: receipt, uploads: [receipt] };
          if (lostCommit) throw new api.PosterApiError('POSTER_NETWORK_UNKNOWN', 502);
          return { upload: receipt, replayed: true };
        } }, { from() {} }, { useGSAP() {} } ];
    paths.forEach((path, i) => { const fake = new Module(path); fake.exports = exports[i]; require.cache[path] = fake; });
    const Page = require('../app/[locale]/poster-submission/page').default;
    const createPage = () => create(React.createElement(Page), { createNodeMock: element => element.type === 'dialog' ? { showModal() {}, close() {} } : null });
    await act(async () => { renderer = createPage(); });
    const file = new File(['bytes'], 'synthetic.pdf', { type: 'application/pdf' });
    await act(async () => renderer!.root.findByType('input').props.onChange({ target: { files: [file], value: 'fakepath' } }));
    const submit = () => renderer!.root.findAllByType('button').find(node => node.children.includes(en.poster.submit) || node.children.includes(en.poster.retryUpload))!;
    const confirm = () => renderer!.root.findAllByType('button').find(node => node.children.includes(en.poster.confirmSubmit))!;
    const sendConfirmed = async () => {
      const previousAttempts = attempts.length;
      await act(async () => { await submit().props.onClick(); });
      assert.equal(attempts.length, previousAttempts, 'opening the warning does not upload');
      assert.equal(renderer!.root.findByType('dialog').props['aria-labelledby'], 'poster-confirm-title');
      assert.ok(JSON.stringify(renderer!.toJSON()).includes(en.poster.confirmNotice));
      await act(async () => { await confirm().props.onClick(); });
    };
    await act(async () => { await submit().props.onClick(); });
    assert.equal(attempts.length, 0);
    await act(async () => renderer!.root.findAllByType('button').find(node => node.children.includes(en.poster.checkAgain))!.props.onClick());
    assert.equal(renderer!.root.findAllByType('dialog').length, 0);
    assert.equal(attempts.length, 0);
    await sendConfirmed();
    assert.equal(renderer!.root.findAllByType('dialog').length, 0);
    assert.equal(submit().children[0], en.poster.retryUpload);
    await sendConfirmed();
    assert.equal(attempts.length, 2); assert.equal(attempts[0].file, attempts[1].file); assert.equal(attempts[0].key, attempts[1].key);
    assert.equal(renderer!.root.findAllByType('dialog').length, 1);
    assert.equal(renderer!.root.findAllByType('input').length, 0);
    current = { ...owner, mode: 'revision', currentUpload: receipt, uploads: [receipt], selectedRequest: {
      id: '12345678-1234-4234-8234-123456789012', details: 'Fix the poster', status: 'open', closesAt: '2026-10-20T17:00:00Z',
      createdAt: '2026-10-07T00:00:00Z', requestedBy: 1, submittedAt: null, cancelledAt: null, cancelledBy: null, cancellationReason: null,
    } };
    token = 'revision-synthetic-token';
    await act(async () => renderer!.update(React.createElement(Page)));
    await act(async () => renderer!.root.findByType('input').props.onChange({ target: { files: [file], value: 'fakepath' } }));
    await sendConfirmed();
    assert.equal(attempts.at(-1)?.requestId, '12345678-1234-4234-8234-123456789012');
    // A committed upload with a lost POST response is confirmed by GET, without a new modal or stale uncertainty.
    current = owner; token = 'new-synthetic-token'; lostCommit = true;
    await act(async () => renderer!.update(React.createElement(Page)));
    await act(async () => renderer!.root.findByType('input').props.onChange({ target: { files: [file], value: 'fakepath' } }));
    await sendConfirmed();
    assert.equal(renderer!.root.findAllByType('dialog').length, 0);
    assert.equal(renderer!.root.findAllByType('input').length, 0);
    assert.ok(JSON.stringify(renderer!.toJSON()).includes(en.poster.received));
    assert.equal(JSON.stringify(renderer!.toJSON()).includes(en.poster.errors.POSTER_NETWORK_UNKNOWN), false);
    wrong = true; query = new URLSearchParams('abstractId=52');
    await act(async () => renderer!.update(React.createElement(Page)));
    assert.equal(renderer!.root.findAllByType('dialog').length, 0);
    const text = JSON.stringify(renderer!.toJSON());
    assert.ok(text.includes(en.poster.ownerRequired)); assert.equal(text.includes('Owner 51'), false); assert.equal(text.includes('@'), false);
    await act(async () => renderer!.root.findByType('button').props.onClick());
    assert.equal(token, null); assert.ok(redirects.at(-1)?.includes('abstractId%3D52'));
    query = new URLSearchParams('abstractId=52&recipient=bad');
    await act(async () => renderer!.update(React.createElement(Page)));
    assert.ok(JSON.stringify(renderer!.toJSON()).includes(en.poster.invalidLink));
    query = new URLSearchParams('abstractId=51');
    await act(async () => renderer!.update(React.createElement(Page)));
    assert.ok(redirects.at(-1)?.includes('abstractId%3D51'));
  } finally {
    if (renderer) await act(async () => renderer?.unmount());
    paths.forEach((path, i) => { if (oldModules[i]) require.cache[path] = oldModules[i]; else delete require.cache[path]; });
    globalThis.window = original.window; globalThis.document = original.document; globalThis.HTMLElement = original.HTMLElement; globals.IS_REACT_ACT_ENVIRONMENT = original.act;
  }
});
