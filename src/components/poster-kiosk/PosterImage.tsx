"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { PosterKioskFile } from "@/types/presentations";
import { renderPdfFirstPage } from "./pdfFirstPage";

type PosterImageProps = {
  file: PosterKioskFile;
  variant: "thumb" | "full";
  alt: string;
  onError?: () => void;
  onLoad?: () => void;
};

const THUMB_WIDTH = 400;
const FULL_WIDTH = 2160;
const ASPECT = 9 / 16;

const boxStyle = { width: "100%", height: "100%", objectFit: "contain" } as const;
const wrapperStyle = { aspectRatio: "9 / 16", width: "100%" } as const;

function PdfPoster({ file, variant, alt, onError, onLoad }: PosterImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const width =
      variant === "thumb"
        ? THUMB_WIDTH
        : Math.min(FULL_WIDTH, Math.round(window.innerWidth * window.devicePixelRatio));
    setSrc(null);
    renderPdfFirstPage(file.url, width, controller.signal).then(
      (objectUrl) => {
        if (!controller.signal.aborted) setSrc(objectUrl);
      },
      () => {
        if (!controller.signal.aborted) onError?.();
      },
    );
    return () => controller.abort();
    // onError is intentionally excluded: a changing callback must not restart the render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.url, variant]);

  return (
    <div style={wrapperStyle}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} style={boxStyle} onLoad={onLoad} onError={onError} />
      ) : null}
    </div>
  );
}

export function PosterImage(props: PosterImageProps) {
  const { file, variant, alt, onError, onLoad } = props;
  if (file.mimeType === "application/pdf") return <PdfPoster {...props} />;

  const width = variant === "thumb" ? THUMB_WIDTH : FULL_WIDTH;
  return (
    <div style={wrapperStyle}>
      <Image
        src={file.url}
        alt={alt}
        width={width}
        height={Math.round(width / ASPECT)}
        quality={85}
        sizes={variant === "full" ? "(orientation: portrait) 100vw" : undefined}
        style={boxStyle}
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
}
