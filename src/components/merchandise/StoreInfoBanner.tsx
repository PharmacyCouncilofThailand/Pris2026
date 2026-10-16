import type { StoreDto } from "@/types/merchandise";
import {
  formatMerchandiseTime,
  shippingFeeLabel,
} from "@/lib/merchandiseFormat";
import { unavailableMessage } from "@/lib/merchandiseSelection";

export function StoreInfoBanner({ store }: { store: StoreDto }) {
  const lines: { text: string; status?: boolean }[] = [];
  if (store.state === "open" && store.closesAt)
    lines.push({ text: `ปิดรับ ${formatMerchandiseTime(store.closesAt)}` });
  if (store.state !== "open")
    lines.push({
      text: unavailableMessage("STORE_NOT_OPEN", store.state),
      status: true,
    });
  if (store.state === "not_open" && store.opensAt)
    lines.push({ text: `เปิดรับ ${formatMerchandiseTime(store.opensAt)}` });
  lines.push({ text: shippingFeeLabel(store.shippingBaht) });
  if (store.shippingInfoTh) lines.push({ text: store.shippingInfoTh });
  if (store.productionInfoTh) lines.push({ text: store.productionInfoTh });
  return (
    <section className="merch-store-info" aria-label="ข้อมูลการสั่งซื้อ">
      <h2>พรีออเดอร์ของที่ระลึก PRIS 2026</h2>
      {lines.map((line, i) => (
        <p key={i} role={line.status ? "status" : undefined}>
          {line.text}
        </p>
      ))}
    </section>
  );
}
