"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { QRCodeCanvas } from "qrcode.react";

// The payload is drawn off-screen and only its rendered PNG is shown, so the
// buyer can long-press or save it. The payload itself stays in memory: never
// in storage, a URL or a log. The parent unmounts this when the QR is not live.
export default function PaymentQr({
  payload,
  orderNumber,
  children,
  message,
}: {
  payload: string;
  orderNumber: string;
  // Rendered between the QR image and the hint (the time line).
  children?: ReactNode;
  // Shown after the hint only when the image rendered; a fallback otherwise.
  message?: string | null;
}) {
  const canvasHost = useRef<HTMLDivElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const canvas = canvasHost.current?.querySelector("canvas");
    // Deferred so the state change is not synchronous inside the effect.
    void Promise.resolve().then(() => {
      let url: string | null = null;
      try {
        url = canvas ? canvas.toDataURL("image/png") : null;
      } catch {
        url = null;
      }
      setDataUrl(url || null);
      setFailed(!url);
    });
    return () => {
      setDataUrl(null);
      setFailed(false);
    };
  }, [payload]);
  return (
    <>
      <div
        ref={canvasHost}
        aria-hidden="true"
        style={{ position: "absolute", left: -10000, top: 0 }}
      >
        <QRCodeCanvas value={payload} level="M" size={560} marginSize={4} />
      </div>
      {dataUrl && (
        <>
          <span className="merch-payment-qr-brand" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="merch-payment-qr"
            src={dataUrl}
            alt={`QR สำหรับชำระเงินคำสั่งซื้อ ${orderNumber}`}
            width={280}
            height={280}
          />
          {children}
          <p className="merch-cart-muted">
            โปรดจับภาพหน้าจอนี้เพื่อบันทึก QR code
            จากนั้นเลือกรูปในแอปธนาคารเพื่อดำเนินการชำระเงิน
          </p>
          {message && (
            <p className="merch-payment-message" role="status">
              {message}
            </p>
          )}
        </>
      )}
      {!dataUrl && (
        <>
          {children}
          {failed && (
            <p className="merch-payment-message" role="status">
              แสดง QR ไม่สำเร็จ กรุณากดตรวจสอบหรือโหลดหน้าใหม่
            </p>
          )}
        </>
      )}
    </>
  );
}
