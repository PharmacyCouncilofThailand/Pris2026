'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { OwnerPresentationDto, UploadDto } from '@/types/presentations';

export function PresentationSuccessDialog({ upload, owner, onClose }: { upload: UploadDto; owner: OwnerPresentationDto; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null), t = useTranslations('presentation'), locale = useLocale();
  useEffect(() => {
    const dialog = ref.current, previous = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected && previous !== document.body) previous.focus();
      else document.getElementById('presentation-upload')?.focus();
    };
  }, []);
  const received = new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'long', timeStyle: 'medium', timeZone: 'Asia/Bangkok',
  }).format(new Date(upload.receivedAt));
  return <dialog ref={ref} onCancel={e => { e.preventDefault(); onClose(); }} aria-labelledby="presentation-receipt-title"
    className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-[2rem] border border-slate-100 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm sm:rounded-[2.5rem] sm:p-10">
    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"><CheckCircle2 size={32} aria-hidden="true" className="text-emerald-500" /></div>
    <h2 id="presentation-receipt-title" className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{t('received')}</h2>
    <dl className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-5 text-sm"><div><dt className="mb-1 text-xs font-bold text-slate-500">{t('tracking')}</dt><dd>{owner.trackingId}</dd></div>
      <div><dt className="mb-1 text-xs font-bold text-slate-500">{t('work')}</dt><dd className="break-words">{owner.title}</dd></div><div><dt className="mb-1 text-xs font-bold text-slate-500">{t('file')}</dt><dd className="break-all">{upload.fileName}</dd></div>
      <div><dt className="mb-1 text-xs font-bold text-slate-500">{t('receivedAt')}</dt><dd>{received} {t('thaiTime')}</dd></div></dl>
    <a href={upload.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm font-bold text-blue-700 underline underline-offset-4">{t('viewFile')}</a>
    <p className="mt-5 text-sm leading-relaxed text-slate-600">{t('receiptNotice')}</p>
    <button autoFocus onClick={onClose} className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-gold hover:text-black motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4">{t('close')}</button>
  </dialog>;
}
