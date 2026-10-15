"use client";
import type { RefObject } from "react";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { OrderDelivery, OrderOriginal, OrderTimes } from "./OrderRecord";
import { formatMinorBaht } from "@/lib/merchandiseFormat";
import type { OrderDetail } from "@/types/merchandise";
export default function PaidOrder({
  order,
  barRef,
}: {
  order: OrderDetail;
  barRef: RefObject<HTMLDivElement | null>;
}) {
  const recipient = order.effective.recipient;
  const shipped = order.fulfillment.status === "shipped";
  return (
    <main
      className={`merch-cart merch-order merch-paid${shipped ? " merch-shipped" : ""}`}
    >
      {shipped && (
        <Link className="merch-cart-back" href="/souvenirs/orders">
          <ArrowLeft size={18} aria-hidden="true" />
          กลับหน้าประวัติ
        </Link>
      )}
      <h1>{shipped ? "รายละเอียดคำสั่งซื้อ" : "ชำระเงินสำเร็จ"}</h1>
      {shipped ? (
        <p className="merch-cart-muted">คำสั่งซื้อ {order.orderNumber}</p>
      ) : (
        <section className="merch-paid-thanks" role="status">
          <span className="merch-paid-icon">
            <Check size={32} aria-hidden="true" />
          </span>
          <h2>ขอบคุณสำหรับคำสั่งซื้อ</h2>
          <p>
            เลขคำสั่งซื้อ <strong>{order.orderNumber}</strong>
          </p>
          <span className="merch-paid-badge">ชำระเงินสำเร็จ</span>
          <p>
            ระบบจะส่งรายละเอียดไปที่
            <br />
            {order.buyer.email}
          </p>
        </section>
      )}
      <OrderDelivery order={order} />
      <OrderOriginal order={order} />
      <div className="merch-cart-grid" id="order-details" tabIndex={-1}>
        <div>
          <section className="merch-review-section" aria-label="รายการสินค้า">
            {order.effective.items.map((item) => (
              <article
                className="merch-order-item merch-paid-item"
                key={item.id}
              >
                <h2>{item.nameTh}</h2>
                <p>
                  {[item.colorTh, item.sizeTh].filter(Boolean).join(" · ") ||
                    (item.kind === "bundle" ? "ชุดสินค้า" : "ไม่มีตัวเลือก")}
                </p>
                <p>
                  <strong>{formatMinorBaht(item.unitPriceMinor)}</strong> ·{" "}
                  {item.quantity} {item.kind === "bundle" ? "ชุด" : "ชิ้น"} ·
                  รวม {formatMinorBaht(item.lineTotalMinor)}
                </p>
                {item.components.length > 0 && (
                  <ul>
                    {item.components.map((part, index) => (
                      <li key={index}>
                        {part.nameTh} × {part.quantityPerBundle} ·{" "}
                        {[part.colorTh, part.sizeTh]
                          .filter(Boolean)
                          .join(" · ") || "ไม่มีตัวเลือก"}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>
          <section className="merch-review-section">
            <h2>ที่อยู่จัดส่ง</h2>
            <address>
              <strong>{recipient.fullName}</strong>
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
          </section>
          <OrderTimes order={order} />
          <p className="merch-order-unboxing">
            กรุณาถ่ายวิดีโอขณะแกะพัสดุ เพื่อใช้เป็นหลักฐานหากพบสินค้าเสียหาย
            หากพบปัญหา
            กรุณาติดต่อเจ้าหน้าที่พร้อมเลขคำสั่งซื้อและหลักฐานที่เกี่ยวข้อง
          </p>
          <p className="merch-order-support">
            หากต้องการแก้ไขคำสั่งซื้อ กรุณาติดต่อ{" "}
            <a
              href={`mailto:pr@pharmacycouncil.org?subject=${encodeURIComponent(`คำสั่งซื้อ ${order.orderNumber}`)}`}
            >
              pr@pharmacycouncil.org
            </a>{" "}
            พร้อมเลขคำสั่งซื้อ
          </p>
        </div>
        <section className="merch-paid-summary">
          <h2>สรุปคำสั่งซื้อ</h2>
          <dl>
            <div>
              <dt>ค่าสินค้า</dt>
              <dd>{formatMinorBaht(order.amounts.subtotalMinor)}</dd>
            </div>
            <div>
              <dt>ค่าจัดส่ง</dt>
              <dd>{formatMinorBaht(order.amounts.shippingMinor)}</dd>
            </div>
            <div className="merch-paid-total">
              <dt>ยอดชำระรวม</dt>
              <dd>{formatMinorBaht(order.amounts.totalMinor)}</dd>
            </div>
          </dl>
          <p>
            จัดส่งภายในประเทศไทย
            <br />
            รวมสินค้าทุกรายการในออเดอร์เดียวกัน
          </p>
        </section>
      </div>
      {!shipped && (
        <div className="merch-cart-bar merch-order-bar" ref={barRef}>
          <a href="#order-details">
            ดูรายละเอียดคำสั่งซื้อ <ArrowRight size={22} aria-hidden="true" />
          </a>
        </div>
      )}
    </main>
  );
}
