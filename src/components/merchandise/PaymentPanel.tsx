"use client";
import Image from "next/image";
import { Download, Loader2, Clock3, CircleAlert } from "lucide-react";
import type { OrderDetail, PaymentView } from "@/types/merchandise";
import {
  formatMerchandiseTime,
  formatMinorBaht,
} from "@/lib/merchandiseFormat";
import { useOwnerQr } from "./useOwnerQr";
import { formatPaymentRemaining, mayRequestQr } from "@/lib/merchandisePayment";
export default function PaymentPanel({
  order,
  busy,
  onCreate,
  creating,
  payment: view,
  remaining,
}: {
  order: OrderDetail;
  busy: boolean;
  onCreate(): void;
  creating: boolean;
  payment: PaymentView;
  remaining: number | null;
}) {
  const payment: PaymentView =
    busy && order.paymentStatus !== "paid"
      ? {
          ...view,
          state: creating ? "creating" : "checking",
          attempt: view.attempt
            ? { ...view.attempt, qrAvailable: false }
            : null,
        }
      : view;
  const qr = useOwnerQr(order.id, payment);
  const expired = [
    "qr_expired_open",
    "qr_expired_closed",
    "qr_expired_unavailable",
  ].includes(payment.state);
  const unknown = payment.state === "verification_unknown";
  return (
    <section className="merch-payment-panel" aria-label="การชำระเงิน">
      <div className="merch-payment-heading">
        <h2>Thai QR PromptPay</h2>
        <span>
          {order.paymentStatus === "paid"
            ? "ชำระเงินสำเร็จ"
            : payment.state === "creating" || creating
              ? "กำลังสร้าง QR"
              : payment.state === "checking"
                ? "กำลังตรวจสอบ"
                : expired
                  ? payment.state === "qr_expired_closed"
                    ? "หมดเวลาชำระเงิน"
                    : "QR หมดอายุ"
                  : unknown
                    ? "ตรวจสอบไม่ได้"
                    : payment.state === "review_required"
                      ? "รอเจ้าหน้าที่ตรวจสอบ"
                      : "รอชำระเงิน"}
        </span>
      </div>
      <p className="merch-payment-amount">
        {formatMinorBaht(order.amounts.totalMinor)}
      </p>
      {order.paymentStatus === "paid" ? (
        <p role="status">ตรวจสอบการชำระเงินสำเร็จแล้ว</p>
      ) : (
        <>
          {qr.url && (
            <>
              <Image
                unoptimized
                className="merch-payment-qr"
                src={qr.url}
                alt={`QR สำหรับชำระเงินคำสั่งซื้อ ${order.orderNumber}`}
                width={280}
                height={280}
              />
              <p
                className="merch-payment-countdown"
                role="timer"
                aria-live="off"
              >
                เวลาชำระเงินคงเหลือ {formatPaymentRemaining(remaining ?? 0)}
              </p>
              <p className="merch-cart-muted">
                หมดอายุ {formatMerchandiseTime(payment.attempt!.expiresAt)}{" "}
                (เวลาไทย)
              </p>
              <a
                className="merch-qr-save"
                href={qr.url}
                download={`souvenir-payment-${order.orderNumber}.png`}
              >
                <Download size={18} aria-hidden="true" />
                บันทึกภาพ QR
              </a>
              <p>
                ใช้แอปธนาคารสแกนหรือเลือกรูป QR
                <br />
                แล้วกลับมาตรวจสอบผลบนหน้านี้
              </p>
            </>
          )}
          {(busy ||
            payment.state === "creating" ||
            payment.state === "checking" ||
            qr.loading) && (
            <div className="merch-payment-working" role="status">
              <Loader2
                className="merch-payment-spinner"
                size={30}
                aria-hidden="true"
              />
              <p>
                {payment.state === "creating" || creating
                  ? "กำลังเตรียม QR สำหรับออเดอร์เดิม"
                  : busy || payment.state === "checking"
                    ? "กำลังตรวจสอบการชำระเงิน"
                    : "กำลังโหลด QR"}
              </p>
            </div>
          )}
          {qr.error && (
            <div role="alert">
              <p>โหลด QR ไม่สำเร็จ กรุณาตรวจสอบสถานะหรือลองโหลดอีกครั้ง</p>
              <button
                className="merch-cart-secondary"
                type="button"
                onClick={qr.reload}
              >
                ลองโหลด QR อีกครั้ง
              </button>
            </div>
          )}
          {expired && !busy && (
            <>
              <div className="merch-payment-working">
                <Clock3 size={40} aria-hidden="true" />
                <p>QR เดิมใช้ชำระเงินไม่ได้แล้ว</p>
              </div>
              {payment.state === "qr_expired_closed" ? (
                <p className="merch-payment-closed" role="status">
                  หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว
                </p>
              ) : payment.state === "qr_expired_unavailable" ? (
                <p role="status">
                  QR หมดอายุ ขณะนี้ร้านยังไม่พร้อมรับชำระเงิน
                  กรุณาติดต่อเจ้าหน้าที่
                </p>
              ) : (
                <p role="status">
                  QR หมดอายุ ตรวจสอบแล้ว ยังไม่พบการชำระสำเร็จ
                  {payment.canRequestNewQr
                    ? " ขอ QR ใหม่สำหรับออเดอร์เดิมได้"
                    : " กรุณาตรวจสอบอีกครั้งก่อนขอ QR ใหม่"}
                </p>
              )}
            </>
          )}
          {(unknown || payment.state === "review_required") && !busy && (
            <div className="merch-payment-working" role="status">
              <CircleAlert size={36} aria-hidden="true" />
              <p>
                {unknown
                  ? "ตรวจสอบสถานะไม่สำเร็จ กรุณาลองตรวจสอบอีกครั้ง"
                  : "รายการนี้ต้องให้เจ้าหน้าที่ตรวจสอบ กรุณาติดต่อพร้อมเลขคำสั่งซื้อ"}
              </p>
            </div>
          )}
          {!qr.url &&
            !qr.loading &&
            !busy &&
            payment.state === "not_created" && (
              <div role="status">
                <p>
                  {payment.state === "not_created"
                    ? "คำสั่งซื้อถูกยืนยันแล้ว ยังไม่มี QR สำหรับชำระเงิน"
                    : "กำลังตรวจสอบสถานะการชำระเงิน กรุณาตรวจสอบอีกครั้ง"}
                </p>
                {mayRequestQr(payment) && (
                  <button
                    className="merch-cart-secondary"
                    type="button"
                    onClick={onCreate}
                  >
                    สร้าง QR สำหรับออเดอร์นี้
                  </button>
                )}
              </div>
            )}
        </>
      )}
      <div className="merch-payment-breakdown">
        <p>เลขคำสั่งซื้อ {order.orderNumber}</p>
        <p>
          ค่าสินค้า {formatMinorBaht(order.amounts.subtotalMinor)} + ค่าจัดส่ง{" "}
          {formatMinorBaht(order.amounts.shippingMinor)}
        </p>
      </div>
    </section>
  );
}
