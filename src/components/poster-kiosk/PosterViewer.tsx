"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PosterKioskFile, PosterKioskItem } from "@/types/presentations";
import { IdleCountdown } from "./IdleCountdown";
import { PosterImage } from "./PosterImage";
import { usePosterZoom } from "./usePosterZoom";
import styles from "./posterKiosk.module.css";

export function PosterViewer({
  item,
  countdownSeconds,
  onClose,
}: {
  item: PosterKioskItem & { file: PosterKioskFile };
  countdownSeconds: number | null;
  onClose: () => void;
}) {
  const t = useTranslations("posterKiosk");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const unmountingRef = useRef(false);
  const { stageRef, zoom, handlers } = usePosterZoom();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    unmountingRef.current = false;
    if (!dialog.open) dialog.showModal();
    return () => {
      unmountingRef.current = true;
      if (dialog.open) dialog.close();
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setFailed(true), []);
  const retry = () => {
    setFailed(false);
    setLoaded(false);
    setAttempt((n) => n + 1);
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.viewer}
      aria-label={item.title}
      onCancel={(e) => {
        e.preventDefault();
        onCloseRef.current();
      }}
      // Fallback for browsers that close the dialog without a cancel event.
      onClose={() => {
        // A stale event from our own cleanup (e.g. StrictMode remount) finds the dialog open again.
        if (!unmountingRef.current && !dialogRef.current?.open) onCloseRef.current();
      }}
    >
      <div ref={stageRef} className={styles.viewerStage} {...handlers}>
        <div
          className={styles.viewerLayer}
          style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})` }}
        >
          <div className={styles.viewerBlur} aria-hidden="true">
            <PosterImage file={item.file} variant="thumb" alt="" />
          </div>
          {failed ? null : (
            <div className={styles.viewerFull}>
              <PosterImage
                key={attempt}
                file={item.file}
                variant="full"
                alt={item.title}
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          )}
        </div>
        {!loaded && !failed ? (
          <p className={styles.viewerStatus} role="status">
            {t("loadingPoster")}
          </p>
        ) : null}
      </div>
      {failed ? (
        <div className={styles.viewerStatus} role="alert">
          <p>{t("fileError")}</p>
          <button type="button" className={styles.viewerRetry} onClick={retry}>
            {t("retry")}
          </button>
        </div>
      ) : null}
      {countdownSeconds !== null ? <IdleCountdown seconds={countdownSeconds} /> : null}
      <button type="button" className={styles.viewerClose} onClick={() => onClose()}>
        {t("close")}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </dialog>
  );
}
