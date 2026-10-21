export const isBaht = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
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
const baht = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export function formatBaht(amount: number): string {
  if (!isBaht(amount)) throw new Error("Invalid baht amount");
  return `฿${baht.format(amount)}`;
}
export function shippingFeeLabel(baht: number): string {
  return baht === 0 ? "จัดส่งฟรี" : `ค่าจัดส่ง ${formatBaht(baht)} ต่อออเดอร์`;
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
