"use client";
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";

// The payload is drawn off-screen and only its rendered PNG is shown, so the
// buyer can long-press or save it. The payload itself stays in memory: never
// in storage, a URL or a log. The parent unmounts this when the QR is not live.
export default function PaymentQr({
  payload,
  orderNumber,
}: {
  payload: string;
  orderNumber: string;
}) {
  const canvasHost = useRef<HTMLDivElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => {
    const canvas = canvasHost.current?.querySelector("canvas");
    // Deferred so the state change is not synchronous inside the effect.
    void Promise.resolve().then(() =>
      setDataUrl(canvas ? canvas.toDataURL("image/png") : null),
    );
    return () => setDataUrl(null);
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="merch-payment-qr"
            src={dataUrl}
            alt={`QR สำหรับชำระเงินคำสั่งซื้อ ${orderNumber}`}
            width={280}
            height={280}
          />
          <a
            className="merch-qr-save"
            href={dataUrl}
            download={`souvenir-payment-${orderNumber}.png`}
          >
            <Download size={18} aria-hidden="true" />
            บันทึกภาพ QR
          </a>
          <p className="merch-cart-muted">
            ถ้าบันทึกไม่ได้ ให้กดค้างที่รูป QR หรือแคปหน้าจอ
            แล้วเลือกรูปในแอปธนาคาร
          </p>
        </>
      )}
    </>
  );
}
