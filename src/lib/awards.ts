import type { AwardGroup, AwardItem, AwardLevel } from "@/types/awards";

export const awardGroups: AwardGroup[] = [
  "oral",
  "highlighted-poster",
  "student-oral",
];
export const awardLevels: AwardLevel[] = [
  "excellent",
  "outstanding",
  "very-good",
];
export type AwardFilters = {
  group: AwardGroup;
  category: string;
  level: AwardLevel | "all";
  query: string;
};
export function filterAwards(
  items: AwardItem[],
  filters: AwardFilters,
): AwardItem[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return items.filter(
    (r) =>
      r.group === filters.group &&
      (filters.category === "all" || r.categoryName === filters.category) &&
      (filters.level === "all" || r.awardLevel === filters.level) &&
      (!query ||
        `${r.trackingId} ${r.title} ${r.submitterName}`
          .toLocaleLowerCase()
          .includes(query)),
  );
}
