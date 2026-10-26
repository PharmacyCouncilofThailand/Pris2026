"use client";

import { useTranslations } from "next-intl";
import type { PosterKioskItem } from "@/types/presentations";
import { PosterImage } from "./PosterImage";
import styles from "./posterKiosk.module.css";

export function PosterResultCard({
  item,
  onView,
}: {
  item: PosterKioskItem;
  onView: () => void;
}) {
  const t = useTranslations("posterKiosk");
  const byline = [item.submitterName, item.affiliation].filter(Boolean).join(" · ");
  const type =
    item.presentationType === "highlighted-poster" ? t("typeHighlighted") : t("typePoster");

  return (
    <article className={styles.card}>
      <div className={styles.cardThumb}>
        {item.file ? (
          <PosterImage file={item.file} variant="thumb" alt={item.title} />
        ) : (
          <div className={styles.cardThumbEmpty} aria-hidden="true" />
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardId}>{item.trackingId}</div>
        <h2 className={styles.cardTitle}>{item.title}</h2>
        {byline ? <p className={styles.cardBy}>{byline}</p> : null}
        <p className={styles.cardType}>{type}</p>
        <div className={styles.cardGo}>
          {item.file ? (
            <button type="button" className={`${styles.ctaBtn} ${styles.viewButton}`} onClick={onView}>
              {t("view")}
              <span className={styles.chip} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
            </button>
          ) : (
            <p className={styles.noFile}>{t("noFile")}</p>
          )}
        </div>
      </div>
    </article>
  );
}
