"use client";
import Image from "next/image";
import { Download, Loader2 } from "lucide-react";
import type { OrderDetail, PaymentView } from "@/types/merchandise";
import {
  formatMerchandiseTime,
  formatMinorBaht,
} from "@/lib/merchandiseFormat";
import { useOwnerQr } from "./useOwnerQr";
export default function PaymentPanel({
  order,
  busy,
  onExpired,
  onCreate,
  creating,
}: {
  order: OrderDetail;
  busy: boolean;
  onExpired(): void;
  onCreate(): void;
  creating: boolean;
}) {
  const payment: PaymentView =
    busy && !creating && order.paymentStatus !== "paid"
      ? {
          ...order.payment,
          state: "checking",
          attempt: order.payment.attempt
            ? { ...order.payment.attempt, qrAvailable: false }
            : null,
        }
      : order.payment;
  const qr = useOwnerQr(order.id, payment, onExpired);
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
          {(busy || payment.state === "creating" || qr.loading) && (
            <div className="merch-payment-working" role="status">
              <Loader2 size={30} aria-hidden="true" />
              <p>
                {payment.state === "creating" || creating
                  ? "กำลังเตรียม QR สำหรับออเดอร์เดิม"
                  : busy
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
          {!qr.url && !qr.loading && !busy && payment.state !== "creating" && (
            <div role="status">
              <p>
                {payment.state === "not_created"
                  ? "คำสั่งซื้อถูกยืนยันแล้ว ยังไม่มี QR สำหรับชำระเงิน"
                  : "กำลังตรวจสอบสถานะการชำระเงิน กรุณาตรวจสอบอีกครั้ง"}
              </p>
              {payment.state === "not_created" && payment.canRequestNewQr && (
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
