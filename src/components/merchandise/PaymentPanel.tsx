"use client";
import { Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { OrderDetail } from "@/types/merchandise";
import { formatBaht } from "@/lib/merchandiseFormat";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import { formatPaymentRemaining, panelModel } from "@/lib/merchandisePayment";
import PaymentQr from "./PaymentQr";
import type { PaymentBusy } from "./usePaymentPolling";

const LABEL = { request_qr: "ขอ QR", check: "ตรวจสอบการชำระเงิน" } as const;
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export default function PaymentPanel({
  order,
  busy,
  expiredLocally,
  remainingMs,
  locked,
  notice,
  unauthorized,
  onRequestQr,
  onCheck,
}: {
  order: OrderDetail;
  busy: PaymentBusy;
  expiredLocally: boolean;
  remainingMs: number | null;
  locked: boolean;
  notice: string | null;
  unauthorized: boolean;
  onRequestQr(): void;
  onCheck(): void;
}) {
  const view = order.payment;
  const model = panelModel(view, { busy, expiredLocally }, order.orderNumber);
  // Which button the server allows, independent of the transient busy state.
  const idle = panelModel(
    view,
    { busy: null, expiredLocally },
    order.orderNumber,
  );
  const payload = view.attempt?.qrPayload;
  const expiresAt = view.attempt?.expiresAt;
  const label =
    idle.primary === "request_qr"
      ? idle.state === "qr_expired_open"
        ? "ขอ QR ใหม่"
        : LABEL.request_qr
      : idle.primary === "check"
        ? idle.state === "check_failed"
          ? "ตรวจสอบอีกครั้ง"
          : LABEL.check
        : null;
  return (
    <section
      className="merch-payment-panel"
      aria-labelledby="merch-payment-title"
    >
      <h2 id="merch-payment-title">{model.title}</h2>
      <p className="merch-payment-amount">
        {formatBaht(order.amounts.totalBaht)}
      </p>
      {busy && (
        <div className="merch-payment-working" role="status">
          <Loader2
            className="merch-payment-spinner"
            size={30}
            aria-hidden="true"
          />
          <span className="sr-only">{model.title}</span>
        </div>
      )}
      {model.showQr && payload && (
        <PaymentQr
          payload={payload}
          orderNumber={order.orderNumber}
          message={busy ? null : model.message}
        >
          {remainingMs !== null && (
            <p className="merch-payment-time" role="timer" aria-live="off">
              ชำระภายใน {formatPaymentRemaining(remainingMs)}
              {expiresAt &&
                ` · หมดอายุ ${clock.format(new Date(expiresAt))} น.`}
            </p>
          )}
        </PaymentQr>
      )}
      {!(model.showQr && payload) && !busy && model.message && (
        <p className="merch-payment-message" role="status">
          {model.message}
        </p>
      )}
      {label && idle.primary && (
        <button
          className="merch-cart-secondary"
          type="button"
          disabled={busy !== null || locked}
          onClick={idle.primary === "check" ? onCheck : onRequestQr}
        >
          {label}
        </button>
      )}
      {notice && (
        <p className="merch-payment-notice" role="alert">
          {notice}
        </p>
      )}
      {unauthorized && (
        <Link
          className="merch-cart-secondary"
          href={merchandiseLoginPath(`/souvenirs/orders/${order.id}`, true)}
        >
          เข้าสู่ระบบอีกครั้ง
        </Link>
      )}
    </section>
  );
}
