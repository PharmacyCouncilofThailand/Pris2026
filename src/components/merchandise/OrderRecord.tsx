"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Copy, Truck } from "lucide-react";
import type { OrderDetail } from "@/types/merchandise";
import {
  formatMerchandiseTime,
  formatMinorBaht,
} from "@/lib/merchandiseFormat";
import OrderStatus from "./OrderStatus";
export function OrderDelivery({ order }: { order: OrderDetail }) {
  const scope = `${order.id}:${order.fulfillment.version}`;
  const active = useRef<string | null>(scope);
  const [copy, setCopy] = useState<{ scope: string; message: string } | null>(
    null,
  );
  useLayoutEffect(() => {
    active.current = scope;
    return () => {
      active.current = null;
    };
  }, [scope]);
  const tracking = order.fulfillment.trackingId;
  const copyTracking = async () => {
    if (!tracking) return;
    try {
      await navigator.clipboard.writeText(tracking);
      if (active.current === scope)
        setCopy({ scope, message: "คัดลอกเลขติดตามพัสดุแล้ว" });
    } catch {
      if (active.current === scope)
        setCopy({
          scope,
          message: "คัดลอกไม่สำเร็จ กรุณาเลือกและคัดลอกเลขติดตามพัสดุที่แสดง",
        });
    }
  };
  return (
    <>
      <OrderStatus order={order} />
      {order.fulfillment.status === "shipped" && (
        <section className="merch-order-delivery" aria-label="ข้อมูลจัดส่ง">
          <h2>
            <Truck size={20} aria-hidden="true" />
            ข้อมูลจัดส่ง
          </h2>
          <p>{order.fulfillment.carrier}</p>
          <p className="merch-cart-muted">เลขติดตามพัสดุ</p>
          <div className="merch-tracking">
            <strong>{tracking}</strong>
            <button
              type="button"
              onClick={() => void copyTracking()}
              aria-label="คัดลอกเลขติดตามพัสดุ"
            >
              <Copy size={20} aria-hidden="true" />
            </button>
          </div>
          {order.fulfillment.shippedAt && (
            <p className="merch-cart-muted">
              จัดส่งเมื่อ {formatMerchandiseTime(order.fulfillment.shippedAt)}{" "}
              (เวลาไทย)
            </p>
          )}
          {copy?.scope === scope && <p role="status">{copy.message}</p>}
        </section>
      )}
    </>
  );
}
export function OrderTimes({ order }: { order: OrderDetail }) {
  return (
    <div className="merch-order-times">
      <p>
        สั่งซื้อ:{" "}
        <time dateTime={order.createdAt}>
          {formatMerchandiseTime(order.createdAt)}
        </time>
      </p>
      {order.paidAt && (
        <p>
          ชำระเงิน:{" "}
          <time dateTime={order.paidAt}>
            {formatMerchandiseTime(order.paidAt)}
          </time>
        </p>
      )}
      <p>เวลาไทย</p>
    </div>
  );
}
export function OrderOriginal({ order }: { order: OrderDetail }) {
  if (order.effectiveRevision <= order.original.revision) return null;
  const recipient = order.original.recipient;
  return (
    <section
      className="merch-order-original"
      aria-label="ข้อมูลเดิมและข้อมูลปัจจุบัน"
    >
      <p>
        แสดงข้อมูลคำสั่งซื้อปัจจุบันที่เจ้าหน้าที่ปรับปรุงล่าสุด ครั้งที่{" "}
        {order.effectiveRevision} ·{" "}
        {formatMerchandiseTime(order.effective.createdAt)}
      </p>
      <details>
        <summary>ดูข้อมูลเดิมเมื่อสั่งซื้อ</summary>
        <h2>รายการสินค้าเดิม</h2>
        {order.original.items.map((item) => (
          <article className="merch-order-item" key={item.id}>
            <h3>
              {item.nameTh} × {item.quantity}
            </h3>
            <p>
              {[item.colorTh, item.sizeTh].filter(Boolean).join(" · ") ||
                (item.kind === "bundle" ? "ชุดสินค้า" : "ไม่มีตัวเลือก")}
            </p>
            <p>
              ราคาต่อหน่วย {formatMinorBaht(item.unitPriceMinor)} · รวม{" "}
              {formatMinorBaht(item.lineTotalMinor)}
            </p>
            {item.components.length > 0 && (
              <ul>
                {item.components.map((part, index) => (
                  <li key={index}>
                    {part.nameTh} × {part.quantityPerBundle} ต่อชุด ·{" "}
                    {[part.colorTh, part.sizeTh].filter(Boolean).join(" · ") ||
                      "ไม่มีตัวเลือก"}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
        <h2>ผู้รับและที่อยู่เดิม</h2>
        <address>
          {recipient.fullName}
          <br />
          {recipient.phone}
          <br />
          {recipient.company && (
            <>
              {recipient.company}
              <br />
            </>
          )}
          {recipient.addressLine}
          <br />
          {recipient.subdistrict} {recipient.district}
          <br />
          {recipient.province} {recipient.postalCode}
          <br />
          ประเทศไทย
          {recipient.deliveryNote && (
            <p>หมายเหตุจัดส่ง: {recipient.deliveryNote}</p>
          )}
        </address>
      </details>
    </section>
  );
}
