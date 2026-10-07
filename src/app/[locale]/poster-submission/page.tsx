'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { posterReturnPath } from '@/lib/localizedRedirect';
import { getOwnerPoster, uploadPoster, PosterApiError } from '@/lib/posterApi';
import { fileProblem, selectPosterFile, type PosterFileSelection } from '@/lib/posterSubmissionState';
import type { OwnerPosterDto, UploadDto } from '@/types/posters';
import { PosterWorkspace } from '@/components/posters/PosterWorkspace';
import { PosterSuccessDialog } from '@/components/posters/PosterSuccessDialog';
import { PosterConfirmDialog } from '@/components/posters/PosterConfirmDialog';

const panelClass = 'min-h-[60vh] bg-[#fafafa] px-6 pb-20 pt-32 text-slate-900';
const buttonClass = 'mt-5 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-gold hover:text-black motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4';

function OwnerSubmission({ token, abstractId, requestId, returnPath }: { token: string; abstractId: number; requestId?: string; returnPath: string }) {
  const t = useTranslations('poster'), router = useRouter(), { logout } = useAuth();
  const [owner, setOwner] = useState<OwnerPosterDto | null>(null), [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PosterFileSelection | null>(null), [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0), [receipt, setReceipt] = useState<UploadDto | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const uploadController = useRef<AbortController | null>(null), busy = useRef(false);
  const uncertainAttempt = useRef<{ previousUploadId: string | null; requestId: string | null } | null>(null);
  const acceptOwner = useCallback((value: OwnerPosterDto) => {
    setOwner(value);
    const attempt = uncertainAttempt.current;
    const confirmed = !!attempt && !!value.currentUpload && value.currentUpload.id !== attempt.previousUploadId &&
      value.currentUpload.revisionRequestId === attempt.requestId;
    if (confirmed) { uncertainAttempt.current = null; setSelected(null); }
    setError(previous => previous === 'POSTER_LOAD_FAILED' || (confirmed && previous === 'POSTER_NETWORK_UNKNOWN') ? null : previous);
  }, []);
  useEffect(() => {
    let active = true, controller = new AbortController();
    const load = () => {
      if (busy.current) return;
      controller.abort(); controller = new AbortController();
      const signal = controller.signal;
      getOwnerPoster(token, abstractId, requestId, signal).then(value => {
        if (active && !signal.aborted) acceptOwner(value);
      }).catch(failure => {
        if (!active || signal.aborted) return;
        if (failure instanceof PosterApiError && failure.status === 401) { logout(); router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`); return; }
        const code = failure instanceof PosterApiError ? failure.code : 'POSTER_LOAD_FAILED';
        if (code === 'POSTER_OWNER_REQUIRED') setOwner(null);
        setError(code);
      });
    };
    load();
    const visible = () => { if (document.visibilityState === 'visible') load(); };
    window.addEventListener('focus', load); document.addEventListener('visibilitychange', visible);
    return () => { active = false; controller.abort(); uploadController.current?.abort(); window.removeEventListener('focus', load); document.removeEventListener('visibilitychange', visible); };
  }, [token, abstractId, requestId, returnPath, logout, router, acceptOwner]);
  const login = () => { logout(); router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`); };
  if (error === 'POSTER_OWNER_REQUIRED') return <main className={panelClass}><div className="mx-auto max-w-2xl"><p role="alert">{t('ownerRequired')}</p><button className={buttonClass} onClick={login}>{t('switchAccount')}</button></div></main>;
  if (!owner) return <main className={panelClass}><div className="mx-auto max-w-2xl"><p role={error ? 'alert' : 'status'}>{error ? t('loadError') : t('loading')}</p>{error && <button className={buttonClass} onClick={() => window.location.reload()}>{t('retry')}</button>}</div></main>;
  const select = (file: File | null) => {
    if (busy.current) return;
    uncertainAttempt.current = null;
    setConfirmOpen(false);
    setSelected(file ? selectPosterFile(file) : null); setReceipt(null); setProgress(0); setError(file ? fileProblem(file) : null);
  };
  const submit = async () => {
    if (!selected || !owner.canUpload || busy.current || fileProblem(selected.file)) return;
    setConfirmOpen(false);
    busy.current = true; setSending(true); setError(null); setProgress(0);
    const controller = new AbortController(); uploadController.current = controller;
    try {
      const result = await uploadPoster({ token, abstractId, requestId: owner.selectedRequest?.status === 'open' ? owner.selectedRequest.id : null,
        ...selected, signal: controller.signal, onProgress: value => { if (!controller.signal.aborted) setProgress(value); } });
      if (controller.signal.aborted) return;
      setReceipt(result.upload); setSelected(null);
      setOwner({ ...owner, canUpload: false, blockCode: 'POSTER_ALREADY_SUBMITTED', mode: 'locked', currentUpload: result.upload,
        uploads: [result.upload, ...owner.uploads.filter(u => u.id !== result.upload.id)] });
    } catch (failure) {
      if (controller.signal.aborted) return;
      if (failure instanceof PosterApiError && failure.status === 401) { login(); return; }
      const code = failure instanceof PosterApiError ? failure.code : 'POSTER_UPLOAD_FAILED';
      if (code === 'POSTER_NETWORK_UNKNOWN') uncertainAttempt.current = {
        previousUploadId: owner.currentUpload?.id ?? null,
        requestId: owner.selectedRequest?.status === 'open' ? owner.selectedRequest.id : null,
      };
      if (code === 'POSTER_OWNER_REQUIRED') setOwner(null);
      setError(code);
      // Keep the original File/key after uncertainty; reading status never creates a receipt.
    } finally {
      if (!controller.signal.aborted) {
        try { const latest = await getOwnerPoster(token, abstractId, requestId, controller.signal); if (!controller.signal.aborted) acceptOwner(latest); }
        catch (failure) { if (!controller.signal.aborted && failure instanceof PosterApiError && failure.code === 'POSTER_OWNER_REQUIRED') { setOwner(null); setError(failure.code); } }
        if (!controller.signal.aborted) { busy.current = false; setSending(false); }
      }
    }
  };
  return <><PosterWorkspace owner={owner} file={selected?.file ?? null} onFile={select} onSubmit={() => setConfirmOpen(true)} sending={sending} progress={progress} error={error} />
    {confirmOpen && selected && owner.canUpload && !sending && <PosterConfirmDialog fileName={selected.file.name} onConfirm={submit} onClose={() => setConfirmOpen(false)} />}
    {receipt && <PosterSuccessDialog owner={owner} upload={receipt} onClose={() => setReceipt(null)} />}</>;
}

function PosterPageContent() {
  const query = useSearchParams(), router = useRouter(), t = useTranslations('poster'), { token } = useAuth();
  const returnPath = posterReturnPath(`?${query}`);
  useEffect(() => { if (returnPath && !token) router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`); }, [returnPath, token, router]);
  if (!returnPath) return <main className={panelClass}><p role="alert">{t('invalidLink')}</p></main>;
  if (!token) return <main className={panelClass}><p>{t('loginRequired')}</p><button className={buttonClass} onClick={() => router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`)}>{t('login')}</button></main>;
  // Remount on account/work/request changes so previous owner's files and receipts cannot linger.
  return <OwnerSubmission key={`${token}:${returnPath}`} token={token} abstractId={Number(query.get('abstractId'))} requestId={query.get('requestId') ?? undefined} returnPath={returnPath} />;
}
export default function PosterSubmissionPage() {
  return <Suspense fallback={<main className={panelClass} aria-busy="true" />}><PosterPageContent /></Suspense>;
}
