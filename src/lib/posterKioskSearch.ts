import type { PosterKioskItem } from "@/types/presentations";

export const POSTER_SEARCH_LIMIT = 20;

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export type PosterSearchResult =
  | { status: "short" }
  | { status: "none" }
  | { status: "found"; items: PosterKioskItem[]; total: number };

const compact = (value: string) =>
  normalizeSearchText(value).replace(/[\s-]/g, "");

export function searchPosters(
  items: PosterKioskItem[],
  query: string,
): PosterSearchResult {
  const text = normalizeSearchText(query);
  if (text.length < 2) return { status: "short" };
  const tracking = compact(query);

  const ranked: { item: PosterKioskItem; rank: number; index: number }[] = [];
  items.forEach((item, index) => {
    const id = compact(item.trackingId);
    let rank = -1;
    if (tracking && id === tracking) rank = 0;
    else if (tracking && id.includes(tracking)) rank = 1;
    else if (
      [item.title, item.submitterName].some(
        (field) => field && normalizeSearchText(field).includes(text),
      )
    )
      rank = 2;
    if (rank >= 0) ranked.push({ item, rank, index });
  });

  if (ranked.length === 0) return { status: "none" };
  ranked.sort((a, b) => a.rank - b.rank || a.index - b.index);
  return {
    status: "found",
    items: ranked.slice(0, POSTER_SEARCH_LIMIT).map((r) => r.item),
    total: ranked.length,
  };
}
