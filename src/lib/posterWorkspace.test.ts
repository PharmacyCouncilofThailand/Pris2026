import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire, Module } from 'node:module';
import type { ReactTestRenderer } from 'react-test-renderer';
import type { OwnerPosterDto, UploadDto } from '../types/posters';
import en from '../../messages/en.json';
import th from '../../messages/th.json';

const require = createRequire(import.meta.url);
const globals = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const upload: UploadDto = { id: 'u1', version: 1, fileName: 'old.pdf', mimeType: 'application/pdf', sizeBytes: 100,
  publicUrl: 'https://example.invalid/old.pdf', receivedAt: '2026-10-07T04:00:00Z', revisionRequestId: null };
const owner: OwnerPosterDto = { abstractId: 51, trackingId: 'SYNTHETIC-P001', title: 'Synthetic work', submitterName: 'Synthetic Author',
  presentationType: 'highlighted-poster', categoryName: 'Synthetic category', round: 1, serverNow: '2026-10-07T00:00:00Z',
  mainClosesAt: '2026-10-15T17:00:00Z', canUpload: true, blockCode: null, mode: 'initial', selectedRequest: null, currentUpload: null, uploads: [] };

test('TH/EN workspace selection/progress/locks/revision/history and native receipt focus lifecycle', async () => {
  const React = require('react') as typeof import('react');
  const { act, create } = require('react-test-renderer') as typeof import('react-test-renderer');
  const path = require.resolve('next-intl'), previous = require.cache[path], originalDocument = globalThis.document;
  const originalAct = globals.IS_REACT_ACT_ENVIRONMENT, originalHTMLElement = globalThis.HTMLElement;
  let locale = 'en', renderer: ReactTestRenderer | undefined, modal = 0, closed = 0, cancel = 0, focused = 0;
  const messages = () => locale === 'th' ? th.poster : en.poster;
  const lookup = (key: string): string | undefined => key.split('.').reduce<unknown>((value, name) =>
    value && typeof value === 'object' ? (value as Record<string, unknown>)[name] : undefined, messages()) as string | undefined;
  const translator = Object.assign((key: string) => { const value = lookup(key); assert.ok(value, `missing ${locale} poster.${key}`); return value; }, { has: (key: string) => !!lookup(key) });
  try {
    globals.IS_REACT_ACT_ENVIRONMENT = true;
    const intlModule = new Module(path); intlModule.exports = { useTranslations: () => translator, useLocale: () => locale }; require.cache[path] = intlModule;
    class FocusTarget { isConnected = true; focus() { focused++; } }
    globalThis.HTMLElement = FocusTarget as unknown as typeof HTMLElement;
    globalThis.document = { activeElement: new FocusTarget() } as unknown as Document;
    const { PosterWorkspace } = require('../components/posters/PosterWorkspace');
    const { PosterSuccessDialog } = require('../components/posters/PosterSuccessDialog');
    const props = { owner, file: new File(['selected'], '<script>.pdf', { type: 'application/pdf' }), onFile: () => {}, onSubmit: () => {}, sending: false, progress: 0, error: null };
    for (locale of ['en', 'th']) {
      await act(async () => { renderer = create(React.createElement(PosterWorkspace, props)); });
      assert.ok(JSON.stringify(renderer!.toJSON()).includes(messages().selected));
      assert.equal(JSON.stringify(renderer!.toJSON()).includes(messages().received), false);
      await act(async () => renderer!.update(React.createElement(PosterWorkspace, { ...props, sending: true, progress: 100 })));
      assert.ok(JSON.stringify(renderer!.toJSON()).includes(messages().checking));
      assert.equal(renderer!.root.findAllByType('button').some(node => !node.props.disabled), false);
      for (const code of ['POSTER_DEADLINE_PASSED', 'POSTER_REQUEST_EXPIRED', 'POSTER_REQUEST_CANCELLED', 'POSTER_ALREADY_SUBMITTED', 'UNKNOWN_BLOCK']) {
        await act(async () => renderer!.update(React.createElement(PosterWorkspace, { ...props, file: null, owner: { ...owner, canUpload: false, blockCode: code } })));
        assert.equal(renderer!.root.findAllByType('input').length, 0);
        assert.equal(renderer!.root.findAllByType('button').length, 0);
      }
      const revision = { ...owner, mode: 'revision', currentUpload: upload, uploads: [upload, { ...upload, id: 'u0', version: 0 }],
        selectedRequest: { id: 'r1', details: 'Keep original while revising\nSynthetic detail', closesAt: '2026-10-20T17:00:00Z', status: 'open', createdAt: '2026-10-07T00:00:00Z', requestedBy: 1,
          submittedAt: null, cancelledAt: null, cancelledBy: null, cancellationReason: null } };
      await act(async () => renderer!.update(React.createElement(PosterWorkspace, { ...props, owner: revision, file: null, error: 'POSTER_FILE_INVALID' })));
      assert.ok(JSON.stringify(renderer!.toJSON()).includes('Synthetic detail'));
      assert.ok(JSON.stringify(renderer!.toJSON()).includes(messages().revisionTitle));
      assert.equal(renderer!.root.findAllByType('a').filter(node => node.props.href === upload.publicUrl).length, 2);
      assert.ok(JSON.stringify(renderer!.toJSON()).includes(messages().errors.POSTER_FILE_INVALID));
      await act(async () => renderer!.unmount());
    }
    await act(async () => { renderer = create(React.createElement(PosterSuccessDialog, { upload: { ...upload, fileName: '<img onerror=attack>.pdf' }, owner, onClose: () => { cancel++; } }), {
      createNodeMock: element => element.type === 'dialog' ? { showModal() { modal++; }, close() { closed++; } } : null,
    }); });
    assert.equal(modal, 1);
    const tree = JSON.stringify(renderer!.toJSON());
    assert.ok(tree.includes('<img onerror=attack>.pdf'));
    assert.ok(tree.includes('11:00:00')); // server receivedAt displayed in Bangkok, not browser clock
    assert.equal(renderer!.root.findAllByType('img').length, 0);
    assert.equal(renderer!.root.findByType('dialog').props['aria-labelledby'], 'poster-receipt-title');
    assert.ok(renderer!.root.findByType('dialog').props.className.split(' ').includes('m-auto'));
    assert.equal(renderer!.root.findByType('button').props.autoFocus, true);
    let prevented = false;
    await act(async () => renderer!.root.findByType('dialog').props.onCancel({ preventDefault() { prevented = true; } }));
    assert.equal(prevented, true); assert.equal(cancel, 1);
    await act(async () => renderer!.unmount()); renderer = undefined;
    assert.equal(closed, 1); assert.equal(focused, 1);
    assert.deepEqual(Object.keys(th.poster).sort(), Object.keys(en.poster).sort());
    assert.deepEqual(Object.keys(th.poster.errors).sort(), Object.keys(en.poster.errors).sort());
  } finally {
    if (renderer) await act(async () => renderer?.unmount());
    globalThis.document = originalDocument; globalThis.HTMLElement = originalHTMLElement; globals.IS_REACT_ACT_ENVIRONMENT = originalAct;
    if (previous) require.cache[path] = previous; else delete require.cache[path];
  }
});
