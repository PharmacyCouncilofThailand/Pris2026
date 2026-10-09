"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { presentationTemplates } from "@/data/presentationTemplates";
import styles from "./templates.module.css";

export default function TemplatePreviewDialog({
  type,
}: {
  type: "oral" | "poster";
}) {
  const t = useTranslations("presentationTemplates");
  const locale = useLocale();
  const isOral = type === "oral";
  const title = t(isOral ? "slidePreview" : "posterPreview");
  const action = t(isOral ? "openSlides" : "openPoster");

  return (
    <Dialog.Root>
      <Dialog.Trigger
        className={styles.iconLink}
        aria-label={action}
        title={action}
      >
        <Maximize2 size={18} aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.previewBackdrop} />
        <Dialog.Popup
          className={styles.previewModal}
          lang={locale}
          data-template={type}
        >
          <div className={styles.modalHeader}>
            <Dialog.Title className={styles.modalTitle}>{title}</Dialog.Title>
            <Dialog.Close
              className={styles.iconLink}
              aria-label={t("closePreview")}
              title={t("closePreview")}
            >
              <X size={22} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className={styles.modalContent} data-template={type}>
            {isOral ? (
              <iframe
                src={presentationTemplates.oral.previewUrl}
                title={title}
                className={styles.modalPowerPoint}
                allowFullScreen
              />
            ) : (
              <Image
                src={presentationTemplates.poster.previewImage}
                alt={t("posterAlt")}
                width={1219}
                height={1800}
                sizes="(max-width: 767px) 90vw, 560px"
                className={styles.posterImage}
              />
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
