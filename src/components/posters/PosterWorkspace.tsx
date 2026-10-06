'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, FileText, UploadCloud } from 'lucide-react';
import type { OwnerPosterDto } from '@/types/posters';
import { fileProblem, submissionState } from '@/lib/posterSubmissionState';

export function PosterWorkspace(p: { owner: OwnerPosterDto; file: File | null; onFile: (file: File | null) => void;
  onSubmit: () => void; sending: boolean; progress: number; error: string | null }) {
  const t = useTranslations('poster'), locale = useLocale(), o = p.owner;
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    // Fix preview media type so an empty browser MIME cannot make selected HTML execute in a PDF frame.
    const url = p.file && !fileProblem(p.file) ? URL.createObjectURL(new Blob([p.file], {
      type: p.file.name.toLowerCase().endsWith('.png') ? 'image/png' : 'application/pdf',
    })) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize the browser-owned preview URL lifetime
    setPreview(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [p.file]);
  const date = (iso: string) => new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'long', timeStyle: 'medium', timeZone: 'Asia/Bangkok',
  }).format(new Date(iso));
  const state = submissionState({ loading: false, owner: o, selected: !!p.file, sending: p.sending, received: false, progress: p.progress });
  const block = `blocks.${o.blockCode ?? 'POSTER_ALREADY_SUBMITTED'}`;
  const close = o.selectedRequest?.closesAt ?? o.mainClosesAt;
  return <main className="min-h-screen bg-[#fafafa] px-4 pb-20 pt-28 text-slate-900 sm:px-6">
    <div className="mx-auto max-w-6xl">
      <header className="mb-7"><p className="mb-2 text-sm text-slate-500">PRIS 2026</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">{t(o.selectedRequest ? 'revisionTitle' : 'title')}</h1></header>
      <div className="mb-6 rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-4 text-[#c2410c]">
        <p><strong>{t('deadline')}</strong> · {date(new Date(Date.parse(close) - 1000).toISOString())} {t('thaiTime')}</p>
        <p className="mt-1 text-sm">{t('completionRule')}</p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="poster-work">
          <h2 id="poster-work" className="mb-5 text-lg font-semibold">{t('work')}</h2>
          <span className="inline-block rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-700">{t(o.presentationType === 'highlighted-poster' ? 'highlighted' : 'poster')}</span>
          <p className="mt-5 text-sm font-medium text-slate-500">{o.trackingId}</p>
          <h3 className="mt-2 break-words text-xl font-semibold leading-relaxed">{o.title}</h3>
          <dl className="mt-6 space-y-4 text-sm"><div><dt className="text-slate-500">{t('submitter')}</dt><dd className="mt-1">{o.submitterName}</dd></div>
            <div><dt className="text-slate-500">{t('category')}</dt><dd className="mt-1">{o.categoryName}</dd></div><div><dt className="text-slate-500">{t('round')}</dt><dd>{o.round}</dd></div></dl>
          {o.selectedRequest && <div className="mt-7 rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-4">
            <h3 className="font-semibold">{t('revisionDetails')}</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{o.selectedRequest.details}</p>
            <p className="mt-3 text-sm">{t('requestStatus')}: {t(`requestStates.${o.selectedRequest.status}`)}</p>
            {o.selectedRequest.cancellationReason && <p className="mt-2 break-words text-sm">{t('cancellationReason')}: {o.selectedRequest.cancellationReason}</p>}
          </div>}
        </section>
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="poster-upload">
          <h2 id="poster-upload" tabIndex={-1} className="text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4">{t('uploadTitle')}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">{t('requirements')}</p>
          {o.currentUpload && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 font-medium text-emerald-800"><CheckCircle2 size={18} aria-hidden="true" />{t('received')}</p>
            <a href={o.currentUpload.publicUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block break-all underline">{o.currentUpload.fileName}</a>
            <p className="mt-2 text-sm">{t('version')} {o.currentUpload.version} · {t('receivedAt')}: {date(o.currentUpload.receivedAt)}</p>
          </div>}
          {o.uploads.length > 1 && <details className="mt-4 text-sm"><summary className="cursor-pointer">{t('history')}</summary><ul className="mt-3 space-y-3">{o.uploads.filter(u => u.id !== o.currentUpload?.id).map(u => <li key={u.id}>
            <a href={u.publicUrl} target="_blank" rel="noopener noreferrer" className="break-all underline">{t('version')} {u.version} · {u.fileName}</a><p className="mt-1 text-slate-500">{date(u.receivedAt)}</p></li>)}</ul></details>}
          {o.canUpload ? <>
            <label className="mt-6 flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 px-5 py-9 text-center focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-slate-900">
              <UploadCloud size={32} aria-hidden="true" /><span className="font-medium">{t('chooseFile')}</span><span className="text-sm text-slate-500">PNG / PDF · 30 MB</span>
              <input className="sr-only" type="file" accept="image/png,application/pdf,.png,.pdf" disabled={p.sending} onChange={e => { p.onFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />
            </label>
            {p.file && <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm"><FileText size={18} aria-hidden="true" />
              <span className="min-w-0 break-all">{p.file.name} · {(p.file.size / 1024 / 1024).toFixed(2)} MB</span><span className="text-slate-600">{t('selected')}</span>
              <button className="ml-auto underline focus-visible:outline-2 focus-visible:outline-offset-4" disabled={p.sending} onClick={() => p.onFile(null)}>{t('removeSelection')}</button></div>}
            {preview && p.file && <div className="mt-4">
              {p.file.name.toLowerCase().endsWith('.png') ?
                // eslint-disable-next-line @next/next/no-img-element -- local original-file blob preview cannot use image optimization
                <img src={preview} alt={p.file.name} className="max-h-80 w-full object-contain" /> :
                <iframe src={preview} title={p.file.name} className="h-80 w-full rounded-lg border border-slate-200" />}
              <a href={preview} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline">{t('openPreview')}</a>
            </div>}
            {p.sending && <div className="mt-5" role="status" aria-live="polite"><progress className="w-full accent-slate-900" max={100} value={p.progress} aria-label={t('sending')} /><p className="mt-1 text-sm">{t(state === 'checking' ? 'checking' : 'sending')}</p></div>}
            <button className="mt-6 w-full rounded-xl bg-[#020617] px-5 py-3.5 font-medium text-white transition-colors hover:bg-[#ca9b52] hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
              disabled={!p.file || p.sending || !!fileProblem(p.file)} onClick={p.onSubmit}>{t(p.error === 'POSTER_NETWORK_UNKNOWN' ? 'retryUpload' : 'submit')}</button>
          </> : <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm" role="status">{t.has(block) ? t(block) : t('loadError')}</p>}
          {p.error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{t.has(`errors.${p.error}`) ? t(`errors.${p.error}`) : t('uploadError')}</p>}
          <p className="mt-6 text-sm text-slate-500">{t('support')} <a className="break-all underline" href="mailto:pr@pharmactcouncil.org">pr@pharmactcouncil.org</a></p>
        </section>
      </div>
    </div>
  </main>;
}
