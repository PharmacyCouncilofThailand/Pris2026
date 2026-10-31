import type { PosterKioskItem } from "@/types/presentations";

const FORBIDDEN = /[\\/:*?"<>|\u0000-\u001f]+/g;
const TITLE_MAX = 100;

export function cleanFileNamePart(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFC")
    .replace(FORBIDDEN, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function posterFileExtension(mimeType: string): "pdf" | "png" {
  return mimeType === "application/pdf" ? "pdf" : "png";
}

/** `{trackingId}_{title}_{submitterName}.{ext}`, safe on Windows, macOS and Linux. */
export function posterDownloadName(
  item: Pick<PosterKioskItem, "trackingId" | "title" | "submitterName"> & {
    file: { mimeType: string };
  },
): string {
  const title = Array.from(cleanFileNamePart(item.title))
    .slice(0, TITLE_MAX)
    .join("")
    .replace(/[. ]+$/, "");
  const base = [
    cleanFileNamePart(item.trackingId),
    title,
    cleanFileNamePart(item.submitterName),
  ]
    .filter(Boolean)
    .join("_");
  return `${base || "poster"}.${posterFileExtension(item.file.mimeType)}`;
}

/** Same-origin link that streams the file with the download name set by the server. */
export function posterDownloadHref(
  item: Pick<PosterKioskItem, "trackingId" | "title" | "submitterName"> & {
    file: { url: string; mimeType: string };
  },
): string {
  const params = new URLSearchParams({
    url: item.file.url,
    name: posterDownloadName(item),
  });
  return `/api/poster-kiosk/download?${params}`;
}
