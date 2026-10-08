export type HealthHackGroup = "" | "lower" | "upper" | "undergraduate";
export const HEALTH_HACK_GRADES = {
  lower: ["m1", "m2", "m3"],
  upper: ["m4", "m5", "m6"],
} as const;

export function getHealthHackLevel(
  group: HealthHackGroup,
  grade: string,
): string {
  if (group === "undergraduate") return "undergraduate";
  if (group !== "lower" && group !== "upper") return "";
  return HEALTH_HACK_GRADES[group].some((value) => value === grade)
    ? grade
    : "";
}
