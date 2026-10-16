"use client";
import { OrderCardSkeleton } from "./MerchSkeletons";
import { useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatBaht } from "@/lib/merchandiseFormat";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import type { OrderDetail, PaymentState } from "@/types/merchandise";
import { MerchandiseAuthBoundary } from "./MerchandiseAuthBoundary";
import PaidOrder, { JustPaidCard } from "./PaidOrder";
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
        <OrderCardSkeleton />
      )}
    </main>
  );
}

const isPaid = (o: OrderDetail) =>
  o.paymentStatus === "paid" || o.payment.state === "paid";
// States in which the buyer can still pay; others (closed, staff review) show the details.
const PAYABLE: ReadonlySet<PaymentState> = new Set([
  "awaiting_qr",
  "qr_active",
  "verifying",
  "qr_expired_open",
  "check_failed",
]);

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
  const [initialPaid] = useState(() => isPaid(initial));
  const paid = isPaid(order);
  const { recipient, amounts } = order;
  const panel = (
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
  );
  const justPaid = paid && !initialPaid;
  if (justPaid || (!paid && PAYABLE.has(order.payment.state)))
    return (
      <main className="merch-cart merch-order merch-pay">
        <div className="merch-pay-card">
          <Image
            src="/assets/Img/logo/Logo-Final .png"
            alt="PRIS 2026"
            width={200}
            height={80}
            className="brightness-0 h-10 w-auto mx-auto"
          />
          <h1 className="merch-pay-number">คำสั่งซื้อ {order.orderNumber}</h1>
          {justPaid ? (
            <JustPaidCard orderNumber={order.orderNumber} />
          ) : (
            panel
          )}
        </div>
      </main>
    );
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
        <div>{paid ? <PaidOrder order={order} /> : panel}</div>
      </div>
    </main>
  );
}
