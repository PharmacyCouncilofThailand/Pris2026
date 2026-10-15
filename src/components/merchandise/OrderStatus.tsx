import type { OrderSummary } from "@/types/merchandise";
export default function OrderStatus({ order }: { order: OrderSummary }) {
  return (
    <div className="merch-order-statuses" aria-label="สถานะคำสั่งซื้อ">
      <span
        className={
          order.paymentStatus === "paid"
            ? "merch-status-paid"
            : "merch-status-neutral"
        }
      >
        {order.paymentStatus === "paid" ? "ชำระเงินสำเร็จ" : "รอชำระเงิน"}
      </span>
      <span
        className={
          order.fulfillment.status === "shipped"
            ? "merch-status-shipped"
            : "merch-status-neutral"
        }
      >
        {order.fulfillment.status === "shipped"
          ? "จัดส่งแล้ว"
          : order.paymentStatus === "paid"
            ? "รอจัดส่ง"
            : "ยังไม่พร้อมจัดส่ง"}
      </span>
    </div>
  );
}
