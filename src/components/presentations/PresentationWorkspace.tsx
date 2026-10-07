'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, Clock3, Download, FileText, UploadCloud } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import type { OwnerPresentationDto } from '@/types/presentations';
import { fileProblem, submissionState } from '@/lib/presentationSubmissionState';
import { PRESENTATION_LIMITS, PRESENTATION_SIZE_UNIT_BYTES } from '@/lib/presentationLimits';

export function PresentationWorkspace(p: { owner: OwnerPresentationDto; file: File | null; onFile: (file: File | null) => void;
  onSubmit: () => void; sending: boolean; progress: number; error: string | null }) {
  const t = useTranslations('presentation'), locale = useLocale(), o = p.owner;
  const oral = o.presentationType === 'oral';
  const typeKey = oral ? 'oral' : o.presentationType === 'highlighted-poster' ? 'highlighted' : 'poster';
  const maxMB = PRESENTATION_LIMITS[oral ? 'oral' : 'poster'].mb;
  const pageRule = t(oral ? 'pageRuleOral' : 'pageRulePoster');
  const templateUrl = oral
    ? 'https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Template%20Abstract/Presentation%20Oral%20Template.zip'
    : 'https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Template%20Abstract/Presentation%20Poster%20Template.zip';
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    // Fix preview media type so an empty browser MIME cannot make selected HTML execute in a PDF frame.
    const url = p.file && !fileProblem(p.file, o.presentationType) ? URL.createObjectURL(new Blob([p.file], {
      type: 'application/pdf',
    })) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize the browser-owned preview URL lifetime
    setPreview(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [p.file, o.presentationType]);
  const date = (iso: string) => new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'long', timeStyle: 'medium', timeZone: 'Asia/Bangkok',
  }).format(new Date(iso));
  const state = submissionState({ loading: false, owner: o, selected: !!p.file, sending: p.sending, received: false, progress: p.progress });
  const block = `blocks.${o.blockCode ?? 'PRESENTATION_ALREADY_SUBMITTED'}`;
  const close = o.selectedRequest?.closesAt ?? o.mainClosesAt;
  return <main className="min-h-screen bg-[#fafafa] pb-24 text-slate-900 selection:bg-gold selection:text-black">
    <PageHero title1={t(o.selectedRequest ? 'revisionHeroTitle' : 'heroTitle')} title2={t(typeKey)}
      titleSizeClassName={typeKey === 'highlighted' ? 'text-[clamp(1rem,3.5vw,4rem)]' : 'text-[clamp(1.5rem,5vw,6.25rem)]'} />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
      <div className="mb-8 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-900 sm:p-6">
        <Clock3 size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-600" /><div><p className="text-sm leading-relaxed"><strong>{t('deadline')}</strong> · {date(new Date(Date.parse(close) - 1000).toISOString())} {t('thaiTime')}</p>
        <p className="mt-1 text-sm">{t('completionRule')}</p></div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
        <section className="min-w-0 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_40px_100px_rgba(0,0,0,0.03)] sm:rounded-[2.5rem] sm:p-10" aria-labelledby="presentation-work">
          <h2 id="presentation-work" className="mb-6 text-xl font-black tracking-tight text-slate-950">{t('work')}</h2>
          <span className="inline-flex rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">{t(typeKey)}</span>
          <p className="mt-6 font-mono text-xs font-bold tracking-wide text-slate-400">{o.trackingId}</p>
          <h3 className="mt-3 break-words text-2xl font-black leading-relaxed tracking-tight text-slate-950">{o.title}</h3>
          <dl className="mt-8 space-y-5 border-t border-slate-100 pt-6 text-sm"><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('submitter')}</dt><dd className="mt-2 font-medium leading-relaxed text-slate-900">{o.submitterName}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('category')}</dt><dd className="mt-2 font-medium leading-relaxed text-slate-900">{o.categoryName}</dd></div></dl>
          {o.selectedRequest && <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-blue-950">
            <h3 className="text-sm font-black">{t('revisionDetails')}</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{o.selectedRequest.details}</p>
            <p className="mt-3 text-sm">{t('requestStatus')}: {t(`requestStates.${o.selectedRequest.status}`)}</p>
            {o.selectedRequest.cancellationReason && <p className="mt-2 break-words text-sm">{t('cancellationReason')}: {o.selectedRequest.cancellationReason}</p>}
          </div>}
        </section>
        <section className="min-w-0 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_40px_100px_rgba(0,0,0,0.03)] sm:rounded-[2.5rem] sm:p-10" aria-labelledby="presentation-upload">
          <h2 id="presentation-upload" tabIndex={-1} className="text-xl font-black tracking-tight text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4">{t('uploadTitle')}</h2>
          <h3 className="mt-4 text-sm font-bold text-slate-900">{t(oral ? 'preparationTitleOral' : 'preparationTitlePoster')}</h3>
          {oral ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{t('requirementsOral', { maxMB })}</p> :
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
              {(['posterTemplate', 'posterDimensions', 'posterImages', 'requirementsPoster', 'pdfNoPassword'] as const).map(key => <li key={key}>{t(key, { maxMB })}</li>)}
            </ol>}
          <a href={templateUrl} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-gold hover:bg-gold/5 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none">
            <Download size={18} aria-hidden="true" />{t(oral ? 'downloadOralTemplate' : 'downloadPosterTemplate')}
          </a>
          {o.currentUpload && <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-900"><CheckCircle2 size={18} aria-hidden="true" />{t('received')}</p>
            <a href={o.currentUpload.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block break-all text-sm font-bold text-emerald-950 underline decoration-emerald-200 underline-offset-4">{o.currentUpload.fileName}</a>
            <p className="mt-2 text-xs leading-relaxed text-emerald-800">{t('receivedAt')}: {date(o.currentUpload.receivedAt)}</p>
          </div>}
          {o.uploads.length > 1 && <details className="mt-5 text-sm"><summary className="cursor-pointer font-bold text-slate-500">{t('history')}</summary><ul className="mt-3 space-y-3">{o.uploads.filter(u => u.id !== o.currentUpload?.id).map(u => <li key={u.id}>
            <a href={u.fileUrl} target="_blank" rel="noopener noreferrer" className="break-all underline">{u.fileName}</a><p className="mt-1 text-slate-500">{date(u.receivedAt)}</p></li>)}</ul></details>}
          {o.canUpload ? <>
            {!p.file && <label className="group mt-7 flex cursor-pointer flex-col items-center gap-4 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white px-5 py-12 text-center transition-colors hover:border-gold hover:bg-gold/5 motion-reduce:transition-none focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-slate-900">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:text-gold motion-reduce:transition-none"><UploadCloud size={28} aria-hidden="true" /></span><span className="text-sm font-bold">{t('chooseFile')}</span><span className="text-sm text-slate-500">PDF · {maxMB} MB</span>
              <input className="sr-only" type="file" accept="application/pdf,.pdf" disabled={p.sending} onChange={e => { p.onFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />
            </label>}
            {p.file && <div className="mt-7 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm"><FileText size={20} aria-hidden="true" className="shrink-0 text-emerald-600" />
              <span className="min-w-0 break-all font-bold text-emerald-950">{p.file.name} · {(p.file.size / PRESENTATION_SIZE_UNIT_BYTES).toFixed(2)} MB</span><span className="text-xs text-emerald-800">{t('selected')}</span>
              <button className="ml-auto text-xs font-bold text-rose-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4" disabled={p.sending} onClick={() => p.onFile(null)}>{t('removeSelection')}</button></div>}
            {preview && p.file && <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 sm:p-4">
              <iframe src={preview} title={p.file.name} className="h-80 w-full rounded-lg border border-slate-200" />
              <a href={preview} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-bold text-blue-700 underline underline-offset-4">{t('openPreview')}</a>
            </div>}
            {p.sending && <div className="mt-5" role="status" aria-live="polite"><progress className="w-full accent-slate-900" max={100} value={p.progress} aria-label={t('sending')} /><p className="mt-1 text-sm">{t(state === 'checking' ? 'checking' : 'sending')}</p></div>}
            <button className="mt-7 w-full rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-gold hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
              disabled={!p.file || p.sending || !!fileProblem(p.file, o.presentationType)} onClick={p.onSubmit}>{t(p.error === 'PRESENTATION_NETWORK_UNKNOWN' ? 'retryUpload' : 'submit')}</button>
          </> : <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm font-medium leading-relaxed text-slate-600" role="status">{t.has(block) ? t(block) : t('loadError')}</p>}
          {p.error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{t.has(`errors.${p.error}`) ? t(`errors.${p.error}`, { maxMB, pageRule }) : t('uploadError')}</p>}
        </section>
      </div>
    </div>
  </main>;
}
