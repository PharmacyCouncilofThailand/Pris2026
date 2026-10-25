"use client";

import { useTranslations } from "next-intl";
import styles from "./posterKiosk.module.css";

export function IdleCountdown({ seconds }: { seconds: number }) {
  const t = useTranslations("posterKiosk");
  return (
    <div className={styles.countdown} role="status">
      {t("countdown", { seconds })}
    </div>
  );
}
