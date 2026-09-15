export type AcceptedPresentationType =
  | "oral"
  | "highlighted-poster"
  | "poster";

export interface AcceptedAbstract {
  id: number;
  sequence?: number;
  trackingId: string | null;
  title: string;
  presentationType: AcceptedPresentationType;
  categoryId: number;
  categoryName: string;
  submitterName: string | null;
  affiliation: string | null;
  round?: number;
}

export interface DistinctCategory {
  id: number;
  name: string;
}

export interface AcceptedAbstractFilterOptions {
  search?: string;
  presentationType?: "all" | AcceptedPresentationType;
  categoryId?: number | "all" | string;
  round?: "all" | 1 | 2 | string | number;
}

/**
 * Filter accepted abstracts by search query, presentation type, category ID, and round.
 * All criteria are combined using AND logic while preserving original array order.
 */
export function filterAcceptedAbstracts(
  abstracts: AcceptedAbstract[],
  options: AcceptedAbstractFilterOptions = {},
): AcceptedAbstract[] {
  const normalizedQuery = (options.search || "").trim().toLowerCase();
  const targetType = (options.presentationType || "all").toLowerCase();
  const targetCategoryId =
    options.categoryId === "all" || options.categoryId === undefined || options.categoryId === ""
      ? "all"
      : Number(options.categoryId);
  const targetRound =
    options.round === "all" || options.round === undefined || options.round === ""
      ? "all"
      : Number(options.round);

  return abstracts.filter((item) => {
    // 1. Presentation Type filter
    if (targetType !== "all") {
      if (item.presentationType.toLowerCase() !== targetType) {
        return false;
      }
    }

    // 2. Category ID filter
    if (targetCategoryId !== "all") {
      if (item.categoryId !== targetCategoryId) {
        return false;
      }
    }

    // 3. Round filter
    const itemRound = item.round ?? 1;
    if (targetRound !== "all") {
      if (itemRound !== targetRound) {
        return false;
      }
    }

    // 4. Text Search filter
    if (normalizedQuery) {
      const roundSearchText =
        itemRound === 1
          ? "round 1 รอบ 1 รอบที่ 1"
          : itemRound === 2
            ? "round 2 รอบ 2 รอบที่ 2"
            : "";

      const searchable = [
        item.trackingId || "",
        item.title || "",
        item.submitterName || "",
        item.affiliation || "",
        item.categoryName || "",
        item.presentationType || "",
        roundSearchText,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchable.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extract distinct categories from the full accepted abstracts response,
 * sorted ascending by category ID.
 */
export function extractDistinctCategories(
  abstracts: AcceptedAbstract[],
): DistinctCategory[] {
  const categoryMap = new Map<number, string>();

  for (const item of abstracts) {
    if (item.categoryId && !categoryMap.has(item.categoryId)) {
      categoryMap.set(item.categoryId, item.categoryName);
    }
  }

  const list: DistinctCategory[] = Array.from(categoryMap.entries()).map(
    ([id, name]) => ({ id, name }),
  );

  return list.sort((a, b) => a.id - b.id);
}
