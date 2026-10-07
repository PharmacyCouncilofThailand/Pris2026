'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

export function PosterConfirmDialog({ fileName, onConfirm, onClose }: {
  fileName: string; onConfirm: () => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null), t = useTranslations('poster');
  useEffect(() => {
    const dialog = ref.current, previous = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  return <dialog ref={ref} onCancel={event => { event.preventDefault(); onClose(); }}
    aria-labelledby="poster-confirm-title" aria-describedby="poster-confirm-notice"
    className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-[2rem] border border-slate-100 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm sm:rounded-[2.5rem] sm:p-10">
    <h2 id="poster-confirm-title" className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{t('confirmTitle')}</h2>
    <p id="poster-confirm-notice" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">{t('confirmNotice')}</p>
    <p className="mt-6 break-all rounded-2xl bg-slate-50 p-4 text-sm font-medium"><span className="text-slate-500">{t('file')}: </span>{fileName}</p>
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
      <button autoFocus onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 px-5 py-4 text-sm font-bold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4">{t('checkAgain')}</button>
      <button onClick={onConfirm} className="flex-1 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-gold hover:text-black motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4">{t('confirmSubmit')}</button>
    </div>
  </dialog>;
}
