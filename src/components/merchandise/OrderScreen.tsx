"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatBaht } from "@/lib/merchandiseFormat";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import type { OrderDetail } from "@/types/merchandise";
import { MerchandiseAuthBoundary } from "./MerchandiseAuthBoundary";
import PaidOrder from "./PaidOrder";
import PaymentPanel from "./PaymentPanel";
import { takePrimedOrder, useMerchandiseOrder } from "./useMerchandiseOrder";
import { usePaymentPolling } from "./usePaymentPolling";

export default function OrderScreen({ orderId }: { orderId: string }) {
  return (
    <MerchandiseAuthBoundary>
      <OrderLoader key={orderId} orderId={orderId} />
    </MerchandiseAuthBoundary>
  );
}

function OrderLoader({ orderId }: { orderId: string }) {
  // Checkout hands over the order it just created; otherwise load it.
  const [primed] = useState(() => {
    const taken = takePrimedOrder(orderId);
    return taken && taken.order.id.toLowerCase() === orderId.toLowerCase()
      ? taken
      : null;
  });
  const resource = useMerchandiseOrder(orderId, primed === null);
  const order = primed?.order ?? resource.data;
  if (order)
    return (
      <OrderWorkspace
        orderId={orderId}
        initial={order}
        receivedAt={primed?.receivedAt}
      />
    );
  const error = resource.error;
  return (
    <main className="merch-cart merch-order">
      {error?.status === 404 ? (
        <>
          <h1>ไม่พบคำสั่งซื้อ</h1>
          <Link className="merch-cart-secondary" href="/souvenirs/orders">
            ไปหน้าประวัติคำสั่งซื้อ
          </Link>
        </>
      ) : error ? (
        <>
          <p role="alert">{error.message}</p>
          {error.status === 401 ? (
            <Link
              className="merch-cart-secondary"
              href={merchandiseLoginPath(`/souvenirs/orders/${orderId}`, true)}
            >
              เข้าสู่ระบบอีกครั้ง
            </Link>
          ) : (
            <button
              className="merch-cart-secondary"
              type="button"
              onClick={resource.reload}
            >
              ลองโหลดอีกครั้ง
            </button>
          )}
        </>
      ) : (
        <p role="status">กำลังโหลดคำสั่งซื้อ</p>
      )}
    </main>
  );
}

function OrderWorkspace({
  orderId,
  initial,
  receivedAt,
}: {
  orderId: string;
  initial: OrderDetail;
  receivedAt?: { monotonicMs: number; wallMs: number };
}) {
  const polling = usePaymentPolling(orderId, initial, receivedAt);
  const { order } = polling;
  const paid = order.paymentStatus === "paid" || order.payment.state === "paid";
  const { recipient, amounts } = order;
  return (
    <main className="merch-cart merch-order">
      <Link className="merch-cart-back" href="/souvenirs/orders">
        <ArrowLeft size={18} aria-hidden="true" />
        กลับหน้าประวัติ
      </Link>
      <h1>คำสั่งซื้อ {order.orderNumber}</h1>
      <div className="merch-cart-grid">
        <div>
          <section className="merch-review-section" aria-label="รายการสินค้า">
            {order.items.map((item) => (
              <article className="merch-order-item" key={item.id}>
                <h3>{item.nameTh}</h3>
                {(item.colorTh || item.sizeTh) && (
                  <p>
                    {[item.colorTh, item.sizeTh].filter(Boolean).join(" · ")}
                  </p>
                )}
                <p>
                  {formatBaht(item.unitPriceBaht)} × {item.quantity} ={" "}
                  {formatBaht(item.lineTotalBaht)}
                </p>
                {item.components.length > 0 && (
                  <ul>
                    {item.components.map((part, index) => (
                      <li key={index}>
                        {part.nameTh} × {part.quantityPerBundle}
                        {(part.colorTh || part.sizeTh) &&
                          ` · ${[part.colorTh, part.sizeTh].filter(Boolean).join(" · ")}`}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
            <dl className="merch-order-amounts">
              <div>
                <dt>ค่าสินค้า</dt>
                <dd>{formatBaht(amounts.subtotalBaht)}</dd>
              </div>
              <div>
                <dt>ค่าจัดส่ง</dt>
                <dd>{formatBaht(amounts.shippingBaht)}</dd>
              </div>
              <div>
                <dt>ยอดรวม</dt>
                <dd>{formatBaht(amounts.totalBaht)}</dd>
              </div>
            </dl>
          </section>
          <section className="merch-review-section" aria-label="ผู้รับ">
            <h2>ผู้รับ</h2>
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
              {recipient.deliveryNote && (
                <>
                  <br />
                  หมายเหตุจัดส่ง: {recipient.deliveryNote}
                </>
              )}
            </address>
          </section>
          {(order.productionInfoTh || order.shippingInfoTh) && (
            <section
              className="merch-review-section"
              aria-label="ข้อมูลการผลิตและจัดส่ง"
            >
              {order.productionInfoTh && <p>{order.productionInfoTh}</p>}
              {order.shippingInfoTh && <p>{order.shippingInfoTh}</p>}
            </section>
          )}
        </div>
        <div>
          {paid ? (
            <PaidOrder order={order} />
          ) : (
            <PaymentPanel
              order={order}
              busy={polling.busy}
              expiredLocally={polling.expiredLocally}
              remainingMs={polling.remainingMs}
              locked={polling.locked}
              notice={polling.notice}
              unauthorized={polling.unauthorized}
              onRequestQr={() => void polling.requestQr()}
              onCheck={() => void polling.check()}
            />
          )}
        </div>
      </div>
    </main>
  );
}
