'use client';

import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { OwnerPosterDto, UploadDto } from '@/types/posters';

export function PosterSuccessDialog({ upload, owner, onClose }: { upload: UploadDto; owner: OwnerPosterDto; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null), t = useTranslations('poster'), locale = useLocale();
  useEffect(() => {
    const dialog = ref.current, previous = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected && previous !== document.body) previous.focus();
      else document.getElementById('poster-upload')?.focus();
    };
  }, []);
  const received = new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'long', timeStyle: 'medium', timeZone: 'Asia/Bangkok',
  }).format(new Date(upload.receivedAt));
  return <dialog ref={ref} onCancel={e => { e.preventDefault(); onClose(); }} aria-labelledby="poster-receipt-title"
    className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-black/40">
    <h2 id="poster-receipt-title" className="text-2xl font-semibold">{t('received')}</h2>
    <dl className="mt-5 space-y-4 text-sm"><div><dt className="text-slate-500">{t('tracking')}</dt><dd>{owner.trackingId}</dd></div>
      <div><dt className="text-slate-500">{t('work')}</dt><dd className="break-words">{owner.title}</dd></div><div><dt className="text-slate-500">{t('file')}</dt><dd className="break-all">{upload.fileName}</dd></div>
      <div><dt className="text-slate-500">{t('version')}</dt><dd>{upload.version}</dd></div><div><dt className="text-slate-500">{t('receivedAt')}</dt><dd>{received} {t('thaiTime')}</dd></div></dl>
    <a href={upload.publicUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block underline">{t('viewFile')}</a>
    <p className="mt-5 text-sm leading-relaxed text-slate-600">{t('receiptNotice')}</p>
    <button autoFocus onClick={onClose} className="mt-6 w-full rounded-xl bg-[#020617] px-5 py-3 text-white hover:bg-[#ca9b52] hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4">{t('close')}</button>
  </dialog>;
}
