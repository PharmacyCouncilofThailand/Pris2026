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
            <button type="button" className={styles.viewButton} onClick={onView}>
              {t("view")}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </button>
          ) : (
            <p className={styles.noFile}>{t("noFile")}</p>
          )}
        </div>
      </div>
    </article>
  );
}
