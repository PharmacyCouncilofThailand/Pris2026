"use client";
import { MerchandiseAuthBoundary } from "./MerchandiseAuthBoundary";

// Placeholder: the order page is rewritten in Task 9 (it will consume
// takePrimedOrder from ./useMerchandiseOrder). Kept compilable so checkout can
// hand off to a real route in the meantime.
export default function OrderScreen({ orderId }: { orderId: string }) {
  return (
    <MerchandiseAuthBoundary>
      <main className="merchandise-host-message" data-order-id={orderId}>
        <p role="status">กำลังโหลดคำสั่งซื้อ</p>
      </main>
    </MerchandiseAuthBoundary>
  );
}
