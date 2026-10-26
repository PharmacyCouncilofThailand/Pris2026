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
  const highlighted = item.presentationType === "highlighted-poster";

  return (
    <article className={styles.card} data-type={highlighted ? "highlighted" : "poster"}>
      <div className={styles.cardThumb}>
        {item.file ? (
          <PosterImage file={item.file} variant="thumb" alt={item.title} />
        ) : (
          <div className={styles.cardThumbEmpty} aria-hidden="true" />
        )}
      </div>
      <div className={styles.cardBody}>
        <p className={styles.typeBadge} data-type={highlighted ? "highlighted" : "poster"}>
          {highlighted ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
            </svg>
          ) : null}
          {highlighted ? t("typeHighlighted") : t("typePoster")}
        </p>
        <div className={styles.cardId}>{item.trackingId}</div>
        <h2 className={styles.cardTitle}>{item.title}</h2>
        {byline ? <p className={styles.cardBy}>{byline}</p> : null}
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
