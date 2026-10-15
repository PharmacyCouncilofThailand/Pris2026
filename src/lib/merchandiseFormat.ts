export const isMinor = (value: unknown): value is string =>
  typeof value === "string" && /^(0|[1-9][0-9]{0,29})$/.test(value);
export function isIsoUtc(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)
  )
    return false;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return false;
  const normalized = value.replace(
    /(?:\.(\d{1,3}))?Z$/,
    (_, fraction: string | undefined) =>
      "." + (fraction ?? "").padEnd(3, "0") + "Z",
  );
  return new Date(milliseconds).toISOString() === normalized;
}
export function formatMinorBaht(value: string): string {
  if (!isMinor(value)) throw new Error("Invalid minor amount");
  const amount = BigInt(value),
    whole = (amount / BigInt(100))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `฿${whole}.${(amount % BigInt(100)).toString().padStart(2, "0")}`;
}
export function formatMerchandiseTime(value: string | null): string {
  if (value === null) return "—";
  if (!isIsoUtc(value)) throw new Error("Invalid UTC instant");
  return new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
