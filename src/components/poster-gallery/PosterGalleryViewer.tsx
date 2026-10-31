"use client";

import { ChevronLeft, ChevronRight, Download, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { PosterImage } from "@/components/poster-kiosk/PosterImage";
import { posterDownloadHref } from "@/lib/posterDownloadName";
import type { GalleryPoster } from "@/lib/posterGalleryFilter";

type Props = {
  item: GalleryPoster;
  position: number;
  total: number;
  onClose: () => void;
  onStep: (step: -1 | 1) => void;
};

const roundBtn =
  "grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-35 disabled:hover:bg-white/10 cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const downloadBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-bold text-white transition hover:bg-orange-700 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function PosterStage({ item }: { item: GalleryPoster }) {
  const t = useTranslations("posterGallery");
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-[9/16] h-[min(100cqh,calc(100cqw*16/9))] overflow-hidden rounded-md bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-500">
      {failed ? (
        <p
          role="alert"
          className="grid h-full place-items-center p-6 text-center text-sm text-slate-600"
        >
          {t("fileError")}
        </p>
      ) : (
        <PosterImage
          file={item.file}
          variant="full"
          alt={item.title}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {!loaded && !failed && (
        <p
          role="status"
          className="absolute inset-0 grid place-items-center bg-white text-sm text-slate-500"
        >
          {t("loadingPoster")}
        </p>
      )}
    </div>
  );
}

export function PosterGalleryViewer({
  item,
  position,
  total,
  onClose,
  onStep,
}: Props) {
  const t = useTranslations("posterGallery");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const unmountingRef = useRef(false);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    unmountingRef.current = false;
    if (!dialog.open) dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      unmountingRef.current = true;
      document.documentElement.style.overflow = "";
      if (dialog.open) dialog.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  const highlighted = item.presentationType === "highlighted-poster";
  const href = posterDownloadHref(item);
  const author = [item.submitterName, item.affiliation]
    .filter(Boolean)
    .join(", ");

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="poster-gallery-title"
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-[#050a1c]/95 p-0 text-white backdrop:bg-[#050a1c]/70 backdrop:backdrop-blur-sm open:grid open:grid-cols-[minmax(0,1fr)] open:grid-rows-[auto_1fr_auto] sm:open:grid-rows-[auto_1fr] animate-in fade-in duration-300"
      onCancel={(e) => {
        e.preventDefault();
        onCloseRef.current();
      }}
      onClose={() => {
        if (!unmountingRef.current && !dialogRef.current?.open)
          onCloseRef.current();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onStep(-1);
        if (e.key === "ArrowRight") onStep(1);
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="flex items-center gap-3 border-b border-white/10 py-3 pl-4 pr-3 sm:gap-5 sm:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 font-mono text-xs font-semibold tabular-nums text-blue-300">
            <span>{item.trackingId}</span>
            {highlighted && (
              <span className="inline-flex items-center gap-1 font-sans text-orange-300">
                <Star className="size-3 fill-current" aria-hidden="true" />
                {t("typeHighlighted")}
              </span>
            )}
            <span className="font-sans text-white/50">
              {t("viewerCount", { current: position + 1, total })}
            </span>
          </div>
          <h2
            id="poster-gallery-title"
            className="mt-0.5 line-clamp-2 text-[15px] font-bold leading-snug sm:truncate sm:text-lg"
          >
            {item.title}
          </h2>
          {author && (
            <p className="truncate text-[13px] text-white/65">{author}</p>
          )}
        </div>
        <a href={href} download className={`${downloadBtn} max-sm:hidden`}>
          <Download className="size-[18px]" aria-hidden="true" />
          {t("download")}
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className={roundBtn}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div
        className="relative grid min-h-0 place-items-center [container-type:size] p-3 pb-[68px] sm:px-20 sm:py-6"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <PosterStage key={item.trackingId} item={item} />
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={position === 0}
          aria-label={t("previous")}
          className={`${roundBtn} absolute bottom-3 left-3 sm:bottom-auto sm:left-5 sm:top-1/2 sm:-translate-y-1/2`}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={position === total - 1}
          aria-label={t("next")}
          className={`${roundBtn} absolute bottom-3 right-3 sm:bottom-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2`}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="border-t border-white/10 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:hidden">
        <a href={href} download className={`${downloadBtn} w-full min-h-12`}>
          <Download className="size-[18px]" aria-hidden="true" />
          {t("download")}
        </a>
      </div>
    </dialog>
  );
}
