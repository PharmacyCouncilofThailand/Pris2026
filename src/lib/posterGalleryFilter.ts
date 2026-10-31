import type { PosterKioskFile, PosterKioskItem } from "@/types/presentations";

export type PosterTypeFilter = "all" | PosterKioskItem["presentationType"];
export type GalleryPoster = PosterKioskItem & { file: PosterKioskFile };

/** The gallery lists only works that have an uploaded file. */
export function galleryPosters(items: PosterKioskItem[]): GalleryPoster[] {
  return items.filter((item): item is GalleryPoster => item.file !== null);
}

export type GalleryFilter = { type: PosterTypeFilter; category: string };
export const ALL_CATEGORIES = "all";

const byType = (item: PosterKioskItem, type: PosterTypeFilter) =>
  type === "all" || item.presentationType === type;
const byCategory = (item: PosterKioskItem, category: string) =>
  category === ALL_CATEGORIES || item.categoryName === category;

export function filterGallery(
  items: GalleryPoster[],
  filter: GalleryFilter,
): GalleryPoster[] {
  return items.filter(
    (i) => byType(i, filter.type) && byCategory(i, filter.category),
  );
}

/** Type-tab counts follow the chosen category; category counts follow the chosen type. */
export function galleryCounts(items: GalleryPoster[], filter: GalleryFilter) {
  const inCategory = items.filter((i) => byCategory(i, filter.category));
  const inType = items.filter((i) => byType(i, filter.type));
  const categories = new Map<string, number>();
  for (const item of inType)
    categories.set(
      item.categoryName,
      (categories.get(item.categoryName) ?? 0) + 1,
    );
  return {
    types: {
      all: inCategory.length,
      poster: inCategory.filter((i) => i.presentationType === "poster").length,
      "highlighted-poster": inCategory.filter(
        (i) => i.presentationType === "highlighted-poster",
      ).length,
    } satisfies Record<PosterTypeFilter, number>,
    categories,
    categoryTotal: inType.length,
  };
}

/** Every category present in the roster, so an empty one still shows (disabled) in the list. */
export function galleryCategories(items: GalleryPoster[]): string[] {
  return [...new Set(items.map((i) => i.categoryName))].sort((a, b) =>
    a.localeCompare(b, "th"),
  );
}
