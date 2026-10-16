"use client";
import { Check, Truck } from "lucide-react";
import { formatMerchandiseTime } from "@/lib/merchandiseFormat";
import type { OrderDetail } from "@/types/merchandise";

export default function PaidOrder({ order }: { order: OrderDetail }) {
  const { shipping } = order;
  const shipped = shipping.status === "shipped";
  return (
    <>
      <section className="merch-paid-thanks" aria-labelledby="merch-paid-title">
        <span className="merch-paid-icon">
          <Check size={32} aria-hidden="true" />
        </span>
        <h2 id="merch-paid-title">ชำระเงินสำเร็จ</h2>
        {order.paidAt && (
          <p className="merch-cart-muted">
            ชำระเงินเมื่อ{" "}
            <time dateTime={order.paidAt}>
              {formatMerchandiseTime(order.paidAt)}
            </time>{" "}
            (เวลาไทย)
          </p>
        )}
      </section>
      <section className="merch-order-delivery" aria-label="สถานะจัดส่ง">
        <h2>
          <Truck size={20} aria-hidden="true" />
          {shipped ? "จัดส่งแล้ว" : "ยังไม่จัดส่ง"}
        </h2>
        {shipped && (
          <>
            {shipping.carrier && <p>{shipping.carrier}</p>}
            {shipping.trackingId && (
              <>
                <p className="merch-cart-muted">เลขติดตามพัสดุ</p>
                <p className="merch-tracking">
                  <strong>{shipping.trackingId}</strong>
                </p>
              </>
            )}
            {shipping.shippedAt && (
              <p className="merch-cart-muted">
                จัดส่งเมื่อ{" "}
                <time dateTime={shipping.shippedAt}>
                  {formatMerchandiseTime(shipping.shippedAt)}
                </time>{" "}
                (เวลาไทย)
              </p>
            )}
          </>
        )}
      </section>
      <p className="merch-order-unboxing">
        กรุณาถ่ายวิดีโอขณะแกะพัสดุ เพื่อใช้เป็นหลักฐานหากพบสินค้าเสียหาย
        หากพบปัญหา กรุณาติดต่อ{" "}
        <a
          href={`mailto:pr@pharmacycouncil.org?subject=${encodeURIComponent(`คำสั่งซื้อ ${order.orderNumber}`)}`}
        >
          pr@pharmacycouncil.org
        </a>{" "}
        พร้อมเลขคำสั่งซื้อและหลักฐานที่เกี่ยวข้อง
      </p>
    </>
  );
}
