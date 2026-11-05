/* eslint-disable @next/next/no-img-element -- Public Drive thumbnails and canvas blob URLs bypass image optimization. */
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import type { AwardFile } from "@/types/awards";
import { renderPdfFirstPage } from "@/components/poster-kiosk/pdfFirstPage";

function PdfImage({
  file,
  title,
  expanded,
  onError,
}: {
  file: AwardFile;
  title: string;
  expanded: boolean;
  onError: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const t = useTranslations("awards");
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    renderPdfFirstPage(
      file.url,
      expanded ? 1200 : 400,
      controller.signal,
      file.version,
    ).then(
      (blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      },
      () => {
        if (!controller.signal.aborted) onError();
      },
    );
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // The parent keys this component by file URL/version; callback identity is not a file change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.url, file.version, expanded]);
  return src ? (
    <img src={src} alt={title} onError={onError} />
  ) : (
    <span className="aw-thumbnail-status" role="status">
      {t("loadingPreview")}
    </span>
  );
}

export function AwardThumbnail({
  file,
  title,
  expanded = false,
}: {
  file: AwardFile | null;
  title: string;
  expanded?: boolean;
}) {
  const t = useTranslations("awards");
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(expanded);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [near]);
  return (
    <div
      ref={ref}
      className={`aw-thumbnail${expanded ? " aw-thumbnail-expanded" : ""}`}
    >
      {!file || failed ? (
        <span className="aw-thumbnail-status">
          <FileText aria-hidden="true" />
          <span>{t(file ? "noPreview" : "fileUnavailable")}</span>
        </span>
      ) : near ? (
        file.previewUrl ? (
          <img
            src={file.previewUrl}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        ) : (
          <PdfImage
            file={file}
            title={title}
            expanded={expanded}
            onError={() => setFailed(true)}
          />
        )
      ) : null}
    </div>
  );
}
