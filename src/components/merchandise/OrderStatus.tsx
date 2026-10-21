import type { OrderSummary } from "@/types/merchandise";
import { formatMerchandiseTime } from "@/lib/merchandiseFormat";

const PAYMENT = {
  pending: ["รอชำระเงิน", "merch-status-neutral"],
  paid: ["ชำระแล้ว", "merch-status-paid"],
  expired: ["หมดเวลาชำระ", "merch-status-neutral"],
} as const;

// Payment and delivery are independent facts: never derive one from the other.
export default function OrderStatus({ order }: { order: OrderSummary }) {
  const [paymentText, paymentClass] = PAYMENT[order.paymentStatus];
  const { shipping } = order;
  const shipped = shipping.status === "shipped";
  return (
    <>
      <div className="merch-order-statuses">
        <span className={paymentClass}>{paymentText}</span>
        <span
          className={shipped ? "merch-status-shipped" : "merch-status-neutral"}
        >
          {shipped ? "จัดส่งแล้ว" : "ยังไม่จัดส่ง"}
        </span>
      </div>
      {shipped && (shipping.carrier || shipping.trackingId) && (
        <p className="merch-history-tracking">
          {shipping.carrier}
          {shipping.carrier && shipping.trackingId && " · "}
          {shipping.trackingId && <span>เลขพัสดุ {shipping.trackingId}</span>}
          {shipping.shippedAt && (
            <> · ส่งเมื่อ {formatMerchandiseTime(shipping.shippedAt)}</>
          )}
        </p>
      )}
    </>
  );
}
